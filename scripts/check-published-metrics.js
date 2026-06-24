#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const SNAPSHOT_FILE = path.join(DATA_DIR, 'quality-snapshot.json');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');

function read(relativePath) {
  return fs.readFileSync(path.join(ROOT_DIR, relativePath), 'utf8');
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function formatNumber(value) {
  return Number(value).toLocaleString('en-US');
}

function metricText(metric) {
  return `${metric.formatted}${metric.note ? ` (${metric.note})` : ''}`;
}

function loadTechnologies() {
  return fs.readdirSync(DATA_DIR)
    .filter(isTechnologyDataFile)
    .sort()
    .flatMap(file => readJson(path.join(DATA_DIR, file)));
}

function assert(errors, condition, message) {
  if (!condition) errors.push(message);
}

function requireIncludes(errors, file, content, expected, label) {
  assert(errors, content.includes(expected), `${file} missing or stale ${label}: expected ${expected}`);
}

function parseLlmMetrics(content) {
  const metrics = new Map();
  for (const line of content.split(/\r?\n/)) {
    const match = /^-\s*([^:]+):\s*(.+)$/u.exec(line.trim());
    if (match) metrics.set(match[1].trim(), match[2].trim());
  }
  return metrics;
}

function techPageCountFromSitemap(content) {
  return Array.from(content.matchAll(/<loc>https:\/\/pushme\.site\/techtree\/tech\/[^<]+\.html<\/loc>/gu)).length;
}

function main() {
  const errors = [];
  const technologies = loadTechnologies();
  const snapshot = readJson(SNAPSHOT_FILE);
  const taxonomy = readJson(TAXONOMY_FILE);
  const total = technologies.length;
  const formattedTotal = formatNumber(total);
  const plainTotal = String(total);
  const fieldCount = Object.keys(taxonomy.fields || {}).length;
  const metricRows = snapshot.metrics || [];

  assert(errors, snapshot.riskReportTotals?.totalTechnologies === total, `data/quality-snapshot.json totalTechnologies is ${snapshot.riskReportTotals?.totalTechnologies}, expected ${total}`);
  assert(errors, metricRows.find(metric => metric.label === 'Technologies')?.value === total, `Technologies metric does not match data count ${total}`);

  const readme = read('README.md');
  requireIncludes(errors, 'README.md', readme, `https://img.shields.io/badge/technologies-${plainTotal}-6f42c1.svg`, 'technology badge count');
  requireIncludes(errors, 'README.md', readme, `**${formattedTotal} validated technologies**`, 'validated technologies count');
  for (const metric of metricRows) {
    requireIncludes(errors, 'README.md', readme, `| ${metric.label} | ${metricText(metric)} |`, `${metric.label} metric row`);
  }

  const snapshotMarkdown = read('docs/QUALITY_SNAPSHOT.md');
  for (const metric of metricRows) {
    requireIncludes(errors, 'docs/QUALITY_SNAPSHOT.md', snapshotMarkdown, `| ${metric.label} | ${metricText(metric)} |`, `${metric.label} metric row`);
  }

  const llms = read('llms.txt');
  const llmMetrics = parseLlmMetrics(llms);
  assert(errors, llmMetrics.get('Total technology pages') === plainTotal, `llms.txt Total technology pages is ${llmMetrics.get('Total technology pages')}, expected ${plainTotal}`);
  assert(errors, llmMetrics.get('Total field pages') === String(fieldCount), `llms.txt Total field pages is ${llmMetrics.get('Total field pages')}, expected ${fieldCount}`);
  for (const metric of metricRows) {
    assert(errors, llmMetrics.get(metric.label) === metricText(metric), `llms.txt ${metric.label} is ${llmMetrics.get(metric.label)}, expected ${metricText(metric)}`);
  }

  const sorted = read('sorted.html');
  requireIncludes(
    errors,
    'sorted.html',
    sorted,
    `Scan ${formattedTotal} validated technologies by era, field, branch, dependency depth, and roadmap status.`,
    'Open Graph technology count'
  );

  const runbook = read('docs/TECH_EXPANSION_RUNBOOK.md');
  requireIncludes(errors, 'docs/TECH_EXPANSION_RUNBOOK.md', runbook, `- Current validated size after the latest quality/demo pass: ${formattedTotal} curated technologies`, 'current validated size');
  assert(errors, !runbook.includes('Current headline:'), 'docs/TECH_EXPANSION_RUNBOOK.md contains ambiguous historical "Current headline" wording');

  const sitemap = read('sitemap.xml');
  assert(errors, techPageCountFromSitemap(sitemap) === total, `sitemap.xml tech URL count is ${techPageCountFromSitemap(sitemap)}, expected ${total}`);

  if (errors.length) {
    console.error(`Published metric check failed with ${errors.length} issue(s):`);
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`Published metrics align with ${formattedTotal} technologies, ${fieldCount} field pages, and ${metricRows.length} quality snapshot metrics.`);
}

main();

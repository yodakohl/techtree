#!/usr/bin/env node
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');
const { buildOutputs } = require('./generate-public-site');

const ROOT_DIR = path.join(__dirname, '..');
const BASE_URL = 'https://pushme.site/techtree';
const LLMS_FILE = path.join(ROOT_DIR, 'llms.txt');
const SITEMAP_FILE = path.join(ROOT_DIR, 'sitemap.xml');

function checksum(content) {
  return crypto.createHash('sha1').update(content, 'utf8').digest('hex');
}

function buildInTempDir() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'techtree-public-'));
  const result = buildOutputs({ outputDir: tempDir });
  return { tempDir, result };
}

function parseLlmMetrics(lines) {
  const metrics = new Map();
  for (const line of lines) {
    const match = /^-\s*(.*?):\s*(.*)$/u.exec(line);
    if (!match) continue;
    metrics.set(match[1].trim(), match[2].trim());
  }
  return metrics;
}

function normalizeMetric(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\(.*?\)/g, '')
    .replace(/,/g, '')
    .trim();
}

function checkSitemapCoverage(result) {
  if (!fs.existsSync(SITEMAP_FILE)) {
    throw new Error('sitemap.xml is missing');
  }

  const sitemap = fs.readFileSync(SITEMAP_FILE, 'utf8');
  const urls = new Set(Array.from(sitemap.matchAll(/<loc>(.*?)<\/loc>/gu), match => match[1]));

  const required = [
    `${BASE_URL}/`,
    `${BASE_URL}/demo.html`,
    `${BASE_URL}/sorted.html`
  ];

  for (const item of result.technologies) {
    required.push(`${BASE_URL}/tech/${item.id}.html`);
  }

  for (const field of result.fieldPages) {
    required.push(`${BASE_URL}/fields/${field.slug}.html`);
  }

  const missing = required.filter(url => !urls.has(url));
  if (missing.length) {
    throw new Error(`sitemap is missing required URLs: ${missing.join(', ')}`);
  }
}

function checkLLMSMetrics(result) {
  if (!fs.existsSync(LLMS_FILE)) {
    throw new Error('llms.txt is missing');
  }

  const lines = fs.readFileSync(LLMS_FILE, 'utf8')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const actual = parseLlmMetrics(lines);
  for (const forbidden of ['Manual risk-weighted sample', 'passed after correction']) {
    if (lines.some(line => line.includes(forbidden))) {
      throw new Error(`llms.txt contains deprecated accuracy-metric wording: ${forbidden}`);
    }
  }
  const expectedMetrics = new Map(
    (result.snapshot.metrics || []).map(item => [item.label, item])
  );

  const metricLabels = [
    'Technologies',
    'Launch-quality scope (non-Future nodes)',
    'Source-checked nodes',
    'Source-checked nodes with non-placeholder dates',
    'Source-checked nodes with placeholder dates',
    'Source-checked nodes with primary/review/textbook/official sources',
    'Source-checked nodes using only weak/generic sources',
    'Nodes with node-level sources',
    'Dependency edges with edge-level sources',
    'Era-default placeholder dates'
  ];

  for (const label of metricLabels) {
    const expected = expectedMetrics.get(label);
    if (!expected) {
      throw new Error(`Missing expected metric in quality snapshot: ${label}`);
    }

    const actualValue = actual.get(label);
    if (!actualValue) {
      throw new Error(`llms.txt missing metric line for ${label}`);
    }

    const expectedValue = expected.note ? `${expected.formatted} (${expected.note})` : expected.formatted;
    if (normalizeMetric(actualValue) !== normalizeMetric(expectedValue)) {
      throw new Error(`llms.txt metric stale for ${label}: expected ${expectedValue}, found ${actualValue}`);
    }
  }
}

function checkGeneratedFilesMatch(result) {
  const expectedEntries = result.manifest;

  for (const [rel, expectedHash] of expectedEntries.entries()) {
    const actualFile = path.join(ROOT_DIR, rel);
    if (!fs.existsSync(actualFile)) {
      throw new Error(`Generated file missing in repository root: ${rel}`);
    }

    const actualHash = checksum(fs.readFileSync(actualFile, 'utf8'));
    if (actualHash !== expectedHash) {
      throw new Error(`Generated content mismatch: ${rel}`);
    }
  }
}

function checkDeterminism() {
  const first = buildInTempDir();
  const second = buildInTempDir();

  const firstDigest = JSON.stringify(Array.from(first.result.manifest.entries()).sort((a, b) => a[0].localeCompare(b[0])));
  const secondDigest = JSON.stringify(Array.from(second.result.manifest.entries()).sort((a, b) => a[0].localeCompare(b[0])));

  fs.rmSync(first.tempDir, { recursive: true, force: true });
  fs.rmSync(second.tempDir, { recursive: true, force: true });

  if (firstDigest !== secondDigest) {
    throw new Error('Public generation is non-deterministic');
  }
}

function main() {
  const expected = buildInTempDir();
  try {
    checkGeneratedFilesMatch(expected.result);
    checkSitemapCoverage(expected.result);
    checkLLMSMetrics(expected.result);
    checkDeterminism();
  } finally {
    fs.rmSync(expected.tempDir, { recursive: true, force: true });
  }

  console.log('Public artifact checks passed.');
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

module.exports = {
  checkGeneratedFilesMatch,
  checkSitemapCoverage,
  checkLLMSMetrics,
  checkDeterminism
};

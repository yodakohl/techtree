#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ERA_FILES = [
  'ancient.json',
  'classical.json',
  'medieval.json',
  'renaissance.json',
  'industrial.json',
  'modern.json',
  'future.json'
];

const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? Number(limitArg.split('=')[1]) : 40;

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sourceText(source) {
  return `${source.publisher || ''} ${source.title || ''} ${source.url || ''}`;
}

function sourceLabel(source) {
  let host = '';
  try {
    host = source.url ? new URL(source.url).hostname.replace(/^www\./, '') : '';
  } catch {
    host = 'invalid-url';
  }
  return `${source.publisher || source.title}:${source.source_type}${host ? `@${host}` : ''}`;
}

function isWikipedia(source) {
  return /wikipedia/i.test(sourceText(source));
}

function isInflatedWikipedia(source) {
  return isWikipedia(source) && !['weak_web', 'generic_overview'].includes(source.source_type);
}

function isWeakOrGeneric(source) {
  return ['weak_web', 'generic_overview'].includes(source.source_type);
}

function readCoverageText(dir) {
  if (!fs.existsSync(dir)) return '';
  return fs.readdirSync(dir)
    .filter(file => file.endsWith('.json'))
    .map(file => fs.readFileSync(path.join(dir, file), 'utf8'))
    .join('\n');
}

const nodes = [];
for (const file of ERA_FILES) {
  for (const node of readJson(path.join('data', file))) {
    nodes.push({ ...node, file });
  }
}

const dependentCounts = new Map(nodes.map(node => [node.id, 0]));
for (const node of nodes) {
  for (const prerequisite of node.prerequisites || []) {
    dependentCounts.set(prerequisite, (dependentCounts.get(prerequisite) || 0) + 1);
  }
}

const coverageText = [
  readCoverageText(path.join('docs', 'edge-change-receipts')),
  readCoverageText(path.join('docs', 'graph-invariants'))
].join('\n');

const candidates = [];
for (const node of nodes) {
  const sources = node.sources || [];
  if (node.reviewStatus !== 'source_checked' || sources.length === 0) continue;

  const inflatedWikipedia = sources.some(isInflatedWikipedia);
  const onlyWeakOrGeneric = sources.every(isWeakOrGeneric);
  const onlyWikipedia = sources.every(isWikipedia);
  if (!inflatedWikipedia && !onlyWeakOrGeneric && !onlyWikipedia) continue;

  candidates.push({
    id: node.id,
    name: node.name,
    era: node.era,
    date: node.firstKnownDate,
    file: node.file,
    dependents: dependentCounts.get(node.id) || 0,
    risk: [
      inflatedWikipedia ? 'inflated_wikipedia_source_type' : null,
      onlyWeakOrGeneric ? 'only_weak_or_generic_sources' : null,
      onlyWikipedia ? 'only_wikipedia_sources' : null
    ].filter(Boolean).join(','),
    alreadyCovered: coverageText.includes(`"${node.id}"`),
    sources: sources.map(sourceLabel).join('; ')
  });
}

candidates.sort((a, b) => {
  if (a.alreadyCovered !== b.alreadyCovered) return a.alreadyCovered ? 1 : -1;
  return b.dependents - a.dependents || a.id.localeCompare(b.id);
});

console.log('dependents\tcovered\tid\tname\tera\tdate\trisk\tsources');
for (const candidate of candidates.slice(0, limit)) {
  console.log([
    candidate.dependents,
    candidate.alreadyCovered ? 'yes' : 'no',
    candidate.id,
    candidate.name,
    candidate.era,
    candidate.date,
    candidate.risk,
    candidate.sources
  ].join('\t'));
}

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');

function usage() {
    console.error('Usage: node scripts/edge-review-packet.js dependent_id prerequisite_id [--issue 64]');
    process.exit(1);
}

function loadItems() {
    const items = [];
    for (const file of fs.readdirSync(DATA_DIR).filter(isTechnologyDataFile).sort()) {
        const filePath = path.join(DATA_DIR, file);
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        for (const item of parsed) items.push({ ...item, __file: file });
    }
    return items;
}

function sourceLines(sources) {
    if (!Array.isArray(sources) || !sources.length) return ['- none'];
    return sources.map(source => {
        const supports = Array.isArray(source.supports) ? `; supports: ${source.supports.join(', ')}` : '';
        const type = source.source_type ? `; type: ${source.source_type}` : '';
        return `- ${source.title || 'Untitled'} (${source.publisher || 'unknown'}, ${source.year || 'n.d.'})${type}${supports}\n  ${source.url || 'no url'}`;
    });
}

function printPacket({ dependent, prerequisite, edge, issue }) {
    const issueLine = issue ? `GitHub issue: https://github.com/yodakohl/techtree/issues/${issue}\n\n` : '';
    const fields = Array.isArray(dependent.fields) && dependent.fields.length ? dependent.fields.join(', ') : 'none';
    const currentEdge = edge
        ? `${edge.type} / ${edge.evidence_level} / ${edge.confidence}`
        : 'missing typed edge';
    const edgeSources = edge ? sourceLines(edge.sources).join('\n') : '- none';

    console.log(`# Edge Review Packet: ${dependent.id} -> ${prerequisite.id}

${issueLine}## Current Claim

- dependent: \`${dependent.id}\` (${dependent.name})
- prerequisite: \`${prerequisite.id}\` (${prerequisite.name})
- current edge: \`${currentEdge}\`
- dependent era/date: ${dependent.era}, ${dependent.firstKnownDate ?? 'unknown'} (${dependent.datePrecision || 'unknown'})
- prerequisite era/date: ${prerequisite.era}, ${prerequisite.firstKnownDate ?? 'unknown'} (${prerequisite.datePrecision || 'unknown'})
- dependent fields: ${fields}

## Dependent Node

${dependent.description}

Current prerequisites:
\`${(dependent.prerequisites || []).join('`, `')}\`

Node sources:
${sourceLines(dependent.sources).join('\n')}

## Prerequisite Node

${prerequisite.description}

Node sources:
${sourceLines(prerequisite.sources).join('\n')}

## Current Edge Sources

${edgeSources}

## Source-Locator Reply Format

Reply with this exact shape if you are not opening a PR:

\`\`\`text
Edge decision: required | enabling | accelerates | historical_predecessor | common_dependency | commercial_or_scaling_dependency | speculative | no edge
Source URL:
Source locator: section / abstract / figure / table inspected
Why this source licenses the edge verb:
Strongest reason this decision could be wrong:
What breaks if the prerequisite is absent:
\`\`\`

## PR Validation

\`\`\`bash
npm run edge-receipts
npm test
npm run quality
npm run coverage
\`\`\`
`);
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2) usage();

    const [dependentId, prerequisiteId] = args;
    const issueIndex = args.indexOf('--issue');
    const issue = issueIndex >= 0 ? args[issueIndex + 1] : null;
    const items = loadItems();
    const byId = new Map(items.map(item => [item.id, item]));
    const dependent = byId.get(dependentId);
    const prerequisite = byId.get(prerequisiteId);
    if (!dependent) throw new Error(`Unknown dependent id: ${dependentId}`);
    if (!prerequisite) throw new Error(`Unknown prerequisite id: ${prerequisiteId}`);

    const edge = (dependent.dependencyEdges || []).find(candidate => candidate.prerequisite === prerequisiteId);
    printPacket({ dependent, prerequisite, edge, issue });
}

main();

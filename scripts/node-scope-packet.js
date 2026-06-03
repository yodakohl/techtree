#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const ERA_ORDER = new Map([
    ['Ancient', 0],
    ['Classical', 1],
    ['Medieval', 2],
    ['Renaissance', 3],
    ['Industrial', 4],
    ['Modern', 5],
    ['Future', 6]
]);

function usage() {
    console.error('Usage: node scripts/node-scope-packet.js node_id [--issue 66] [--dependents-limit 60]');
    process.exit(1);
}

function loadItems() {
    const items = [];
    for (const file of fs.readdirSync(DATA_DIR).filter(name => name.endsWith('.json') && name !== 'taxonomy.json').sort()) {
        const filePath = path.join(DATA_DIR, file);
        const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        for (const item of parsed) items.push({ ...item, __file: file });
    }
    return items;
}

function parseArgs(args) {
    if (!args.length || args.includes('--help') || args.includes('-h')) usage();
    const nodeId = args[0];
    const issueIndex = args.indexOf('--issue');
    const limitIndex = args.indexOf('--dependents-limit');

    return {
        nodeId,
        issue: issueIndex >= 0 ? args[issueIndex + 1] : null,
        dependentsLimit: limitIndex >= 0 ? Number(args[limitIndex + 1]) : 60
    };
}

function sourceLines(sources) {
    if (!Array.isArray(sources) || !sources.length) return ['- none'];
    return sources.map(source => {
        const supports = Array.isArray(source.supports) ? `; supports: ${source.supports.join(', ')}` : '';
        const type = source.source_type ? `; type: ${source.source_type}` : '';
        return `- ${source.title || 'Untitled'} (${source.publisher || 'unknown'}, ${source.year || 'n.d.'})${type}${supports}\n  ${source.url || 'no url'}`;
    });
}

function dateLabel(item) {
    return `${item.era || 'unknown'}, ${item.firstKnownDate ?? 'unknown'} (${item.datePrecision || 'unknown'})`;
}

function fieldLabel(item) {
    return Array.isArray(item.fields) && item.fields.length ? item.fields.join(', ') : 'none';
}

function edgeTo(item, prerequisiteId) {
    return (item.dependencyEdges || []).find(edge => edge.prerequisite === prerequisiteId);
}

function sortByEraAndDate(left, right) {
    const eraDelta = (ERA_ORDER.get(left.era) ?? 99) - (ERA_ORDER.get(right.era) ?? 99);
    if (eraDelta) return eraDelta;
    const leftDate = typeof left.firstKnownDate === 'number' ? left.firstKnownDate : Number.MAX_SAFE_INTEGER;
    const rightDate = typeof right.firstKnownDate === 'number' ? right.firstKnownDate : Number.MAX_SAFE_INTEGER;
    if (leftDate !== rightDate) return leftDate - rightDate;
    return left.id.localeCompare(right.id);
}

function prerequisiteLines(item, byId) {
    const prerequisites = item.prerequisites || [];
    if (!prerequisites.length) return ['- none'];

    return prerequisites.map(id => {
        const prerequisite = byId.get(id);
        const edge = edgeTo(item, id);
        const name = prerequisite ? prerequisite.name : 'missing node';
        const date = prerequisite ? dateLabel(prerequisite) : 'missing date';
        const edgeMeta = edge
            ? `${edge.type}; ${edge.evidence_level}; confidence ${edge.confidence}; ${edge.reviewStatus || 'unknown'}`
            : 'missing typed edge';
        const note = edge && edge.note ? `\n  note: ${edge.note}` : '';
        const edgeSourceCount = edge && Array.isArray(edge.sources) ? edge.sources.length : 0;
        return `- \`${id}\` (${name}) - ${date}; ${edgeMeta}; edge sources: ${edgeSourceCount}${note}`;
    });
}

function dependentLines(nodeId, dependents, limit) {
    if (!dependents.length) return ['- none'];
    const shown = dependents.slice(0, limit);
    const lines = shown.map(item => {
        const edge = edgeTo(item, nodeId);
        const edgeMeta = edge
            ? `${edge.type}; ${edge.evidence_level}; confidence ${edge.confidence}; ${edge.reviewStatus || 'unknown'}`
            : 'bare prerequisite only';
        return `- \`${item.id}\` (${item.name}) - ${dateLabel(item)}; ${edgeMeta}; fields: ${fieldLabel(item)}`;
    });
    if (dependents.length > shown.length) {
        lines.push(`- ... ${dependents.length - shown.length} more dependents omitted; rerun with --dependents-limit ${dependents.length}`);
    }
    return lines;
}

function riskLines(item, byId, dependents) {
    const risks = [];
    const broadTerms = ['systems', 'technology', 'technologies', 'science', 'engineering', 'materials'];
    const lowerName = `${item.name || ''} ${item.description || ''}`.toLowerCase();
    const hasBroadTerm = broadTerms.some(term => lowerName.includes(term));
    if (hasBroadTerm && dependents.length >= 10) {
        risks.push('- Broad-scope risk: this node has many dependents and may be mixing field, platform, component, and product meanings.');
    }

    for (const id of item.prerequisites || []) {
        const prerequisite = byId.get(id);
        const edge = edgeTo(item, id);
        if (!prerequisite || !edge) continue;
        const itemDate = typeof item.firstKnownDate === 'number' ? item.firstKnownDate : null;
        const prerequisiteDate = typeof prerequisite.firstKnownDate === 'number' ? prerequisite.firstKnownDate : null;
        if (edge.type === 'required' && itemDate !== null && prerequisiteDate !== null && prerequisiteDate >= itemDate) {
            risks.push(`- Scope/direction risk: required prerequisite \`${id}\` is dated ${prerequisiteDate}, not earlier than \`${item.id}\` (${itemDate}). Check whether it is actually a scaling or later manufacturing dependency.`);
        }
        const contextLike = /clean room|clean_room|gmp|regulation|standard|supply chain|mass production|commercial|scaling|quality control/i.test(`${id} ${prerequisite.name}`);
        if (edge.type === 'required' && contextLike) {
            risks.push(`- Hard-prerequisite risk: \`${id}\` sounds like context, regulation, or scaling infrastructure. Apply the absence-breaks test before keeping it as required.`);
        } else if (contextLike) {
            risks.push(`- Scope/scaling risk: \`${id}\` sounds like production or scaling infrastructure. If \`${item.id}\` is a broad concept, this edge may belong on narrower manufacturing or deployment nodes.`);
        }
    }

    return risks.length ? [...new Set(risks)] : ['- none detected mechanically; still inspect source locators and neighbor scope.'];
}

function printPacket({ item, items, byId, issue, dependentsLimit }) {
    const dependents = items
        .filter(candidate => candidate.id !== item.id && (candidate.prerequisites || []).includes(item.id))
        .sort(sortByEraAndDate);
    const issueLine = issue ? `GitHub issue: https://github.com/yodakohl/techtree/issues/${issue}\n\n` : '';
    const prerequisiteText = prerequisiteLines(item, byId).join('\n');
    const dependentText = dependentLines(item.id, dependents, dependentsLimit).join('\n');
    const riskText = riskLines(item, byId, dependents).join('\n');

    console.log(`# Node Scope Review Packet: ${item.id}

${issueLine}## Current Node Claim

- node: \`${item.id}\` (${item.name})
- file: \`data/${item.__file}\`
- era/date: ${dateLabel(item)}
- region: ${item.region || 'unknown'}
- review status: ${item.reviewStatus || 'unknown'}
- fields: ${fieldLabel(item)}
- dependents: ${dependents.length}

${item.description}

## Current Prerequisites

${prerequisiteText}

## Current Dependents

${dependentText}

## Node Sources

${sourceLines(item.sources).join('\n')}

## Mechanical Risk Hints

${riskText}

## Semantic Invariant Schema

Use this schema before opening a PR or source-locator reply:

\`\`\`text
target_claim: node id plus the exact edge or scope claim being changed
scope_lock: exact concept the node is allowed to represent after the change
prohibited_laundering: what broader/narrower meaning must not be smuggled into the node
chronology_bound: earliest supported date for that scoped concept
edge_verb_test: why each kept prerequisite is required, enabling, scaling, historical, or only contextual
source_locator: exact source passage, section, figure, table, or abstract inspected
dependent_rewire: downstream nodes that must move if the node is split or rescoped
global_ontology_check: after the local edit, do neighboring prerequisites and dependents still preserve the same causal boundary?
\`\`\`

## No-PR Reply Format

Reply with this exact shape if you are not opening a PR:

\`\`\`text
Decision: split | keep-and-rescope | remove-specific-edge | add-specific-node | no change
Scope lock:
Wrong edge(s):
Source URL:
Source locator:
Why this source pins the scope:
Global ontology check:
Dependent nodes to rewire:
Strongest reason this decision could be wrong:
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
    const args = parseArgs(process.argv.slice(2));
    if (!Number.isFinite(args.dependentsLimit) || args.dependentsLimit < 1) {
        throw new Error('--dependents-limit must be a positive number');
    }

    const items = loadItems();
    const byId = new Map(items.map(item => [item.id, item]));
    const item = byId.get(args.nodeId);
    if (!item) throw new Error(`Unknown node id: ${args.nodeId}`);
    printPacket({ item, items, byId, issue: args.issue, dependentsLimit: args.dependentsLimit });
}

main();

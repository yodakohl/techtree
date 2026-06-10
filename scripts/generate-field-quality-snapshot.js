#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const RECEIPT_DIR = path.join(ROOT_DIR, 'docs', 'edge-change-receipts');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'QUALITY_GENOME_EDITING_CRISPR_CAS.md');
const FIELD = 'Genome Editing / CRISPR-Cas';
const GENERATED_DATE = '2026-06-10';
const ERA_DEFAULT = {
    Ancient: -10000,
    Classical: -500,
    Medieval: 500,
    Renaissance: 1400,
    Industrial: 1760,
    Modern: 1945,
    Future: 2035
};

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => readJson(path.join(DATA_DIR, file)).map(item => ({ ...item, __file: file })));
}

function loadReceipts() {
    return fs.readdirSync(RECEIPT_DIR)
        .filter(file => file.endsWith('.json'))
        .sort()
        .map(file => ({ file, receipt: readJson(path.join(RECEIPT_DIR, file)) }));
}

function pct(numerator, denominator) {
    return denominator ? `${((numerator / denominator) * 100).toFixed(1)}%` : 'n/a';
}

function receiptFor(receipts, edge) {
    return receipts.find(({ receipt }) => {
        return receipt.edge?.dependent === edge.from
            && receipt.edge?.prerequisite === edge.to
            && receipt.new_claim?.type === edge.type;
    });
}

function isBroadNode(node) {
    return /systems|technology|technologies|science|engineering|delivery|editing|therapy|therapeutics|platforms|vectors|screens/i
        .test(`${node.name} ${node.id}`);
}

function status(ok) {
    return ok ? 'PASS' : 'FAIL';
}

function row(label, current, target, ok) {
    return { label, current, target, status: status(ok), ok };
}

function buildSnapshot() {
    const data = loadData();
    const receipts = loadReceipts();
    const nodes = data.filter(node => (node.fields || []).includes(FIELD));
    if (!nodes.length) throw new Error(`No nodes found for field ${FIELD}`);

    const edges = nodes.flatMap(node => {
        return (node.dependencyEdges || []).map(edge => ({
            from: node.id,
            to: edge.prerequisite,
            ...edge
        }));
    });
    const required = edges.filter(edge => edge.type === 'required');
    const sourceCheckedEraDefaults = nodes.filter(node => {
        return node.reviewStatus === 'source_checked' && node.firstKnownDate === ERA_DEFAULT[node.era];
    });
    const broadNodes = nodes.filter(isBroadNode);
    const futureNodes = nodes.filter(node => node.era === 'Future');
    const futureComplete = futureNodes.filter(node => {
        return node.timeframe
            && Array.isArray(node.blockers)
            && node.blockers.length > 0
            && typeof node.forecastConfidence === 'number'
            && node.forecastConfidence >= 0
            && node.forecastConfidence <= 1;
    });
    const nodeSources = nodes.filter(node => (node.sources || []).length > 0);
    const edgeSources = edges.filter(edge => (edge.sources || []).length > 0);
    const requiredWithReceipts = required.filter(edge => receiptFor(receipts, edge));
    const broadWithScope = broadNodes.filter(node => node.scopeNote);
    const allWithScope = nodes.filter(node => node.scopeNote);

    const sourceTypeCounts = {};
    for (const node of nodes) {
        for (const source of node.sources || []) {
            const type = source.source_type || 'unspecified';
            sourceTypeCounts[type] = (sourceTypeCounts[type] || 0) + 1;
        }
    }

    const rows = [
        row('Nodes with node-level sources', `${nodeSources.length}/${nodes.length} (${pct(nodeSources.length, nodes.length)})`, '>= 95%', nodeSources.length / nodes.length >= 0.95),
        row('Edges with edge-level sources', `${edgeSources.length}/${edges.length} (${pct(edgeSources.length, edges.length)})`, '>= 80%', edgeSources.length / edges.length >= 0.8),
        row('Source-checked era-default dates', `${sourceCheckedEraDefaults.length}`, '0', sourceCheckedEraDefaults.length === 0),
        row('Required edges with formal receipts', `${requiredWithReceipts.length}/${required.length} (${pct(requiredWithReceipts.length, required.length)})`, '100%', requiredWithReceipts.length === required.length),
        row('Broad nodes with scope notes', `${broadWithScope.length}/${broadNodes.length} (${pct(broadWithScope.length, broadNodes.length)})`, '100%', broadWithScope.length === broadNodes.length),
        row('All field nodes with scope notes', `${allWithScope.length}/${nodes.length} (${pct(allWithScope.length, nodes.length)})`, 'extra guardrail', allWithScope.length === nodes.length),
        row('Future nodes with timeframe, blockers, confidence', `${futureComplete.length}/${futureNodes.length} (${pct(futureComplete.length, futureNodes.length)})`, '100%', futureComplete.length === futureNodes.length)
    ];

    return {
        nodes,
        edges,
        required,
        receipts,
        rows,
        futureNodes,
        sourceTypeCounts
    };
}

function render(snapshot) {
    const { nodes, edges, required, receipts, rows, futureNodes, sourceTypeCounts } = snapshot;
    const sourceTypes = Object.entries(sourceTypeCounts)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([type, count]) => `${type}: ${count}`)
        .join(', ');
    const lines = [
        '# Quality Snapshot: Genome Editing / CRISPR-Cas',
        '',
        `Generated: ${GENERATED_DATE}`,
        '',
        `This is a field-specific trust snapshot for the \`${FIELD}\` lens. It is a local quality gate for this field, not proof that the whole TechTree graph has the same trust level.`,
        '',
        '## Gate Results',
        '',
        '| Metric | Current | Target | Status |',
        '|---|---:|---:|---|',
        ...rows.map(item => `| ${item.label} | ${item.current} | ${item.target} | ${item.status} |`),
        '',
        '## Boundary',
        '',
        `- Field lens: \`${FIELD}\``,
        `- Nodes: ${nodes.length}`,
        `- Dependency edges inside field nodes: ${edges.length}`,
        `- Required edges: ${required.length}`,
        `- Source types on field nodes: ${sourceTypes}`,
        '',
        '## Required Edge Receipts',
        ''
    ];

    for (const edge of required.sort((left, right) => `${left.from}->${left.to}`.localeCompare(`${right.from}->${right.to}`))) {
        const match = receiptFor(receipts, edge);
        lines.push(`- \`${edge.from}\` -> \`${edge.to}\`: ${match ? `\`${match.file}\`` : 'MISSING'}`);
    }

    lines.push('', '## Future Nodes', '');
    for (const node of futureNodes.sort((left, right) => left.id.localeCompare(right.id))) {
        lines.push(`- \`${node.id}\` (${node.name}): timeframe ${node.timeframe}; forecastConfidence ${node.forecastConfidence}; blockers: ${node.blockers.join('; ')}`);
    }

    lines.push('', '## Scope Notes', '');
    for (const node of nodes.sort((left, right) => left.id.localeCompare(right.id))) {
        lines.push(`- \`${node.id}\`: ${node.scopeNote}`);
    }

    lines.push(
        '',
        '## Verification Commands',
        '',
        '`npm run edge-receipts`',
        '',
        '`npm run audit:crispr`',
        '',
        '`npm test`',
        '',
        '`npm run quality`',
        '',
        '`npm run coverage`'
    );

    return `${lines.join('\n')}\n`;
}

function failIfGateMisses(rows) {
    const failures = rows.filter(item => !item.ok);
    if (!failures.length) return;
    console.error(`Field quality gate failed for ${FIELD}:`);
    for (const failure of failures) {
        console.error(`- ${failure.label}: ${failure.current}; target ${failure.target}`);
    }
    process.exit(1);
}

function main() {
    const snapshot = buildSnapshot();
    const markdown = render(snapshot);
    failIfGateMisses(snapshot.rows);

    if (checkOnly) {
        let current = '';
        try {
            current = fs.readFileSync(OUTPUT_FILE, 'utf8');
        } catch (error) {
            console.error(`${path.relative(ROOT_DIR, OUTPUT_FILE)} is missing`);
            process.exit(1);
        }
        if (current !== markdown) {
            console.error(`${path.relative(ROOT_DIR, OUTPUT_FILE)} is stale`);
            console.error('Run npm run quality:field:crispr to regenerate.');
            process.exit(1);
        }
        console.log('CRISPR field quality snapshot is current.');
        return;
    }

    fs.writeFileSync(OUTPUT_FILE, markdown);
    console.log(`Wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main();

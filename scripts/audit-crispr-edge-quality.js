const fs = require('fs');
const path = require('path');
const { ERA_ORDER, getDependencyEdges } = require('./edge-schema');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FIELD = 'Genome Editing / CRISPR-Cas';
const args = new Set(process.argv.slice(2));

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => {
            const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            if (!Array.isArray(items)) throw new Error(`${file} must contain an array`);
            return items.map(item => ({ ...item, __file: file }));
        });
}

function increment(map, key) {
    map.set(key, (map.get(key) || 0) + 1);
}

function toObject(map) {
    return Object.fromEntries([...map.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))));
}

function edgeId(item, edge) {
    return `${item.id}->${edge.prerequisite}`;
}

function hasEdgeSource(edge) {
    return Array.isArray(edge.sources) && edge.sources.some(source => Array.isArray(source.supports) && source.supports.includes('edge'));
}

function addIssue(collection, item, edge, code, message, details = {}) {
    collection.push({
        code,
        edge: edgeId(item, edge),
        dependent: item.id,
        prerequisite: edge.prerequisite,
        type: edge.type,
        evidence_level: edge.evidence_level,
        confidence: edge.confidence,
        file: item.__file,
        message,
        ...details
    });
}

function priorityFor(item, edge, prerequisite) {
    let priority = 0;
    if (edge.type === 'required') priority += 4;
    if (edge.type === 'commercial_or_scaling_dependency') priority += 3;
    if (edge.confidence >= 0.8) priority += 2;
    if (!hasEdgeSource(edge)) priority += 2;
    if (edge.evidence_level === 'expert_inference') priority += 1;
    if (prerequisite?.reviewStatus !== 'source_checked') priority += 1;
    if (item.maturity === 'approved') priority += 1;
    return priority;
}

function audit() {
    const data = loadData();
    const byId = new Map(data.map(item => [item.id, item]));
    const crisprNodes = data.filter(item => item.fields?.includes(FIELD));
    const blockers = [];
    const reviewCandidates = [];
    const evidenceLevels = new Map();
    const edgeTypes = new Map();
    const reviewStatuses = new Map();
    const eras = new Map();
    const maturity = new Map();
    let edgeCount = 0;
    let edgeSourceCount = 0;

    for (const item of crisprNodes) {
        increment(eras, item.era || '<missing>');
        increment(maturity, item.maturity || '<missing>');
        for (const edge of getDependencyEdges(item)) {
            edgeCount += 1;
            increment(evidenceLevels, edge.evidence_level || '<missing>');
            increment(edgeTypes, edge.type || '<missing>');
            increment(reviewStatuses, edge.reviewStatus || '<missing>');
            if (hasEdgeSource(edge)) edgeSourceCount += 1;

            const prerequisite = byId.get(edge.prerequisite);
            if (!prerequisite) {
                addIssue(blockers, item, edge, 'missing_prerequisite', 'Prerequisite id is not present in the graph.');
                continue;
            }

            const dependentEraOrder = ERA_ORDER.get(item.era);
            const prerequisiteEraOrder = ERA_ORDER.get(prerequisite.era);
            if (prerequisiteEraOrder > dependentEraOrder) {
                addIssue(
                    blockers,
                    item,
                    edge,
                    'later_era_prerequisite',
                    'Dependent node depends on a later-era prerequisite.',
                    { dependent_era: item.era, prerequisite_era: prerequisite.era }
                );
            }

            if (
                typeof item.firstKnownDate === 'number' &&
                typeof prerequisite.firstKnownDate === 'number' &&
                prerequisite.firstKnownDate > item.firstKnownDate &&
                edge.type !== 'speculative'
            ) {
                addIssue(
                    blockers,
                    item,
                    edge,
                    'later_date_prerequisite',
                    'Prerequisite firstKnownDate is later than dependent firstKnownDate on a non-speculative edge.',
                    { dependent_date: item.firstKnownDate, prerequisite_date: prerequisite.firstKnownDate }
                );
            }

            if (!hasEdgeSource(edge)) {
                if (edge.evidence_level === 'expert_inference' || edge.evidence_level === 'speculative') {
                    addIssue(
                        reviewCandidates,
                        item,
                        edge,
                        'edge_source_upgrade',
                        'Edge has no edge-level source and relies on inference.',
                        { priority: priorityFor(item, edge, prerequisite) }
                    );
                } else {
                    addIssue(
                        blockers,
                        item,
                        edge,
                        'missing_edge_source',
                        'Non-inference edge has no source that explicitly supports the edge.'
                    );
                }
            }

            if (edge.type === 'required' && edge.evidence_level === 'expert_inference') {
                addIssue(
                    reviewCandidates,
                    item,
                    edge,
                    'required_edge_inference',
                    'Required edge should be prioritized for source-backed review.',
                    { priority: priorityFor(item, edge, prerequisite) + 1 }
                );
            }
        }
    }

    reviewCandidates.sort((a, b) => (b.priority || 0) - (a.priority || 0) || a.edge.localeCompare(b.edge));

    return {
        field: FIELD,
        baseline: {
            node_count: crisprNodes.length,
            edge_count: edgeCount,
            edge_source_count: edgeSourceCount,
            edge_without_edge_source_count: edgeCount - edgeSourceCount,
            eras: toObject(eras),
            maturity: toObject(maturity),
            evidence_levels: toObject(evidenceLevels),
            edge_types: toObject(edgeTypes),
            edge_review_statuses: toObject(reviewStatuses)
        },
        blockers,
        review_candidates: reviewCandidates,
        suggested_next_task: reviewCandidates[0]
            ? `Source-check or retype ${reviewCandidates[0].edge}.`
            : 'No review candidates found.'
    };
}

function printText(report) {
    console.log(`CRISPR-Cas edge audit: ${report.field}`);
    console.log(`Nodes: ${report.baseline.node_count}`);
    console.log(`Edges: ${report.baseline.edge_count}`);
    console.log(`Edge-level sources: ${report.baseline.edge_source_count}`);
    console.log(`Edges without edge-level sources: ${report.baseline.edge_without_edge_source_count}`);
    console.log(`Evidence levels: ${JSON.stringify(report.baseline.evidence_levels)}`);
    console.log(`Edge types: ${JSON.stringify(report.baseline.edge_types)}`);
    console.log(`Hard blockers: ${report.blockers.length}`);
    console.log(`Review candidates: ${report.review_candidates.length}`);

    if (report.blockers.length) {
        console.log('\nHard blockers:');
        for (const issue of report.blockers.slice(0, 20)) {
            console.log(`- ${issue.edge}: ${issue.message}`);
        }
    }

    if (report.review_candidates.length) {
        console.log('\nTop review candidates:');
        for (const issue of report.review_candidates.slice(0, 12)) {
            console.log(`- [p${issue.priority}] ${issue.edge}: ${issue.message}`);
        }
    }

    console.log(`\nSuggested next task: ${report.suggested_next_task}`);
}

const report = audit();
if (args.has('--json')) {
    console.log(JSON.stringify(report, null, 2));
} else {
    printText(report);
}

if (report.blockers.length) {
    process.exit(1);
}

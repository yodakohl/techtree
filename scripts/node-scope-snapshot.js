#!/usr/bin/env node
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

function usage() {
    console.error('Usage: node scripts/node-scope-snapshot.js node_id');
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

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((accumulator, key) => {
            accumulator[key] = stable(value[key]);
            return accumulator;
        }, {});
    }
    return value;
}

function stableJson(value) {
    return JSON.stringify(stable(value));
}

function signature(value) {
    return `sha256:${crypto.createHash('sha256').update(stableJson(value)).digest('hex')}`;
}

function sourceSummary(sources) {
    if (!Array.isArray(sources)) return [];
    return sources.map(source => ({
        title: source.title || null,
        publisher: source.publisher || null,
        year: source.year || null,
        source_type: source.source_type || null,
        supports: Array.isArray(source.supports) ? [...source.supports].sort() : [],
        url: source.url || null
    })).sort((left, right) => `${left.url || ''}${left.title || ''}`.localeCompare(`${right.url || ''}${right.title || ''}`));
}

function edgeTo(item, prerequisiteId) {
    return (item.dependencyEdges || []).find(edge => edge.prerequisite === prerequisiteId);
}

function edgeBehavior(edge) {
    if (!edge) {
        return {
            type: 'missing_typed_edge',
            evidence_level: null,
            confidence: null,
            reviewStatus: null
        };
    }
    return {
        type: edge.type || null,
        evidence_level: edge.evidence_level || null,
        confidence: edge.confidence ?? null,
        reviewStatus: edge.reviewStatus || null
    };
}

function incomingEdges(item, byId) {
    return (item.prerequisites || []).map(prerequisiteId => {
        const prerequisite = byId.get(prerequisiteId);
        const edge = edgeTo(item, prerequisiteId);
        return {
            from: prerequisiteId,
            fromName: prerequisite ? prerequisite.name : null,
            fromDate: prerequisite ? prerequisite.firstKnownDate ?? null : null,
            to: item.id,
            ...edgeBehavior(edge)
        };
    }).sort((left, right) => left.from.localeCompare(right.from));
}

function outgoingEdges(item, items) {
    return items
        .filter(candidate => candidate.id !== item.id && (candidate.prerequisites || []).includes(item.id))
        .map(dependent => {
            const edge = edgeTo(dependent, item.id);
            return {
                from: item.id,
                to: dependent.id,
                toName: dependent.name,
                toDate: dependent.firstKnownDate ?? null,
                toFields: Array.isArray(dependent.fields) ? [...dependent.fields].sort() : [],
                ...edgeBehavior(edge)
            };
        })
        .sort((left, right) => left.to.localeCompare(right.to));
}

function throughPaths(incoming, outgoing, viaId) {
    const paths = [];
    for (const incomingEdge of incoming) {
        for (const outgoingEdge of outgoing) {
            paths.push({
                from: incomingEdge.from,
                via: viaId,
                to: outgoingEdge.to,
                edgeTypes: [incomingEdge.type, outgoingEdge.type],
                evidenceLevels: [incomingEdge.evidence_level, outgoingEdge.evidence_level],
                confidences: [incomingEdge.confidence, outgoingEdge.confidence]
            });
        }
    }
    return paths.sort((left, right) => `${left.from}->${left.via}->${left.to}`.localeCompare(`${right.from}->${right.via}->${right.to}`));
}

function buildSnapshot(item, items, byId) {
    const incoming = incomingEdges(item, byId);
    const outgoing = outgoingEdges(item, items);
    const paths = throughPaths(incoming, outgoing, item.id);

    const claimSurface = {
        id: item.id,
        name: item.name,
        file: `data/${item.__file}`,
        era: item.era,
        firstKnownDate: item.firstKnownDate ?? null,
        datePrecision: item.datePrecision || null,
        region: item.region || null,
        reviewStatus: item.reviewStatus || null,
        description: item.description || '',
        fields: Array.isArray(item.fields) ? [...item.fields].sort() : [],
        sources: sourceSummary(item.sources)
    };

    const behaviorSurface = {
        node: item.id,
        incomingEdges: incoming,
        outgoingEdges: outgoing,
        throughPaths: paths
    };

    return {
        generatedBy: 'scripts/node-scope-snapshot.js',
        nodeId: item.id,
        claimSurface,
        behaviorSurface,
        claimSignature: signature(claimSurface),
        behaviorSignature: signature(behaviorSurface)
    };
}

function main() {
    const nodeId = process.argv[2];
    if (!nodeId || process.argv.includes('--help') || process.argv.includes('-h')) usage();

    const items = loadItems();
    const byId = new Map(items.map(item => [item.id, item]));
    const item = byId.get(nodeId);
    if (!item) throw new Error(`Unknown node id: ${nodeId}`);

    console.log(JSON.stringify(buildSnapshot(item, items, byId), null, 2));
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');
const trust = require('../trust-levels');

const DATA_DIR = path.join(__dirname, '..', 'data');
const VALID_NODE_LEVELS = new Set(Object.keys(trust.NODE_TRUST));
const VALID_EDGE_LEVELS = new Set(Object.keys(trust.EDGE_TRUST));

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

function formatCounts(map) {
    return JSON.stringify(Object.fromEntries([...map.entries()].sort(([a], [b]) => a.localeCompare(b))));
}

function getDependencyEdges(item) {
    if (Array.isArray(item.dependencyEdges) && item.dependencyEdges.length) return item.dependencyEdges;
    return (item.prerequisites || []).map(prerequisite => ({
        prerequisite,
        type: 'required',
        confidence: 0.5,
        evidence_level: 'weak_inference',
        note: 'Legacy prerequisite without edge-level metadata.',
        reviewStatus: 'generated'
    }));
}

function audit() {
    const data = loadData();
    const errors = [];
    const nodeCounts = new Map();
    const edgeCounts = new Map();
    let edgeTotal = 0;

    for (const item of data) {
        const first = trust.deriveNodeTrust(item);
        const second = trust.deriveNodeTrust(JSON.parse(JSON.stringify(item)));
        increment(nodeCounts, first.level);

        if (!VALID_NODE_LEVELS.has(first.level)) {
            errors.push(`${item.__file}: ${item.id} has invalid node trust level ${first.level}`);
        }
        if (JSON.stringify(first) !== JSON.stringify(second)) {
            errors.push(`${item.__file}: ${item.id} node trust derivation is not deterministic`);
        }
        if (first.level === 'high') {
            if (!['source_checked', 'domain_reviewed'].includes(item.reviewStatus)) {
                errors.push(`${item.__file}: ${item.id} is high trust without source/domain review status`);
            }
            if (!trust.hasNodeSource(item)) {
                errors.push(`${item.__file}: ${item.id} is high trust without a node-level source`);
            }
            if (trust.usesEraDefaultDate(item)) {
                errors.push(`${item.__file}: ${item.id} is high trust while using an era-default date`);
            }
            if (trust.isFutureRoadmap(item)) {
                errors.push(`${item.__file}: ${item.id} is high trust despite being future/roadmap`);
            }
        }
        if (trust.isFutureRoadmap(item) && first.level !== 'future') {
            errors.push(`${item.__file}: ${item.id} is future/roadmap but trust level is ${first.level}`);
        }

        for (const edge of getDependencyEdges(item)) {
            edgeTotal += 1;
            const edgeFirst = trust.deriveEdgeTrust(edge);
            const edgeSecond = trust.deriveEdgeTrust(JSON.parse(JSON.stringify(edge)));
            increment(edgeCounts, edgeFirst.level);

            if (!VALID_EDGE_LEVELS.has(edgeFirst.level)) {
                errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} has invalid edge trust level ${edgeFirst.level}`);
            }
            if (JSON.stringify(edgeFirst) !== JSON.stringify(edgeSecond)) {
                errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} edge trust derivation is not deterministic`);
            }
            if (edgeFirst.level === 'strong') {
                if (edge.type !== 'required') {
                    errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} is strong but is not a required edge`);
                }
                if (!trust.hasEdgeSource(edge)) {
                    errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} is strong without an edge-level source`);
                }
            }
            if (!trust.hasEdgeSource(edge) && edgeFirst.level !== 'weak') {
                errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} is unsourced but not weak`);
            }
            if ((edge.evidence_level === 'expert_inference' || edge.evidence_level === 'weak_inference') && edgeFirst.level !== 'weak') {
                errors.push(`${item.__file}: ${item.id}->${edge.prerequisite} is inference-backed but not weak`);
            }
        }
    }

    if (errors.length) {
        console.error(`Trust-level audit failed with ${errors.length} issue(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exit(1);
    }

    console.log(`Trust-level audit passed for ${data.length} technologies and ${edgeTotal} dependency edges.`);
    console.log(`Node trust distribution: ${formatCounts(nodeCounts)}`);
    console.log(`Edge trust distribution: ${formatCounts(edgeCounts)}`);
}

audit();

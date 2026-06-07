#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DEFAULT_INVARIANT_DIR = path.join(__dirname, '..', 'docs', 'graph-invariants');

function usage() {
    console.error('Usage: node scripts/check-graph-invariants.js [--api URL] [invariant-file-or-dir ...]');
    process.exit(1);
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadItemsFromFiles() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => {
            const parsed = readJson(path.join(DATA_DIR, file));
            if (!Array.isArray(parsed)) throw new Error(`${file} must contain an array`);
            return parsed.map(item => ({ ...item, __file: file }));
        });
}

function fetchJson(url) {
    const client = url.startsWith('https:') ? https : http;
    return new Promise((resolve, reject) => {
        const request = client.get(url, response => {
            let body = '';
            response.setEncoding('utf8');
            response.on('data', chunk => {
                body += chunk;
            });
            response.on('end', () => {
                if (response.statusCode < 200 || response.statusCode >= 300) {
                    reject(new Error(`${url} returned HTTP ${response.statusCode}`));
                    return;
                }
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(new Error(`${url} did not return JSON: ${error.message}`));
                }
            });
        });
        request.setTimeout(15000, () => {
            request.destroy(new Error(`${url} timed out`));
        });
        request.on('error', reject);
    });
}

function normalizeItems(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.nodes)) return payload.nodes;
    if (Array.isArray(payload.technologies)) return payload.technologies;
    if (payload && Array.isArray(payload.data)) return payload.data;
    throw new Error('Graph payload must be an array or contain nodes/technologies/data');
}

function invariantFiles(paths) {
    const inputs = paths.length ? paths : [DEFAULT_INVARIANT_DIR];
    const files = [];

    for (const input of inputs) {
        const resolved = path.resolve(process.cwd(), input);
        const stat = fs.statSync(resolved);
        if (stat.isDirectory()) {
            files.push(...fs.readdirSync(resolved)
                .filter(file => file.endsWith('.json'))
                .sort()
                .map(file => path.join(resolved, file)));
        } else {
            files.push(resolved);
        }
    }

    if (!files.length) throw new Error('No invariant files found');
    return files;
}

function buildGraph(items) {
    const byId = new Map();
    const dependentsByPrerequisite = new Map();

    for (const item of items) {
        if (!item.id) throw new Error('Every graph item must have an id');
        byId.set(item.id, item);
    }

    for (const item of items) {
        for (const prerequisite of item.prerequisites || []) {
            if (!dependentsByPrerequisite.has(prerequisite)) dependentsByPrerequisite.set(prerequisite, []);
            dependentsByPrerequisite.get(prerequisite).push(item.id);
        }
    }

    return { byId, dependentsByPrerequisite };
}

function hasPath(graph, from, to) {
    const queue = [from];
    const seen = new Set(queue);

    while (queue.length) {
        const current = queue.shift();
        if (current === to) return true;
        for (const next of graph.dependentsByPrerequisite.get(current) || []) {
            if (!seen.has(next)) {
                seen.add(next);
                queue.push(next);
            }
        }
    }

    return false;
}

function findEdge(graph, dependent, prerequisite) {
    const node = graph.byId.get(dependent);
    if (!node) return { node: null, edge: null, listed: false };
    const edge = (node.dependencyEdges || []).find(candidate => candidate.prerequisite === prerequisite) || null;
    return {
        node,
        edge,
        listed: (node.prerequisites || []).includes(prerequisite)
    };
}

function compare(operator, left, right) {
    return {
        eq: left === right,
        gte: left >= right,
        lte: left <= right,
        gt: left > right,
        lt: left < right
    }[operator];
}

function checkInvariant(graph, file, invariant) {
    const errors = [];
    const checks = invariant.checks || [];

    if (!invariant.id || typeof invariant.id !== 'string') {
        errors.push(`${file}: invariant id is required`);
    }
    if (!Array.isArray(checks) || !checks.length) {
        errors.push(`${file}: checks must be a non-empty array`);
        return { errors, count: 0 };
    }

    for (const [index, check] of checks.entries()) {
        const label = `${file}: ${invariant.id || 'unknown'} checks[${index}]`;
        const reason = check.reason ? ` (${check.reason})` : '';

        if (check.type === 'path_absent' || check.type === 'path_present') {
            if (!check.from || !check.to) {
                errors.push(`${label}: ${check.type} requires from and to`);
                continue;
            }
            if (!graph.byId.has(check.from)) errors.push(`${label}: unknown from node ${check.from}`);
            if (!graph.byId.has(check.to)) errors.push(`${label}: unknown to node ${check.to}`);
            const exists = hasPath(graph, check.from, check.to);
            if (check.type === 'path_absent' && exists) errors.push(`${label}: unexpected path ${check.from}->${check.to}${reason}`);
            if (check.type === 'path_present' && !exists) errors.push(`${label}: missing path ${check.from}->${check.to}${reason}`);
            continue;
        }

        if (check.type === 'direct_edge_absent' || check.type === 'direct_edge_present' || check.type === 'edge_type') {
            if (!check.dependent || !check.prerequisite) {
                errors.push(`${label}: ${check.type} requires dependent and prerequisite`);
                continue;
            }
            const { node, edge, listed } = findEdge(graph, check.dependent, check.prerequisite);
            if (!node) {
                errors.push(`${label}: unknown dependent node ${check.dependent}`);
                continue;
            }
            const exists = Boolean(edge) || listed;
            if (check.type === 'direct_edge_absent' && exists) {
                errors.push(`${label}: unexpected direct edge ${check.prerequisite}->${check.dependent}${reason}`);
            }
            if (check.type === 'direct_edge_present' && !exists) {
                errors.push(`${label}: missing direct edge ${check.prerequisite}->${check.dependent}${reason}`);
            }
            if (check.type === 'edge_type') {
                if (!edge) {
                    errors.push(`${label}: typed edge ${check.prerequisite}->${check.dependent} is missing${reason}`);
                } else if (edge.type !== check.expected) {
                    errors.push(`${label}: expected edge type ${check.expected} for ${check.prerequisite}->${check.dependent}, got ${edge.type}${reason}`);
                }
            }
            continue;
        }

        if (check.type === 'first_known_date') {
            if (!check.node || !check.operator || typeof check.value !== 'number') {
                errors.push(`${label}: first_known_date requires node, operator, and numeric value`);
                continue;
            }
            const node = graph.byId.get(check.node);
            if (!node) {
                errors.push(`${label}: unknown node ${check.node}`);
                continue;
            }
            if (typeof node.firstKnownDate !== 'number') {
                errors.push(`${label}: ${check.node} has non-numeric firstKnownDate${reason}`);
                continue;
            }
            if (!Object.prototype.hasOwnProperty.call({ eq: true, gte: true, lte: true, gt: true, lt: true }, check.operator)) {
                errors.push(`${label}: unknown date operator ${check.operator}`);
                continue;
            }
            if (!compare(check.operator, node.firstKnownDate, check.value)) {
                errors.push(`${label}: expected ${check.node}.firstKnownDate ${check.operator} ${check.value}, got ${node.firstKnownDate}${reason}`);
            }
            continue;
        }

        errors.push(`${label}: unknown check type ${check.type}`);
    }

    return { errors, count: checks.length };
}

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('--help') || args.includes('-h')) usage();

    let apiUrl = null;
    const inputs = [];
    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--api') {
            apiUrl = args[index + 1];
            if (!apiUrl) usage();
            index += 1;
        } else {
            inputs.push(arg);
        }
    }

    const items = apiUrl ? normalizeItems(await fetchJson(apiUrl)) : loadItemsFromFiles();
    const graph = buildGraph(items);
    const files = invariantFiles(inputs);
    const errors = [];
    let checkCount = 0;

    for (const file of files) {
        const invariant = readJson(file);
        const result = checkInvariant(graph, path.relative(process.cwd(), file), invariant);
        errors.push(...result.errors);
        checkCount += result.count;
    }

    if (errors.length) {
        console.error(`Graph invariant audit failed with ${errors.length} error(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exit(1);
    }

    console.log(`Graph invariant audit passed for ${files.length} invariant file(s), ${checkCount} check(s), ${items.length} technologies${apiUrl ? ` from ${apiUrl}` : ''}.`);
}

main().catch(error => {
    console.error(error.message);
    process.exit(1);
});

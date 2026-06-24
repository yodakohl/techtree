#!/usr/bin/env node
const {
    loadData,
    hasStrongTrustSource
} = require('./accuracy-risk-report');
const {
    ERA_DEFAULT_DATES,
    getDependencyEdges
} = require('./edge-schema');

const DEFAULT_LIMIT = 10;

function parseArgs(args) {
    const options = {
        id: null,
        limit: DEFAULT_LIMIT,
        json: false
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--json') {
            options.json = true;
        } else if (arg === '--id') {
            options.id = args[index + 1];
            index += 1;
        } else if (arg.startsWith('--id=')) {
            options.id = arg.slice('--id='.length);
        } else if (arg === '--limit') {
            options.limit = Number.parseInt(args[index + 1], 10);
            index += 1;
        } else if (arg.startsWith('--limit=')) {
            options.limit = Number.parseInt(arg.slice('--limit='.length), 10);
        } else if (arg === '--help' || arg === '-h') {
            usage(0);
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (!Number.isFinite(options.limit) || options.limit < 1) {
        throw new Error('--limit must be a positive integer');
    }
    return options;
}

function usage(exitCode = 1) {
    const stream = exitCode ? process.stderr : process.stdout;
    stream.write(`Usage: node scripts/agent-next.js [--limit 10] [--id node_id] [--json]

Ranks the next launch-readiness data-quality targets from remaining source,
edge-source, review-status, and placeholder-date debt.
`);
    process.exit(exitCode);
}

function usesEraDefaultDate(item) {
    const defaults = ERA_DEFAULT_DATES[item.era];
    if (!defaults) return false;
    return item.firstKnownDate === defaults.firstKnownDate
        && item.datePrecision === defaults.datePrecision
        && item.region === defaults.region;
}

function edgeHasSource(edge) {
    return Array.isArray(edge.sources) && edge.sources.length > 0;
}

function hasNodeSource(item) {
    return Array.isArray(item.sources) && item.sources.length > 0;
}

function onlyWeakOrGenericSources(item) {
    return hasNodeSource(item) && item.sources.every(source => {
        return ['weak_web', 'generic_overview'].includes(source.source_type);
    });
}

function sourceLabel(source) {
    let host = '';
    try {
        host = source.url ? new URL(source.url).hostname.replace(/^www\./, '') : '';
    } catch {
        host = 'invalid-url';
    }
    const quality = source.source_type || 'unknown';
    const title = source.title || source.publisher || 'untitled source';
    return `${title} (${quality}${host ? `, ${host}` : ''})`;
}

function dateLabel(item) {
    return `${item.firstKnownDate ?? 'unknown'} (${item.datePrecision || 'unknown'})`;
}

function fileLabel(item) {
    return item.__file ? `data/${item.__file}` : 'data/*.json';
}

function dependentMap(data) {
    const map = new Map(data.map(item => [item.id, []]));
    for (const item of data) {
        for (const edge of getDependencyEdges(item)) {
            if (!map.has(edge.prerequisite)) map.set(edge.prerequisite, []);
            map.get(edge.prerequisite).push(item.id);
        }
    }
    return map;
}

function debtFor(item, dependents) {
    const edges = getDependencyEdges(item);
    const missingEdgeSources = edges.filter(edge => !edgeHasSource(edge));
    const eraDefaultDate = usesEraDefaultDate(item);
    const missingNodeSource = !hasNodeSource(item);
    const weakNodeSources = onlyWeakOrGenericSources(item);
    const lacksStrongNodeSource = !missingNodeSource && !hasStrongTrustSource(item);
    const generated = item.reviewStatus === 'generated';
    const structurallyValidated = item.reviewStatus === 'structurally_validated';

    const labels = [];
    if (missingEdgeSources.length) labels.push(`${missingEdgeSources.length}/${edges.length} dependency edges missing sources`);
    if (eraDefaultDate) labels.push('era-default placeholder date');
    if (missingNodeSource) labels.push('missing node source');
    if (weakNodeSources) labels.push('weak/generic node sources only');
    if (lacksStrongNodeSource) labels.push('no strong node source');
    if (generated) labels.push('generated review status');
    if (structurallyValidated) labels.push('not source_checked');

    let score = 0;
    score += missingEdgeSources.length * 14;
    if (eraDefaultDate) score += item.era === 'Future' ? 18 : 26;
    if (missingNodeSource) score += 25;
    if (weakNodeSources) score += 14;
    if (lacksStrongNodeSource) score += 8;
    if (generated) score += 18;
    if (structurallyValidated) score += 6;
    score += Math.min(dependents.length, 15);

    return {
        score,
        labels,
        missingEdgeSources,
        missingNodeSource,
        weakNodeSources,
        lacksStrongNodeSource,
        eraDefaultDate,
        generated,
        structurallyValidated
    };
}

function buildQueue(data = loadData(), options = {}) {
    const limit = options.limit || DEFAULT_LIMIT;
    const dependents = dependentMap(data);
    const byId = new Map(data.map(item => [item.id, item]));

    const queue = data
        .map(item => {
            const dependentIds = dependents.get(item.id) || [];
            const debt = debtFor(item, dependentIds);
            if (!debt.score && options.id !== item.id) return null;
            return {
                id: item.id,
                name: item.name,
                file: fileLabel(item),
                era: item.era,
                firstKnownDate: item.firstKnownDate,
                datePrecision: item.datePrecision,
                reviewStatus: item.reviewStatus,
                sourceCount: (item.sources || []).length,
                strongNodeSource: hasStrongTrustSource(item),
                dependencyEdgeCount: getDependencyEdges(item).length,
                missingEdgeSourceCount: debt.missingEdgeSources.length,
                dependentCount: dependentIds.length,
                score: debt.score,
                debt: debt.labels,
                item,
                missingEdgeSources: debt.missingEdgeSources
            };
        })
        .filter(Boolean)
        .sort((left, right) => {
            if (right.score !== left.score) return right.score - left.score;
            if (right.missingEdgeSourceCount !== left.missingEdgeSourceCount) {
                return right.missingEdgeSourceCount - left.missingEdgeSourceCount;
            }
            if (right.dependentCount !== left.dependentCount) {
                return right.dependentCount - left.dependentCount;
            }
            if (left.firstKnownDate !== right.firstKnownDate) {
                return (left.firstKnownDate ?? Number.MAX_SAFE_INTEGER) - (right.firstKnownDate ?? Number.MAX_SAFE_INTEGER);
            }
            return left.id.localeCompare(right.id);
        });

    if (options.id) {
        const target = byId.get(options.id);
        if (!target) throw new Error(`Unknown node id: ${options.id}`);
        const targetRow = queue.find(row => row.id === options.id) || (() => {
            const dependentIds = dependents.get(target.id) || [];
            const debt = debtFor(target, dependentIds);
            return {
                id: target.id,
                name: target.name,
                file: fileLabel(target),
                era: target.era,
                firstKnownDate: target.firstKnownDate,
                datePrecision: target.datePrecision,
                reviewStatus: target.reviewStatus,
                sourceCount: (target.sources || []).length,
                strongNodeSource: hasStrongTrustSource(target),
                dependencyEdgeCount: getDependencyEdges(target).length,
                missingEdgeSourceCount: debt.missingEdgeSources.length,
                dependentCount: dependentIds.length,
                score: debt.score,
                debt: debt.labels,
                item: target,
                missingEdgeSources: debt.missingEdgeSources
            };
        })();
        return {
            queue: [targetRow, ...queue.filter(row => row.id !== options.id).slice(0, limit - 1)],
            target: targetRow
        };
    }

    return {
        queue: queue.slice(0, limit),
        target: queue[0] || null
    };
}

function commandLines(id) {
    return [
        `npm run agent:next -- --id ${id}`,
        `npm run node-packet -- ${id}`,
        `npm run --silent node-snapshot -- ${id} > /tmp/${id}.before.json`,
        '# edit data and refresh generated artifacts if metrics or public pages change',
        `npm run --silent node-snapshot -- ${id} > /tmp/${id}.after.json`,
        `npm run node-snapshot-diff -- /tmp/${id}.before.json /tmp/${id}.after.json`,
        'npm run agent:check -- --run'
    ];
}

function renderTarget(target) {
    const item = target.item;
    const missingEdgeLines = target.missingEdgeSources.length
        ? target.missingEdgeSources.map(edge => `- ${edge.prerequisite}: ${edge.type || 'unknown'}; ${edge.evidence_level || 'unknown'}; confidence ${edge.confidence ?? 'unknown'}`)
        : ['- none'];
    const sourceLines = hasNodeSource(item)
        ? item.sources.map(source => `- ${sourceLabel(source)}`)
        : ['- none'];
    const edgeTargets = target.missingEdgeSources.slice(0, 4).map(edge => edge.prerequisite).join(' ');

    return [
        'Target Work Packet',
        `- node: ${target.id} (${target.name})`,
        `- file: ${target.file}`,
        `- era/date: ${target.era}, ${dateLabel(item)}`,
        `- review status: ${target.reviewStatus || 'unknown'}`,
        `- score: ${target.score}`,
        `- debt: ${target.debt.length ? target.debt.join('; ') : 'none detected'}`,
        `- dependents: ${target.dependentCount}`,
        '',
        'Missing Edge Sources',
        ...missingEdgeLines,
        '',
        'Current Node Sources',
        ...sourceLines,
        '',
        'Research Focus',
        `- Sourced date or explicit uncertainty for: ${target.name}`,
        `- Strong node-level source: "${target.name}" review official primary`,
        edgeTargets
            ? `- Edge-source query terms: "${target.name}" ${edgeTargets}`
            : `- Edge-source query terms: "${target.name}" prerequisites dependency`,
        '',
        'Fast Commands',
        '```bash',
        ...commandLines(target.id),
        '```'
    ].join('\n');
}

function renderText(result) {
    console.log('Launch Readiness Work Queue');
    console.log('Basis: remaining placeholder-date, node-source, edge-source, and review-status debt.');
    console.log('');
    if (!result.queue.length) {
        console.log('No scored data-quality debt found.');
        return;
    }

    console.log('Top Candidates');
    result.queue.forEach((row, index) => {
        console.log(`${index + 1}. ${row.id} [${row.score}] - ${row.debt.join('; ') || 'no mechanical debt'} - ${row.file}`);
    });
    console.log('');
    console.log(renderTarget(result.target));
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    const result = buildQueue(loadData(), options);
    if (options.json) {
        const serializable = {
            queue: result.queue.map(({ item, missingEdgeSources, ...row }) => ({
                ...row,
                missingEdgeSources: missingEdgeSources.map(edge => ({
                    prerequisite: edge.prerequisite,
                    type: edge.type,
                    evidence_level: edge.evidence_level,
                    confidence: edge.confidence,
                    reviewStatus: edge.reviewStatus
                }))
            })),
            target: result.target && result.target.id
        };
        console.log(JSON.stringify(serializable, null, 2));
    } else {
        renderText(result);
    }
}

if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error(error.message);
        usage(1);
    }
}

module.exports = {
    buildQueue,
    commandLines,
    usesEraDefaultDate
};

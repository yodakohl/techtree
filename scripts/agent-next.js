#!/usr/bin/env node
const {
    loadData,
    hasLocatedNodeSource,
    hasLocatedStrongTrustSource,
    hasNodeSource,
    hasStrongTrustSource
} = require('./accuracy-risk-report');
const {
    ERA_DEFAULT_DATES,
    getDependencyEdges
} = require('./edge-schema');
const {
    FUTURE_EXCLUSION_NOTE,
    isLaunchQualityNode
} = require('./quality-scope');
const { sourceEvidenceMismatch } = require('./audit-random-source-fit');

const DEFAULT_LIMIT = 10;
const FOCUS_OPTIONS = new Set(['chronology', 'edges', 'node-evidence', 'review-status', 'source-fit']);

function parseArgs(args) {
    const options = {
        batch: false,
        focus: null,
        id: null,
        limit: DEFAULT_LIMIT,
        json: false
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--batch') {
            options.batch = true;
        } else if (arg === '--json') {
            options.json = true;
        } else if (arg === '--focus') {
            options.focus = args[index + 1];
            index += 1;
        } else if (arg.startsWith('--focus=')) {
            options.focus = arg.slice('--focus='.length);
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
    if (options.focus && !FOCUS_OPTIONS.has(options.focus)) {
        throw new Error(`--focus must be one of: ${[...FOCUS_OPTIONS].join(', ')}`);
    }
    return options;
}

function usage(exitCode = 1) {
    const stream = exitCode ? process.stderr : process.stdout;
    stream.write(`Usage: node scripts/agent-next.js [--batch] [--focus chronology|edges|node-evidence|review-status|source-fit] [--limit 10] [--id node_id] [--json]

Ranks the next launch-readiness data-quality targets from remaining source,
edge-source, review-status, and placeholder-date debt. Future forecast nodes
are excluded from launch-quality source/perfection debt.
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

function onlyWeakOrGenericSources(item) {
    const sources = (item.sources || []).filter(source => source.supports?.includes('node'));
    return sources.length > 0 && sources.every(source => {
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
    if (!isLaunchQualityNode(item)) {
        return {
            score: 0,
            labels: ['Future forecast node excluded from launch-quality source/perfection checks'],
            missingEdgeSources: [],
            missingNodeSource: false,
            weakNodeSources: false,
            lacksStrongNodeSource: false,
            lacksLocatedNodeSource: false,
            lacksLocatedStrongSource: false,
            eraDefaultDate: false,
            unknownDate: false,
            generated: false,
            structurallyValidated: false,
            sourceFitMismatch: false,
            categories: []
        };
    }

    const edges = getDependencyEdges(item);
    const missingEdgeSources = edges.filter(edge => !edgeHasSource(edge));
    const eraDefaultDate = usesEraDefaultDate(item);
    const missingNodeSource = !hasNodeSource(item);
    const weakNodeSources = onlyWeakOrGenericSources(item);
    const lacksStrongNodeSource = !missingNodeSource && !hasStrongTrustSource(item);
    const lacksLocatedNodeSource = !missingNodeSource && !hasLocatedNodeSource(item);
    const lacksLocatedStrongSource = !lacksStrongNodeSource && !hasLocatedStrongTrustSource(item);
    const generated = item.reviewStatus === 'generated';
    const structurallyValidated = item.reviewStatus === 'structurally_validated';
    const unknownDate = item.datePrecision === 'unknown';
    const sourceFitMismatch = sourceEvidenceMismatch(item);

    const labels = [];
    if (missingEdgeSources.length) labels.push(`${missingEdgeSources.length}/${edges.length} dependency edges missing sources`);
    if (eraDefaultDate) labels.push('era-default placeholder date');
    if (missingNodeSource) labels.push('missing node source');
    if (weakNodeSources) labels.push('weak/generic node sources only');
    if (lacksStrongNodeSource) labels.push('no strong node source');
    if (lacksLocatedNodeSource) labels.push('no located node evidence');
    if (lacksLocatedStrongSource) labels.push('no located strong-type evidence');
    if (unknownDate) labels.push('unknown date precision');
    if (generated) labels.push('generated review status');
    if (structurallyValidated) labels.push('not source_checked');
    if (sourceFitMismatch) labels.push('mechanical node/source evidence mismatch');

    const categories = [];
    if (eraDefaultDate || unknownDate) categories.push('chronology');
    if (missingEdgeSources.length) categories.push('edges');
    if (missingNodeSource || weakNodeSources || lacksStrongNodeSource || lacksLocatedNodeSource || lacksLocatedStrongSource) {
        categories.push('node-evidence');
    }
    if (generated || structurallyValidated) categories.push('review-status');
    if (sourceFitMismatch) categories.push('source-fit');

    let score = 0;
    score += missingEdgeSources.length * 14;
    if (eraDefaultDate) score += item.era === 'Future' ? 18 : 26;
    if (missingNodeSource) score += 25;
    if (weakNodeSources) score += 14;
    if (lacksStrongNodeSource) score += 8;
    if (lacksLocatedNodeSource) score += 12;
    if (lacksLocatedStrongSource) score += 5;
    if (unknownDate) score += 32;
    if (generated) score += 18;
    if (structurallyValidated) score += 6;
    if (sourceFitMismatch) score += 16;
    score += Math.min(dependents.length, 15);

    return {
        score,
        labels,
        missingEdgeSources,
        missingNodeSource,
        weakNodeSources,
        lacksStrongNodeSource,
        lacksLocatedNodeSource,
        lacksLocatedStrongSource,
        eraDefaultDate,
        unknownDate,
        generated,
        structurallyValidated,
        sourceFitMismatch,
        categories
    };
}

function buildQueue(data = loadData(), options = {}) {
    const limit = options.limit || DEFAULT_LIMIT;
    const dependents = dependentMap(data);
    const byId = new Map(data.map(item => [item.id, item]));

    const queue = data
        .filter(item => isLaunchQualityNode(item))
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
                categories: debt.categories,
                debt: debt.labels,
                item,
                missingEdgeSources: debt.missingEdgeSources
            };
        })
        .filter(Boolean)
        .filter(row => !options.focus || options.id === row.id || row.categories.includes(options.focus))
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
                categories: debt.categories,
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

function oneLine(value, maxLength = 220) {
    const normalized = String(value || '').replace(/\s+/g, ' ').trim();
    if (normalized.length <= maxLength) return normalized;
    return `${normalized.slice(0, maxLength - 3)}...`;
}

function nodeSources(item) {
    return (item.sources || []).filter(source => source.supports?.includes('node'));
}

function renderBatch(result, options) {
    const byFile = new Map();
    for (const row of result.queue) {
        if (!byFile.has(row.file)) byFile.set(row.file, []);
        byFile.get(row.file).push(row.id);
    }

    const lines = [
        'Launch Readiness Batch',
        `Scope: ${result.queue.length} highest-ranked pre-Future target(s)${options.focus ? ` focused on ${options.focus}` : ''}.`,
        FUTURE_EXCLUSION_NOTE,
        '',
        'Edit Groups'
    ];

    for (const [file, ids] of [...byFile.entries()].sort(([left], [right]) => left.localeCompare(right))) {
        lines.push(`- ${file}: ${ids.join(', ')}`);
    }

    lines.push('', 'Target Evidence');
    result.queue.forEach((row, index) => {
        lines.push(
            '',
            `${index + 1}. ${row.id} [${row.score}] - ${row.name}`,
            `   claim: ${row.era}, ${dateLabel(row.item)}; ${row.item.region || 'unknown region'}; ${row.reviewStatus || 'unknown status'}`,
            `   debt: ${row.debt.join('; ') || 'none detected'}`,
            `   file/dependents: ${row.file}; ${row.dependentCount}`
        );

        const sources = nodeSources(row.item);
        if (!sources.length) {
            lines.push('   node source: none');
        } else {
            for (const source of sources) {
                const locator = source.source_locator || source.locator || 'missing';
                lines.push(`   node source: ${sourceLabel(source)}; locator: ${oneLine(locator)}; ${source.url || 'no URL'}`);
            }
        }

        if (row.missingEdgeSources.length) {
            lines.push(`   unsourced edges: ${row.missingEdgeSources.map(edge => `${edge.prerequisite} (${edge.type || 'unknown'})`).join(', ')}`);
        } else {
            lines.push('   unsourced edges: none');
        }
        lines.push(`   research query: "${row.name}" history first ${row.item.firstKnownDate ?? ''} primary source`);
    });

    const focusArg = options.focus ? ` --focus ${options.focus}` : '';
    lines.push(
        '',
        'Batch Workflow',
        '```bash',
        `npm run agent:batch -- --limit ${options.limit}${focusArg}`,
        '# use node-packet only for targets whose scope or dependency semantics will change',
        'npm run agent:ready',
        '```'
    );
    return lines.join('\n');
}

function renderText(result, options) {
    if (options.batch) {
        console.log(renderBatch(result, options));
        return;
    }
    console.log('Launch Readiness Work Queue');
    console.log('Basis: remaining pre-Future placeholder-date, node-source, edge-source, and review-status debt.');
    console.log(FUTURE_EXCLUSION_NOTE);
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
                nodeSources: nodeSources(item).map(source => ({
                    title: source.title,
                    publisher: source.publisher,
                    url: source.url,
                    source_type: source.source_type,
                    source_locator: source.source_locator || source.locator || null
                })),
                missingEdgeSources: missingEdgeSources.map(edge => ({
                    prerequisite: edge.prerequisite,
                    type: edge.type,
                    evidence_level: edge.evidence_level,
                    confidence: edge.confidence,
                    reviewStatus: edge.reviewStatus
                }))
            })),
            target: result.target && result.target.id,
            focus: options.focus
        };
        console.log(JSON.stringify(serializable, null, 2));
    } else {
        renderText(result, options);
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
    debtFor,
    parseArgs,
    renderBatch,
    usesEraDefaultDate
};

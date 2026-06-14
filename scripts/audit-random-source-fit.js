#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');
const { ERA_DEFAULT_DATES, getDependencyEdges } = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');
const REPORT_PATH = path.join(__dirname, '..', 'docs', 'RANDOM_SOURCE_FIT_AUDIT.md');
const SEED = 'techtree-random-source-fit-v1';
const SAMPLE_SIZE = 50;

const args = new Set(process.argv.slice(2));
const check = args.has('--check');

function hashSeed(value) {
    let hash = 1779033703 ^ value.length;
    for (let i = 0; i < value.length; i += 1) {
        hash = Math.imul(hash ^ value.charCodeAt(i), 3432918353);
        hash = (hash << 13) | (hash >>> 19);
    }
    return function nextHash() {
        hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        return (hash ^= hash >>> 16) >>> 0;
    };
}

function seededRandom(seed) {
    const nextHash = hashSeed(seed);
    let state = nextHash();
    return function random() {
        state += 0x6D2B79F5;
        let t = state;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function loadNodes() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => {
            const nodes = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            return nodes.map(node => ({ ...node, __file: file }));
        })
        .sort((a, b) => a.id.localeCompare(b.id));
}

function sample(nodes) {
    const random = seededRandom(SEED);
    const copy = nodes.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy.slice(0, SAMPLE_SIZE).sort((a, b) => a.era.localeCompare(b.era) || a.id.localeCompare(b.id));
}

function markdownEscape(value) {
    return String(value ?? '')
        .replace(/\|/g, '\\|')
        .replace(/\r?\n/g, '<br>')
        .trim();
}

function titles(sources) {
    return (sources || [])
        .map(source => source?.title)
        .filter(Boolean)
        .join('; ');
}

function isWikipediaSearchSource(source) {
    return /wikipedia\.org\/wiki\/Special:Search/i.test(source?.url || '')
        || /^Wikipedia page for /i.test(source?.title || '');
}

function meaningfulTokens(value) {
    const stop = new Set([
        'and', 'the', 'for', 'with', 'from', 'into', 'systems', 'system', 'technology', 'technologies',
        'advanced', 'early', 'modern', 'ancient', 'classical', 'medieval', 'renaissance', 'industrial',
        'forms', 'platforms', 'networks', 'network', 'overview', 'history', 'introduction'
    ]);
    return String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter(token => token.length >= 4 && !stop.has(token));
}

function titleMismatch(node) {
    const nodeSources = (node.sources || []).filter(source => source.supports?.includes('node'));
    if (!nodeSources.length) return false;
    const tokens = meaningfulTokens(`${node.id} ${node.name}`);
    if (!tokens.length) return false;
    const titleText = nodeSources.map(source => source.title || '').join(' ').toLowerCase();
    return !tokens.some(token => titleText.includes(token));
}

function hasConceptOrInstitutionScope(node) {
    const text = `${node.id} ${node.name}`.toLowerCase();
    return /\b(treaty|treaties|economics|governance|government|rights|philosophy|law|legal|libraries|library|school|schools|accounting|market|markets|policy|justice|culture|archive|archives)\b/.test(text);
}

function hasGenericTemplateEdgeNote(edge) {
    return /plausible dependency|broadly enables|provides a capability|earlier historical predecessor|not a one-to-one|supports the later emergence/i.test(edge.notes || '');
}

function nodeFlags(node, edges) {
    const edgeSources = edges.flatMap(edge => edge.sources || []);
    const allSources = [...(node.sources || []), ...edgeSources];
    const flags = [];
    if (allSources.some(isWikipediaSearchSource)) flags.push('wikipedia_search_source');
    if (edges.length && edges.some(edge => !Array.isArray(edge.sources) || edge.sources.length === 0)) flags.push('no_edge_sources');
    if (edges.some(hasGenericTemplateEdgeNote)) flags.push('generic_template_edge_note');
    if (titleMismatch(node)) flags.push('source_title_mismatch');
    if (node.era === 'Future' && node.reviewStatus === 'source_checked') flags.push('future_node_marked_source_checked');
    if (node.reviewStatus === 'source_checked' && node.firstKnownDate === ERA_DEFAULT_DATES[node.era]) flags.push('source_checked_placeholder_date');
    if (hasConceptOrInstitutionScope(node)) flags.push('concept_or_institution_not_technology');
    return flags;
}

function dependencySummary(edges) {
    if (!edges.length) return 'None';
    return edges
        .map(edge => `${edge.prerequisite} (${edge.evidenceType || 'unspecified'}; ${edge.reviewStatus || 'unreviewed'})`)
        .join('; ');
}

function edgeSourceSummary(edges) {
    const values = edges.flatMap(edge => (edge.sources || []).map(source => `${edge.prerequisite}: ${source.title}`));
    return values.length ? values.join('; ') : 'None';
}

function renderReport() {
    const nodes = loadNodes();
    const sampled = sample(nodes);
    const rows = sampled.map(node => {
        const edges = getDependencyEdges(node);
        return {
            node,
            edges,
            flags: nodeFlags(node, edges)
        };
    });
    const flagCounts = new Map();
    for (const row of rows) {
        for (const flag of row.flags) flagCounts.set(flag, (flagCounts.get(flag) || 0) + 1);
    }

    const lines = [];
    lines.push('# Random Source-Fit Audit');
    lines.push('');
    lines.push('Generated by `node scripts/audit-random-source-fit.js`.');
    lines.push('');
    lines.push(`- Seed: \`${SEED}\``);
    lines.push(`- Sample size: ${SAMPLE_SIZE}`);
    lines.push(`- Canonical node count: ${nodes.length}`);
    lines.push('');
    lines.push('## Flag totals');
    lines.push('');
    if (flagCounts.size) {
        for (const [flag, count] of [...flagCounts.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
            lines.push(`- ${flag}: ${count}`);
        }
    } else {
        lines.push('- none: 0');
    }
    lines.push('');
    lines.push('## Sampled nodes');
    lines.push('');
    lines.push('| id | name | era | firstKnownDate | reviewStatus | node source titles | dependency edges | edge source titles | flags |');
    lines.push('| --- | --- | --- | ---: | --- | --- | --- | --- | --- |');
    for (const { node, edges, flags } of rows) {
        lines.push([
            node.id,
            node.name,
            node.era,
            node.firstKnownDate,
            node.reviewStatus || '',
            titles((node.sources || []).filter(source => source.supports?.includes('node'))) || 'None',
            dependencySummary(edges),
            edgeSourceSummary(edges),
            flags.join(', ') || 'none'
        ].map(markdownEscape).join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
    }
    lines.push('');
    return `${lines.join('\n')}\n`;
}

const report = renderReport();

if (check) {
    const current = fs.existsSync(REPORT_PATH) ? fs.readFileSync(REPORT_PATH, 'utf8') : '';
    if (current !== report) {
        console.error('docs/RANDOM_SOURCE_FIT_AUDIT.md is stale. Run `node scripts/audit-random-source-fit.js`.');
        process.exit(1);
    }
    console.log('Random source-fit audit report is current.');
} else {
    fs.writeFileSync(REPORT_PATH, report);
    console.log(`Wrote ${path.relative(process.cwd(), REPORT_PATH)}`);
}

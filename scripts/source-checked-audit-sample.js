#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { ERA_DEFAULT_DATES } = require('./edge-schema');
const { isTechnologyDataFile } = require('./data-files');
const { hasStrongTrustSource, loadData } = require('./accuracy-risk-report');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'SOURCE_CHECKED_AUDIT_SAMPLE.md');
const SAMPLE_ERAS = ['Ancient', 'Classical', 'Industrial', 'Modern', 'Future'];
const DEFAULT_BASE_REF = '44d9544^';

function argValue(name, fallback) {
    const index = process.argv.indexOf(name);
    if (index === -1 || index + 1 >= process.argv.length) return fallback;
    return process.argv[index + 1];
}

function markdownTable(rows) {
    return [
        `| ${rows[0].join(' | ')} |`,
        `| ${rows[0].map(() => '---').join(' | ')} |`,
        ...rows.slice(1).map(row => `| ${row.map(value => String(value ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)
    ].join('\n');
}

function dataFilesAt(ref) {
    const files = fs.readdirSync(DATA_DIR).filter(isTechnologyDataFile).sort();
    const byId = new Map();
    for (const file of files) {
        const content = execFileSync('git', ['show', `${ref}:data/${file}`], {
            encoding: 'utf8',
            maxBuffer: 32 * 1024 * 1024
        });
        for (const item of JSON.parse(content)) {
            byId.set(item.id, item);
        }
    }
    return byId;
}

function usesEraDefaultDate(item) {
    const defaults = ERA_DEFAULT_DATES[item.era];
    return Boolean(defaults)
        && item.firstKnownDate === defaults.firstKnownDate
        && item.datePrecision === defaults.datePrecision
        && item.region === defaults.region;
}

function nodeSources(item) {
    return (item.sources || []).filter(source => Array.isArray(source.supports) && source.supports.includes('node'));
}

function isWeakOrGenericSource(source) {
    return source.source_type === 'weak_web'
        || source.source_type === 'generic_overview'
        || /wikipedia/i.test(`${source.title || ''} ${source.url || ''} ${source.publisher || ''}`);
}

function sourceTitle(item) {
    return nodeSources(item)
        .map(source => `${source.title || source.url || 'Untitled source'} (${source.source_type || 'unknown'})`)
        .join('; ');
}

function rowVerdict(item) {
    const sources = nodeSources(item);
    const hasNodeSource = sources.length > 0;
    const hasNonPlaceholderDate = !usesEraDefaultDate(item);
    const hasNonGenericNodeSource = sources.some(source => !isWeakOrGenericSource(source));
    const hasStrongSource = hasStrongTrustSource(item);

    if (hasNodeSource && hasNonPlaceholderDate && hasNonGenericNodeSource && hasStrongSource) return 'PASS';
    return 'REVIEW';
}

function buildReport({ baseRef = DEFAULT_BASE_REF } = {}) {
    const base = dataFilesAt(baseRef);
    const current = loadData()
        .filter(item => SAMPLE_ERAS.includes(item.era))
        .filter(item => item.reviewStatus === 'source_checked')
        .filter(item => base.get(item.id)?.reviewStatus !== 'source_checked');

    const commits = execFileSync('git', [
        'log',
        '--format=%h %ad %s',
        '--date=short',
        `${baseRef.replace(/\^$/, '')}..HEAD`,
        '--',
        'data'
    ], { encoding: 'utf8' })
        .trim()
        .split('\n')
        .filter(Boolean)
        .slice(0, 16);

    const rows = [['ID', 'Era', 'Date check', 'Node source support', 'Non-generic source', 'Strong source', 'Verdict', 'Source title']];
    const sampled = [];
    for (const era of SAMPLE_ERAS) {
        sampled.push(...current
            .filter(item => item.era === era)
            .sort((a, b) => a.id.localeCompare(b.id))
            .slice(0, 10));
    }

    for (const item of sampled) {
        const sources = nodeSources(item);
        rows.push([
            `\`${item.id}\``,
            item.era,
            usesEraDefaultDate(item) ? 'placeholder' : 'non-placeholder',
            sources.length ? 'node' : 'missing',
            sources.some(source => !isWeakOrGenericSource(source)) ? 'yes' : 'no',
            hasStrongTrustSource(item) ? 'yes' : 'no',
            rowVerdict(item),
            sourceTitle(item)
        ]);
    }

    const passCount = sampled.filter(item => rowVerdict(item) === 'PASS').length;
    const placeholderCount = sampled.filter(usesEraDefaultDate).length;
    const weakOnlyCount = sampled.filter(item => !nodeSources(item).some(source => !isWeakOrGenericSource(source))).length;

    return [
        '# Source-Checked Audit Sample',
        '',
        `Baseline for newly source-checked comparison: \`${baseRef}\`.`,
        '',
        'This deterministic sample covers 10 newly source-checked nodes from each requested era where available. It verifies local trust metadata: node-level source support, non-placeholder chronology, non-generic source status, and strong source class. Rows marked `REVIEW` need human source-content review before they should be treated as textbook-quality evidence.',
        '',
        `Sampled nodes: ${sampled.length}`,
        `Rows passing all local checks: ${passCount} / ${sampled.length}`,
        `Rows still using era-default placeholder dates: ${placeholderCount} / ${sampled.length}`,
        `Rows with only weak/generic/Wikipedia-like node sources: ${weakOnlyCount} / ${sampled.length}`,
        '',
        '## Recent Source-Check Commits',
        '',
        ...commits.map(commit => `- ${commit}`),
        '',
        '## Sample',
        '',
        markdownTable(rows),
        ''
    ].join('\n');
}

function main() {
    const baseRef = argValue('--base', DEFAULT_BASE_REF);
    const output = `${buildReport({ baseRef })}\n`;
    fs.writeFileSync(OUTPUT_FILE, output);
    console.log(`Wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    buildReport
};

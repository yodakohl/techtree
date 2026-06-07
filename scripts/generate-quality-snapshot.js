#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
    TAXONOMY_FILE,
    loadData,
    makeReport,
    percentage,
    readJson
} = require('./accuracy-risk-report');

const ROOT_DIR = path.join(__dirname, '..');
const README_FILE = path.join(ROOT_DIR, 'README.md');
const SNAPSHOT_JSON_FILE = path.join(ROOT_DIR, 'data', 'quality-snapshot.json');
const SNAPSHOT_MD_FILE = path.join(ROOT_DIR, 'docs', 'QUALITY_SNAPSHOT.md');
const START_MARKER = '<!-- QUALITY_SNAPSHOT_START -->';
const END_MARKER = '<!-- QUALITY_SNAPSHOT_END -->';

const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');
const silent = args.has('--silent') || checkOnly;

const MANUAL_SAMPLE = {
    label: 'Manual risk-weighted sample',
    passed: 40,
    total: 40,
    note: 'Passed after correction; this is not proof of global accuracy.',
    source: 'docs/ACCURACY_SAMPLE_2026-06-06.md'
};

function formatNumber(value) {
    return Number(value).toLocaleString('en-US');
}

function metric(label, value, denominator = null, note = null) {
    const formatted = denominator === null
        ? formatNumber(value)
        : `${formatNumber(value)} / ${formatNumber(denominator)}`;
    return { label, value, denominator, formatted, note };
}

function buildSnapshot(report, generatedAt = report.generatedAt) {
    const t = report.totals;
    const metrics = [
        metric('Technologies', t.technologies),
        metric('Source-checked nodes', t.sourceChecked, t.technologies, percentage(t.sourceChecked, t.technologies)),
        metric('Nodes with node-level sources', t.nodesWithSources, t.technologies, percentage(t.nodesWithSources, t.technologies)),
        metric('Dependency edges with edge-level sources', t.edgesWithSources, t.totalEdges, percentage(t.edgesWithSources, t.totalEdges)),
        metric('Era-default dates', t.eraDefaultDates, t.technologies, percentage(t.eraDefaultDates, t.technologies)),
        metric(MANUAL_SAMPLE.label, MANUAL_SAMPLE.passed, MANUAL_SAMPLE.total, 'passed after correction')
    ];

    return {
        generatedAt,
        description: 'Trust snapshot, not proof of global accuracy.',
        metrics,
        manualSample: MANUAL_SAMPLE,
        riskReportTotals: t
    };
}

function renderMetricTable(metrics) {
    return [
        '| Metric | Current |',
        '| --- | --- |',
        ...metrics.map(item => `| ${item.label} | ${item.formatted}${item.note ? ` (${item.note})` : ''} |`)
    ].join('\n');
}

function renderReadmeBlock(snapshot) {
    return [
        START_MARKER,
        '## Quality Snapshot',
        '',
        `Generated ${snapshot.generatedAt.slice(0, 10)} from the same dataset audit used by \`npm run accuracy:risks\`. This is a trust snapshot, not proof of global accuracy.`,
        '',
        renderMetricTable(snapshot.metrics),
        '',
        `Full generated snapshot: [docs/QUALITY_SNAPSHOT.md](docs/QUALITY_SNAPSHOT.md).`,
        END_MARKER
    ].join('\n');
}

function renderSnapshotMarkdown(snapshot) {
    return [
        '# Quality Snapshot',
        '',
        `Generated: ${snapshot.generatedAt}`,
        '',
        'This is a trust snapshot generated from the same report object used by `npm run accuracy:risks`; it is not proof of global accuracy.',
        '',
        renderMetricTable(snapshot.metrics),
        '',
        `Manual sample source: [${snapshot.manualSample.source}](${path.basename(snapshot.manualSample.source)})`
    ].join('\n') + '\n';
}

function replaceReadmeBlock(readme, block) {
    const start = readme.indexOf(START_MARKER);
    const end = readme.indexOf(END_MARKER);
    if (start === -1 || end === -1 || end < start) {
        throw new Error(`README.md must contain ${START_MARKER} and ${END_MARKER}`);
    }
    return `${readme.slice(0, start)}${block}${readme.slice(end + END_MARKER.length)}`;
}

function existingGeneratedAt() {
    try {
        const current = JSON.parse(fs.readFileSync(SNAPSHOT_JSON_FILE, 'utf8'));
        return current.generatedAt;
    } catch (error) {
        return null;
    }
}

function buildOutputs(generatedAt = null) {
    const report = makeReport(loadData(), readJson(TAXONOMY_FILE));
    const snapshot = buildSnapshot(report, generatedAt || report.generatedAt);
    const readmeBlock = renderReadmeBlock(snapshot);
    const readme = replaceReadmeBlock(fs.readFileSync(README_FILE, 'utf8'), readmeBlock);
    const json = `${JSON.stringify(snapshot, null, 2)}\n`;
    const markdown = renderSnapshotMarkdown(snapshot);
    return { json, markdown, readme };
}

function compareFile(errors, file, expected) {
    let actual = '';
    try {
        actual = fs.readFileSync(file, 'utf8');
    } catch (error) {
        errors.push(`${path.relative(ROOT_DIR, file)} is missing`);
        return;
    }
    if (actual !== expected) errors.push(`${path.relative(ROOT_DIR, file)} is stale`);
}

function main() {
    const outputs = buildOutputs(checkOnly ? existingGeneratedAt() : null);
    if (checkOnly) {
        const errors = [];
        compareFile(errors, SNAPSHOT_JSON_FILE, outputs.json);
        compareFile(errors, SNAPSHOT_MD_FILE, outputs.markdown);
        compareFile(errors, README_FILE, outputs.readme);
        if (errors.length) {
            console.error(`Quality snapshot check failed with ${errors.length} issue(s):`);
            for (const error of errors) console.error(`- ${error}`);
            console.error('Run npm run quality:snapshot to regenerate.');
            process.exit(1);
        }
        console.log('Quality snapshot is current.');
        return;
    }

    fs.writeFileSync(SNAPSHOT_JSON_FILE, outputs.json);
    fs.writeFileSync(SNAPSHOT_MD_FILE, outputs.markdown);
    fs.writeFileSync(README_FILE, outputs.readme);
    if (!silent) {
        console.log(`Wrote ${path.relative(ROOT_DIR, SNAPSHOT_JSON_FILE)}`);
        console.log(`Wrote ${path.relative(ROOT_DIR, SNAPSHOT_MD_FILE)}`);
        console.log('Updated README.md quality snapshot block');
    }
}

main();

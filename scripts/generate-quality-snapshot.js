#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
    FUTURE_EXCLUSION_NOTE,
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

const MANUAL_SAMPLE_AUDIT = {
    label: 'Risk-weighted manual sample remediation audit',
    sampled: 40,
    defectsFound: 25,
    remediated: 40,
    source: 'docs/ACCURACY_SAMPLE_2026-06-06.md',
    interpretation: 'Risk-weighted remediation audit; not a random or global accuracy estimate.'
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
        metric('Technologies', t.totalTechnologies),
        metric('Launch-quality scope (non-Future nodes)', t.launchQualityTechnologies, t.totalTechnologies, `${percentage(t.launchQualityTechnologies, t.totalTechnologies)}; ${t.excludedFutureTechnologies} Future excluded`),
        metric('Source-checked nodes', t.sourceChecked, t.launchQualityTechnologies, percentage(t.sourceChecked, t.launchQualityTechnologies)),
        metric('Source-checked nodes with non-placeholder dates', t.sourceCheckedNonPlaceholderDates, t.sourceChecked, percentage(t.sourceCheckedNonPlaceholderDates, t.sourceChecked)),
        metric('Source-checked nodes with placeholder dates', t.sourceCheckedEraDefaultDates, t.sourceChecked, percentage(t.sourceCheckedEraDefaultDates, t.sourceChecked)),
        metric('Source-checked nodes with primary/review/textbook/official sources', t.sourceCheckedStrongSources, t.sourceChecked, percentage(t.sourceCheckedStrongSources, t.sourceChecked)),
        metric('Source-checked nodes using only weak/generic sources', t.sourceCheckedOnlyWeakGeneric, t.sourceChecked, percentage(t.sourceCheckedOnlyWeakGeneric, t.sourceChecked)),
        metric('Nodes with node-level sources', t.nodesWithSources, t.launchQualityTechnologies, percentage(t.nodesWithSources, t.launchQualityTechnologies)),
        metric('Dependency edges with edge-level sources', t.edgesWithSources, t.totalEdges, percentage(t.edgesWithSources, t.totalEdges)),
        metric('Era-default placeholder dates', t.eraDefaultDates, t.launchQualityTechnologies, percentage(t.eraDefaultDates, t.launchQualityTechnologies))
    ];

    return {
        generatedAt,
        description: 'Launch-quality trust snapshot for non-Future nodes, not proof of global accuracy.',
        futureExclusionNote: FUTURE_EXCLUSION_NOTE,
        metrics,
        manualSampleAudit: MANUAL_SAMPLE_AUDIT,
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
        `Generated ${snapshot.generatedAt.slice(0, 10)} from the same dataset audit used by \`npm run accuracy:risks\`. This is a launch-quality trust snapshot for non-Future nodes, not proof of global accuracy.`,
        '',
        snapshot.futureExclusionNote,
        '',
        renderMetricTable(snapshot.metrics),
        '',
        'Manual remediation audits are tracked separately from headline accuracy metrics; see docs/QUALITY_SNAPSHOT.md.',
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
        'This is a launch-quality trust snapshot generated from the same report object used by `npm run accuracy:risks`; it covers non-Future nodes and is not proof of global accuracy.',
        '',
        snapshot.futureExclusionNote,
        '',
        renderMetricTable(snapshot.metrics),
        '',
        '## Manual audit note',
        '',
        `The June 2026 risk-weighted manual sample is tracked as a remediation audit, not as a headline accuracy metric. It deliberately targeted high-risk claims; ${snapshot.manualSampleAudit.defectsFound} / ${snapshot.manualSampleAudit.sampled} sampled claims needed correction or tighter scoping before remediation. The post-fix ${snapshot.manualSampleAudit.remediated} / ${snapshot.manualSampleAudit.sampled} status means the sampled defects were closed, not that the graph is globally accurate.`,
        '',
        `Manual audit source: [${snapshot.manualSampleAudit.source}](${path.basename(snapshot.manualSampleAudit.source)})`
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

function replaceReadmePublicCounts(readme, snapshot) {
    const technologies = snapshot.riskReportTotals.totalTechnologies;
    const plainCount = String(technologies);
    const formattedCount = formatNumber(technologies);
    return readme
        .replace(
            /https:\/\/img\.shields\.io\/badge\/technologies-\d+-6f42c1\.svg/g,
            `https://img.shields.io/badge/technologies-${plainCount}-6f42c1.svg`
        )
        .replace(
            /\*\*[\d,]+ validated technologies\*\*/g,
            `**${formattedCount} validated technologies**`
        );
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
    const readme = replaceReadmePublicCounts(
        replaceReadmeBlock(fs.readFileSync(README_FILE, 'utf8'), readmeBlock),
        snapshot
    );
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

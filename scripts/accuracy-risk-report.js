#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
    ERA_DEFAULT_DATES,
    getDependencyEdges,
    sourceQualityWeight
} = require('./edge-schema');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const ERA_ORDER = ['Ancient', 'Classical', 'Medieval', 'Renaissance', 'Industrial', 'Modern', 'Future'];

function argValue(name, fallback) {
    const index = process.argv.indexOf(name);
    if (index === -1 || index + 1 >= process.argv.length) return fallback;
    return process.argv[index + 1];
}

const outputJson = process.argv.includes('--json');
const outputMarkdown = process.argv.includes('--markdown');
const limit = Number.parseInt(argValue('--limit', '20'), 10) || 20;

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => {
            const items = readJson(path.join(DATA_DIR, file));
            if (!Array.isArray(items)) throw new Error(`${file} must contain a JSON array`);
            return items.map(item => ({ ...item, __file: file }));
        });
}

function percentage(numerator, denominator) {
    if (!denominator) return '0.0%';
    return `${((100 * numerator) / denominator).toFixed(1)}%`;
}

function increment(map, key, amount = 1) {
    map.set(key, (map.get(key) || 0) + amount);
}

function defaultDateFor(item) {
    return ERA_DEFAULT_DATES[item.era]?.firstKnownDate;
}

function usesEraDefaultDate(item) {
    const defaults = ERA_DEFAULT_DATES[item.era];
    if (!defaults) return false;
    return item.firstKnownDate === defaults.firstKnownDate
        && item.datePrecision === defaults.datePrecision
        && item.region === defaults.region;
}

function hasSource(item) {
    return Array.isArray(item.sources) && item.sources.length > 0;
}

function allSourcesBelow(item, threshold) {
    return hasSource(item) && item.sources.every(source => sourceQualityWeight(source.source_type) < threshold);
}

function allSourcesGeneric(item) {
    return hasSource(item) && item.sources.every(source => source.source_type === 'generic_overview');
}

function sourceTitleList(item) {
    return (item.sources || []).map(source => source.title).join('; ');
}

function makeReport(data, taxonomy) {
    const reviewStatus = new Map();
    const eraStats = Object.fromEntries(ERA_ORDER.map(era => [era, {
        total: 0,
        eraDefaultDate: 0,
        sourceChecked: 0,
        sourceCheckedEraDefaultDate: 0
    }]));
    const fieldStats = Object.fromEntries(Object.keys(taxonomy.fields || {}).sort().map(field => [field, {
        total: 0,
        sourced: 0,
        sourceChecked: 0,
        eraDefaultDate: 0
    }]));
    const edgeTypes = new Map();
    const edgeEvidence = new Map();
    const outgoingCounts = new Map();
    const candidates = new Map();

    let nodesWithSources = 0;
    let sourceChecked = 0;
    let sourceCheckedNoSources = 0;
    let sourceCheckedAllWeak = 0;
    let sourceCheckedGenericOld = 0;
    let eraDefaultDates = 0;
    let sourceCheckedEraDefaultDates = 0;
    let totalEdges = 0;
    let edgesWithSources = 0;

    function addCandidate(item, risk, priority, reason) {
        const existing = candidates.get(item.id);
        const entry = existing || {
            id: item.id,
            name: item.name,
            era: item.era,
            firstKnownDate: item.firstKnownDate,
            reviewStatus: item.reviewStatus,
            fields: item.fields || [],
            sources: sourceTitleList(item),
            priority: 0,
            risks: []
        };
        entry.priority = Math.max(entry.priority, priority);
        entry.risks.push({ risk, reason });
        candidates.set(item.id, entry);
    }

    for (const item of data) {
        increment(reviewStatus, item.reviewStatus || 'unknown');
        if (hasSource(item)) nodesWithSources += 1;
        if (item.reviewStatus === 'source_checked') sourceChecked += 1;

        const era = eraStats[item.era];
        if (era) {
            era.total += 1;
            if (item.reviewStatus === 'source_checked') era.sourceChecked += 1;
        }

        if (usesEraDefaultDate(item)) {
            eraDefaultDates += 1;
            if (era) era.eraDefaultDate += 1;
            if (item.reviewStatus === 'source_checked') {
                sourceCheckedEraDefaultDates += 1;
                if (era) era.sourceCheckedEraDefaultDate += 1;
                addCandidate(
                    item,
                    'source_checked_era_default_date',
                    item.era === 'Future' ? 45 : 70,
                    `Source-checked node still uses the ${item.era} default date ${defaultDateFor(item)}.`
                );
            } else if ((item.fields || []).length || item.maturity) {
                addCandidate(
                    item,
                    'curated_era_default_date',
                    item.era === 'Future' ? 35 : 55,
                    `Curated or field-tagged node still uses the ${item.era} default date ${defaultDateFor(item)}.`
                );
            }
        }

        if (item.reviewStatus === 'source_checked' && !hasSource(item)) {
            sourceCheckedNoSources += 1;
            addCandidate(item, 'source_checked_without_sources', 100, 'Source-checked node has no node-level sources.');
        }
        if (item.reviewStatus === 'source_checked' && allSourcesBelow(item, 0.45)) {
            sourceCheckedAllWeak += 1;
            addCandidate(item, 'source_checked_all_weak_sources', 95, 'Source-checked node is supported only by weak_web sources.');
        }
        if (item.reviewStatus === 'source_checked' && item.firstKnownDate < 1900 && allSourcesGeneric(item)) {
            sourceCheckedGenericOld += 1;
            addCandidate(item, 'old_source_checked_generic_only', 90, 'Pre-1900 source-checked node relies only on generic_overview sources.');
        }

        for (const field of item.fields || []) {
            if (!fieldStats[field]) continue;
            fieldStats[field].total += 1;
            if (hasSource(item)) fieldStats[field].sourced += 1;
            if (item.reviewStatus === 'source_checked') fieldStats[field].sourceChecked += 1;
            if (usesEraDefaultDate(item)) fieldStats[field].eraDefaultDate += 1;
        }

        for (const edge of getDependencyEdges(item)) {
            totalEdges += 1;
            increment(edgeTypes, edge.type || 'unknown');
            increment(edgeEvidence, edge.evidence_level || 'unknown');
            increment(outgoingCounts, edge.prerequisite);
            if (Array.isArray(edge.sources) && edge.sources.length > 0) edgesWithSources += 1;
        }
    }

    for (const item of data) {
        const outgoing = outgoingCounts.get(item.id) || 0;
        if (outgoing >= 30 && !hasSource(item)) {
            addCandidate(
                item,
                'high_impact_unsourced_anchor',
                80,
                `Referenced by ${outgoing} downstream edges but has no node-level source.`
            );
        }
    }

    const candidateQueue = [...candidates.values()]
        .sort((a, b) => {
            if (b.priority !== a.priority) return b.priority - a.priority;
            const eraDelta = ERA_ORDER.indexOf(a.era) - ERA_ORDER.indexOf(b.era);
            if (eraDelta) return eraDelta;
            if (a.firstKnownDate !== b.firstKnownDate) return a.firstKnownDate - b.firstKnownDate;
            return a.id.localeCompare(b.id);
        })
        .slice(0, limit);

    return {
        generatedAt: new Date().toISOString(),
        totals: {
            technologies: data.length,
            nodesWithSources,
            sourceChecked,
            sourceCheckedNoSources,
            sourceCheckedAllWeak,
            sourceCheckedGenericOld,
            eraDefaultDates,
            sourceCheckedEraDefaultDates,
            totalEdges,
            edgesWithSources
        },
        reviewStatus: Object.fromEntries([...reviewStatus.entries()].sort()),
        eraStats,
        fieldStats,
        edgeTypes: Object.fromEntries([...edgeTypes.entries()].sort()),
        edgeEvidence: Object.fromEntries([...edgeEvidence.entries()].sort()),
        candidateQueue
    };
}

function markdownTable(rows) {
    if (!rows.length) return '';
    const header = rows[0].map(String);
    const body = rows.slice(1).map(row => row.map(value => String(value ?? '')));
    return [
        `| ${header.join(' | ')} |`,
        `| ${header.map(() => '---').join(' | ')} |`,
        ...body.map(row => `| ${row.join(' | ')} |`)
    ].join('\n');
}

function renderMarkdown(report) {
    const t = report.totals;
    const summary = markdownTable([
        ['Metric', 'Value'],
        ['Technologies', t.technologies],
        ['Nodes with node-level sources', `${t.nodesWithSources}/${t.technologies} (${percentage(t.nodesWithSources, t.technologies)})`],
        ['Source-checked nodes', `${t.sourceChecked}/${t.technologies} (${percentage(t.sourceChecked, t.technologies)})`],
        ['Source-checked nodes without sources', t.sourceCheckedNoSources],
        ['Source-checked nodes with only weak sources', t.sourceCheckedAllWeak],
        ['Pre-1900 source-checked nodes with only generic sources', t.sourceCheckedGenericOld],
        ['Era-default placeholder dates', `${t.eraDefaultDates}/${t.technologies} (${percentage(t.eraDefaultDates, t.technologies)})`],
        ['Source-checked era-default placeholder dates', `${t.sourceCheckedEraDefaultDates}/${t.sourceChecked} (${percentage(t.sourceCheckedEraDefaultDates, t.sourceChecked)})`],
        ['Dependency edges with edge-level sources', `${t.edgesWithSources}/${t.totalEdges} (${percentage(t.edgesWithSources, t.totalEdges)})`]
    ]);

    const eraRows = [['Era', 'Nodes', 'Era-default placeholder date', 'Source-checked', 'Source-checked placeholder date']];
    for (const era of ERA_ORDER) {
        const stats = report.eraStats[era];
        eraRows.push([
            era,
            stats.total,
            `${stats.eraDefaultDate} (${percentage(stats.eraDefaultDate, stats.total)})`,
            stats.sourceChecked,
            stats.sourceCheckedEraDefaultDate
        ]);
    }

    const queueRows = [['Priority', 'Node', 'Era', 'Date', 'Risks']];
    for (const item of report.candidateQueue) {
        queueRows.push([
            item.priority,
            `\`${item.id}\``,
            item.era,
            item.firstKnownDate,
            item.risks.map(risk => risk.risk).join(', ')
        ]);
    }

    return [
        `# Accuracy Risk Report`,
        '',
        `Generated: ${report.generatedAt}`,
        '',
        'This is an informational risk report. It does not estimate global truth accuracy; it identifies where manual review is likely to pay off next.',
        '',
        '## Summary',
        '',
        summary,
        '',
        '## Era-Default Placeholder Date Debt',
        '',
        markdownTable(eraRows),
        '',
        '## Next Manual Review Queue',
        '',
        markdownTable(queueRows),
        ''
    ].join('\n');
}

function renderText(report) {
    const t = report.totals;
    console.log(`Accuracy risk report (${report.generatedAt})`);
    console.log(`Technologies: ${t.technologies}`);
    console.log(`Source-checked: ${t.sourceChecked}/${t.technologies} (${percentage(t.sourceChecked, t.technologies)})`);
    console.log(`Pre-1900 source-checked generic-only: ${t.sourceCheckedGenericOld}`);
    console.log(`Era-default placeholder dates: ${t.eraDefaultDates}/${t.technologies} (${percentage(t.eraDefaultDates, t.technologies)})`);
    console.log(`Edge source coverage: ${t.edgesWithSources}/${t.totalEdges} (${percentage(t.edgesWithSources, t.totalEdges)})`);
    console.log('\nNext manual review queue:');
    for (const item of report.candidateQueue) {
        console.log(`- ${item.id} (${item.era}, ${item.firstKnownDate}) [${item.priority}]: ${item.risks.map(risk => risk.risk).join(', ')}`);
    }
}

function main() {
    const report = makeReport(loadData(), readJson(TAXONOMY_FILE));

    if (outputJson) {
        console.log(JSON.stringify(report, null, 2));
    } else if (outputMarkdown) {
        console.log(renderMarkdown(report));
    } else {
        renderText(report);
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    DATA_DIR,
    TAXONOMY_FILE,
    loadData,
    makeReport,
    percentage,
    readJson,
    renderMarkdown
};

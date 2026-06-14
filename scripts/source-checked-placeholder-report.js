#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { ERA_DEFAULT_DATES } = require('./edge-schema');
const { loadData, percentage } = require('./accuracy-risk-report');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'SOURCE_CHECKED_PLACEHOLDER_DATES.md');
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

function usesEraDefaultDate(item) {
    const defaults = ERA_DEFAULT_DATES[item.era];
    return Boolean(defaults)
        && item.firstKnownDate === defaults.firstKnownDate
        && item.datePrecision === defaults.datePrecision
        && item.region === defaults.region;
}

function hasExplicitDateUncertainty(item) {
    return item.dateUncertainty === true
        || (typeof item.dateUncertaintyNote === 'string' && item.dateUncertaintyNote.trim())
        || (typeof item.chronologyUncertainty === 'string' && item.chronologyUncertainty.trim());
}

function markdownTable(rows) {
    return [
        `| ${rows[0].join(' | ')} |`,
        `| ${rows[0].map(() => '---').join(' | ')} |`,
        ...rows.slice(1).map(row => `| ${row.map(value => String(value ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)
    ].join('\n');
}

function buildReport(data = loadData()) {
    const sourceChecked = data.filter(item => item.reviewStatus === 'source_checked');
    const placeholders = sourceChecked
        .filter(item => usesEraDefaultDate(item))
        .sort((a, b) => {
            const eraDelta = String(a.era).localeCompare(String(b.era));
            if (eraDelta) return eraDelta;
            return a.id.localeCompare(b.id);
        });
    const exceptions = placeholders.filter(item => !hasExplicitDateUncertainty(item));

    const byEra = new Map();
    for (const item of placeholders) {
        const current = byEra.get(item.era) || { total: 0, explicitUncertainty: 0, exceptions: 0 };
        current.total += 1;
        if (hasExplicitDateUncertainty(item)) current.explicitUncertainty += 1;
        else current.exceptions += 1;
        byEra.set(item.era, current);
    }

    const summaryRows = [['Era', 'Source-checked placeholder dates', 'With explicit uncertainty metadata', 'Listed exceptions']];
    for (const [era, counts] of [...byEra.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        summaryRows.push([era, counts.total, counts.explicitUncertainty, counts.exceptions]);
    }

    const exceptionRows = [['ID', 'Name', 'Era', 'Default date', 'Source types', 'Source titles']];
    for (const item of exceptions) {
        exceptionRows.push([
            `\`${item.id}\``,
            item.name,
            item.era,
            `${item.firstKnownDate} / ${item.datePrecision} / ${item.region}`,
            (item.sources || []).map(source => source.source_type || 'unknown').join(', '),
            (item.sources || []).map(source => source.title || source.url || 'Untitled source').join('; ')
        ]);
    }

    return [
        '# Source-Checked Placeholder Date Exceptions',
        '',
        'Generated from canonical era JSON. A `source_checked` node that still uses its era-default date must either carry explicit date uncertainty metadata (`dateUncertainty`, `dateUncertaintyNote`, or `chronologyUncertainty`) or appear in this report.',
        '',
        `Source-checked nodes: ${sourceChecked.length}`,
        `Source-checked nodes using era-default placeholder dates: ${placeholders.length} / ${sourceChecked.length} (${percentage(placeholders.length, sourceChecked.length)})`,
        `Listed exceptions without explicit uncertainty metadata: ${exceptions.length}`,
        '',
        '## Summary By Era',
        '',
        markdownTable(summaryRows),
        '',
        '## Exceptions',
        '',
        exceptions.length ? markdownTable(exceptionRows) : 'No exceptions.',
        ''
    ].join('\n');
}

function main() {
    const expected = `${buildReport()}\n`;
    if (checkOnly) {
        let actual = '';
        try {
            actual = fs.readFileSync(OUTPUT_FILE, 'utf8');
        } catch (error) {
            console.error(`${path.relative(ROOT_DIR, OUTPUT_FILE)} is missing`);
            process.exit(1);
        }
        if (actual !== expected) {
            console.error(`${path.relative(ROOT_DIR, OUTPUT_FILE)} is stale`);
            console.error('Run npm run quality:placeholder-dates to regenerate.');
            process.exit(1);
        }
        console.log('Source-checked placeholder-date exception report is current.');
        return;
    }

    fs.writeFileSync(OUTPUT_FILE, expected);
    console.log(`Wrote ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

if (require.main === module) {
    main();
}

module.exports = {
    buildReport,
    hasExplicitDateUncertainty,
    usesEraDefaultDate
};

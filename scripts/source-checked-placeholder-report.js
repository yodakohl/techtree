#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const {
    hasUnresolvedChronology,
    loadData,
    percentage,
    usesEraDefaultDate
} = require('./accuracy-risk-report');
const { FUTURE_EXCLUSION_NOTE, isLaunchQualityNode } = require('./quality-scope');

const ROOT_DIR = path.join(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT_DIR, 'docs', 'SOURCE_CHECKED_PLACEHOLDER_DATES.md');
const args = new Set(process.argv.slice(2));
const checkOnly = args.has('--check');

function hasExplicitDateUncertainty(item) {
    return item.dateUncertainty === true
        || (typeof item.dateUncertaintyNote === 'string' && item.dateUncertaintyNote.trim())
        || (typeof item.chronologyUncertainty === 'string' && item.chronologyUncertainty.trim());
}

function dateUncertaintyReason(item) {
    if (typeof item.dateUncertaintyNote === 'string' && item.dateUncertaintyNote.trim()) {
        return item.dateUncertaintyNote.trim();
    }
    if (typeof item.chronologyUncertainty === 'string' && item.chronologyUncertainty.trim()) {
        return item.chronologyUncertainty.trim();
    }
    if (item.dateUncertainty === true) {
        return 'Explicitly marked date-uncertain; source supports the node, but the canonical first-known date still needs chronology review.';
    }
    return item.datePrecision === 'unknown'
        ? 'Listed exception: chronology precision is unknown and still needs source-backed resolution.'
        : 'Listed exception: source supports the node, but the canonical first-known date is still an era-default placeholder pending chronology review.';
}

function reportIds(markdown) {
    return new Set(Array.from(markdown.matchAll(/^\| `([^`]+)` \|/gmu), match => match[1]));
}

function markdownTable(rows) {
    return [
        `| ${rows[0].join(' | ')} |`,
        `| ${rows[0].map(() => '---').join(' | ')} |`,
        ...rows.slice(1).map(row => `| ${row.map(value => String(value ?? '').replace(/\|/g, '\\|')).join(' | ')} |`)
    ].join('\n');
}

function buildReport(data = loadData()) {
    const sourceChecked = data
        .filter(isLaunchQualityNode)
        .filter(item => item.reviewStatus === 'source_checked');
    const unresolved = sourceChecked
        .filter(item => hasUnresolvedChronology(item))
        .sort((a, b) => {
            const eraDelta = String(a.era).localeCompare(String(b.era));
            if (eraDelta) return eraDelta;
            return a.id.localeCompare(b.id);
        });
    const exceptions = unresolved.filter(item => !hasExplicitDateUncertainty(item));

    const byEra = new Map();
    for (const item of unresolved) {
        const current = byEra.get(item.era) || { total: 0, explicitUncertainty: 0, exceptions: 0 };
        current.total += 1;
        if (hasExplicitDateUncertainty(item)) current.explicitUncertainty += 1;
        else current.exceptions += 1;
        byEra.set(item.era, current);
    }

    const summaryRows = [['Era', 'Source-checked unresolved dates', 'With explicit uncertainty metadata', 'Listed exceptions']];
    for (const [era, counts] of [...byEra.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
        summaryRows.push([era, counts.total, counts.explicitUncertainty, counts.exceptions]);
    }

    const unresolvedRows = [['ID', 'Name', 'Era', 'firstKnownDate', 'datePrecision', 'Source title', 'source_type', 'Why date is still uncertain']];
    for (const item of unresolved) {
        unresolvedRows.push([
            `\`${item.id}\``,
            item.name,
            item.era,
            item.firstKnownDate,
            item.datePrecision,
            (item.sources || []).map(source => source.title || source.url || 'Untitled source').join('; '),
            (item.sources || []).map(source => source.source_type || 'unknown').join(', '),
            dateUncertaintyReason(item)
        ]);
    }

    return [
        '# Source-Checked Unresolved Chronology',
        '',
        'Generated from canonical era JSON. Future forecast nodes are excluded from this launch-quality report.',
        '',
        FUTURE_EXCLUSION_NOTE,
        '',
        'A pre-Future `source_checked` node with `datePrecision: unknown` or an era-default date must either carry explicit uncertainty metadata (`dateUncertainty`, `dateUncertaintyNote`, or `chronologyUncertainty`) or appear in this report.',
        '',
        `Source-checked nodes: ${sourceChecked.length}`,
        `Source-checked nodes with unresolved chronology: ${unresolved.length} / ${sourceChecked.length} (${percentage(unresolved.length, sourceChecked.length)})`,
        `Listed exceptions without explicit uncertainty metadata: ${exceptions.length}`,
        '',
        '## Summary By Era',
        '',
        markdownTable(summaryRows),
        '',
        '## Unresolved-Chronology Nodes',
        '',
        unresolved.length ? markdownTable(unresolvedRows) : 'No source-checked unresolved-chronology nodes.',
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
        const expectedIds = reportIds(expected);
        const actualIds = reportIds(actual);
        const missing = [...expectedIds].filter(id => !actualIds.has(id));
        if (missing.length) {
            console.error(`${path.relative(ROOT_DIR, OUTPUT_FILE)} is missing placeholder-date ids: ${missing.join(', ')}`);
            process.exit(1);
        }
        console.log('Source-checked unresolved-chronology report is current.');
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
    dateUncertaintyReason,
    hasExplicitDateUncertainty,
    usesEraDefaultDate
};

#!/usr/bin/env node
const { execFileSync, spawnSync } = require('child_process');

const args = new Set(process.argv.slice(2));
const run = args.has('--run');

function git(args) {
    try {
        return execFileSync('git', args, { encoding: 'utf8' })
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(Boolean);
    } catch (error) {
        return [];
    }
}

function unique(values) {
    return [...new Set(values)].sort();
}

function shellQuote(value) {
    return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function addCommand(commands, label, cmd, reason) {
    const key = cmd.join('\0');
    if (!commands.some(command => command.key === key)) {
        commands.push({ key, label, cmd, reason });
    }
}

function isCommand(commands, expected) {
    return commands.some(command => command.cmd.join('\0') === expected.join('\0'));
}

function removeQualityCoveredCommands(commands) {
    if (!isCommand(commands, ['npm', 'run', 'quality'])) return commands;
    const covered = new Set([
        ['npm', 'run', 'edge-receipts'].join('\0'),
        ['npm', 'run', 'graph-invariants'].join('\0'),
        ['npm', 'run', 'invariant-coverage'].join('\0'),
        ['npm', 'run', 'trust:audit'].join('\0'),
        ['node', 'scripts/generate-quality-snapshot.js', '--check'].join('\0'),
        ['node', 'scripts/generate-field-quality-snapshot.js', '--check'].join('\0'),
        ['npm', 'run', 'metrics:check'].join('\0')
    ]);
    return commands.filter(command => !covered.has(command.cmd.join('\0')));
}

function changedFiles() {
    return unique([
        ...git(['diff', '--name-only']),
        ...git(['diff', '--cached', '--name-only']),
        ...git(['ls-files', '--others', '--exclude-standard'])
    ]);
}

function isJs(file) {
    return file.endsWith('.js') && !file.startsWith('vendor/');
}

function isTechnologyData(file) {
    return /^data\/.+\.json$/.test(file)
        && !['data/taxonomy.json', 'data/quality-snapshot.json'].includes(file);
}

function isPublishedMetricSurface(file) {
    return [
        'README.md',
        'docs/QUALITY_SNAPSHOT.md',
        'docs/TECH_EXPANSION_RUNBOOK.md',
        'llms.txt',
        'sorted.html',
        'sitemap.xml',
        'data/quality-snapshot.json',
        'data/taxonomy.json',
        'package.json',
        'scripts/check-published-metrics.js'
    ].includes(file);
}

function plan(files) {
    const commands = [];
    if (!files.length) return commands;

    const hasStaged = git(['diff', '--cached', '--name-only']).length > 0;
    addCommand(commands, 'Whitespace', ['git', 'diff', '--check'], 'catch whitespace errors in unstaged changes');
    if (hasStaged) {
        addCommand(commands, 'Staged whitespace', ['git', 'diff', '--cached', '--check'], 'catch whitespace errors in staged changes');
    }

    for (const file of files.filter(isJs)) {
        addCommand(commands, 'JS syntax', ['node', '--check', file], `syntax-check changed JavaScript file ${file}`);
    }

    if (files.includes('package.json')) {
        addCommand(
            commands,
            'Package JSON',
            ['node', '-e', "JSON.parse(require('fs').readFileSync('package.json','utf8'))"],
            'verify package.json still parses'
        );
    }

    if (files.some(file => file === 'trust-levels.js' || file === 'scripts/audit-trust-levels.js')) {
        addCommand(commands, 'Trust derivation', ['npm', 'run', 'trust:audit'], 'trust rules or audit changed');
    }

    if (files.some(file => file.startsWith('docs/edge-change-receipts/'))) {
        addCommand(commands, 'Edge receipts', ['npm', 'run', 'edge-receipts'], 'edge-change receipts changed');
    }

    if (files.some(file => file.startsWith('docs/graph-invariants/'))) {
        addCommand(commands, 'Graph invariants', ['npm', 'run', 'graph-invariants'], 'graph invariant files changed');
        addCommand(commands, 'Invariant coverage', ['npm', 'run', 'invariant-coverage'], 'receipt invariant coverage may change');
    }

    if (files.some(isTechnologyData)) {
        addCommand(commands, 'Data structure and chronology', ['npm', 'test'], 'technology data changed');
        addCommand(commands, 'Data quality gates', ['npm', 'run', 'quality'], 'technology data changed');
    } else if (files.some(file => file.startsWith('scripts/') || file === 'trust-levels.js')) {
        addCommand(commands, 'Quality gates', ['npm', 'run', 'quality'], 'quality/audit tooling changed');
    }

    if (files.some(file => ['README.md', 'docs/QUALITY_SNAPSHOT.md', 'data/quality-snapshot.json'].includes(file))) {
        addCommand(commands, 'Quality snapshot freshness', ['node', 'scripts/generate-quality-snapshot.js', '--check'], 'quality snapshot output changed');
    }
    if (files.some(isPublishedMetricSurface)) {
        addCommand(commands, 'Published metrics', ['npm', 'run', 'metrics:check'], 'published metric surfaces changed');
    }
    if (files.some(file => ['docs/SOURCE_CHECKED_PLACEHOLDER_DATES.md', 'scripts/source-checked-placeholder-report.js'].includes(file))) {
        addCommand(commands, 'Source-checked placeholder-date report freshness', ['node', 'scripts/source-checked-placeholder-report.js', '--check'], 'placeholder-date exception report changed');
    }

    if (files.some(file => ['docs/RANDOM_SOURCE_FIT_AUDIT.md', 'scripts/audit-random-source-fit.js'].includes(file))) {
        addCommand(commands, 'Random source-fit audit freshness', ['node', 'scripts/audit-random-source-fit.js', '--check'], 'random source-fit audit output changed');
    }

    if (files.some(file => file === 'docs/QUALITY_GENOME_EDITING_CRISPR_CAS.md' || file === 'scripts/generate-field-quality-snapshot.js')) {
        addCommand(commands, 'CRISPR field snapshot freshness', ['node', 'scripts/generate-field-quality-snapshot.js', '--check'], 'field quality snapshot or generator changed');
    }

    if (files.some(file => file.startsWith('data/expansion/') || isTechnologyData(file))) {
        addCommand(commands, 'Coverage report', ['npm', 'run', 'coverage'], 'technology coverage may have changed');
    }

    if (files.some(isTechnologyData)) {
        addCommand(commands, 'Source URL audit', ['npm', 'run', 'source-urls'], 'technology sources may have changed');
    }

    return removeQualityCoveredCommands(commands);
}

function printPlan(files, commands) {
    if (!files.length) {
        console.log('No changed files detected. No targeted checks needed.');
        return;
    }

    console.log('Changed files:');
    for (const file of files) console.log(`- ${file}`);
    console.log('');
    if (!commands.length) {
        console.log('No targeted checks needed for these files.');
        return;
    }

    console.log('Targeted validation plan:');
    commands.forEach((command, index) => {
        console.log(`${index + 1}. ${command.cmd.map(shellQuote).join(' ')}  # ${command.reason}`);
    });
    console.log('');
    console.log('Use `npm run agent:check -- --run` to run this plan once.');
}

function runPlan(commands) {
    for (const command of commands) {
        console.log(`\n$ ${command.cmd.join(' ')}`);
        const result = spawnSync(command.cmd[0], command.cmd.slice(1), {
            stdio: 'inherit',
            shell: false
        });
        if (result.status !== 0) process.exit(result.status || 1);
    }
}

const files = changedFiles();
const commands = plan(files);
printPlan(files, commands);
if (run && commands.length) runPlan(commands);

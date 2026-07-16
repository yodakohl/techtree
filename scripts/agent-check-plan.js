#!/usr/bin/env node
const { execFileSync, spawn, spawnSync } = require('child_process');
const os = require('node:os');

const DEFAULT_MAX_PARALLELISM = 2;

function parseArgs(argv) {
    const args = new Set(argv);
    const allowed = new Set(['--help', '-h', '--parallel', '--refresh', '--run']);
    const unknown = [...args].filter(arg => !allowed.has(arg));
    if (unknown.length) throw new Error(`Unknown argument: ${unknown[0]}`);
    return {
        help: args.has('--help') || args.has('-h'),
        parallel: args.has('--parallel'),
        refresh: args.has('--refresh'),
        run: args.has('--run') || args.has('--parallel')
    };
}

function usage() {
    console.log(`Usage: node scripts/agent-check-plan.js [--refresh] [--run] [--parallel]

Plans validation from changed files. --refresh updates stale generated artifacts
before planning. --run executes the plan; --parallel runs independent checks
concurrently and implies --run. Parallel execution uses at most two workers by
default (and never more than the available CPU count); set AGENT_CHECK_JOBS to
a positive integer to override the worker count.`);
}

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
    if (files.some(isJs)) {
        addCommand(commands, 'Regression suite', ['npm', 'test'], 'JavaScript behavior or validation tooling changed');
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
        addCommand(commands, 'Changed source URL audit', ['npm', 'run', 'source-urls', '--', '--changed'], 'new technology source URLs may have been introduced');
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
    return true;
}

function runCommandAsync(command) {
    return new Promise(resolve => {
        const child = spawn(command.cmd[0], command.cmd.slice(1), {
            cwd: process.cwd(),
            env: process.env,
            shell: false,
            stdio: ['ignore', 'pipe', 'pipe']
        });
        const stdout = [];
        const stderr = [];
        let settled = false;
        const finish = result => {
            if (settled) return;
            settled = true;
            resolve({ command, ...result });
        };
        child.stdout.on('data', chunk => stdout.push(chunk));
        child.stderr.on('data', chunk => stderr.push(chunk));
        child.on('error', error => finish({ status: 1, stdout, stderr, error }));
        child.on('close', status => finish({ status, stdout, stderr, error: null }));
    });
}

function resolveParallelism(value, availableParallelism = os.availableParallelism()) {
    if (value === undefined || value === '') {
        return Math.max(1, Math.min(DEFAULT_MAX_PARALLELISM, availableParallelism));
    }
    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed < 1) {
        throw new Error('AGENT_CHECK_JOBS must be a positive integer');
    }
    return parsed;
}

async function runBounded(items, maxConcurrency, execute) {
    if (!Number.isInteger(maxConcurrency) || maxConcurrency < 1) {
        throw new Error('maxConcurrency must be a positive integer');
    }
    if (!items.length) return [];

    const results = new Array(items.length);
    let nextIndex = 0;
    const workerCount = Math.min(maxConcurrency, items.length);

    async function worker() {
        while (nextIndex < items.length) {
            const index = nextIndex;
            nextIndex += 1;
            results[index] = await execute(items[index], index);
        }
    }

    await Promise.all(Array.from({ length: workerCount }, worker));
    return results;
}

async function runPlanParallel(commands, options = {}) {
    const concurrency = options.concurrency ?? resolveParallelism(process.env.AGENT_CHECK_JOBS);
    const execute = options.execute ?? runCommandAsync;
    console.log(
        `\nRunning ${commands.length} independent check(s) with up to ${Math.min(concurrency, commands.length)} concurrent worker(s)...`
    );
    const results = await runBounded(commands, concurrency, execute);
    let passed = true;

    for (const result of results) {
        console.log(`\n$ ${result.command.cmd.join(' ')}`);
        if (result.stdout.length) process.stdout.write(Buffer.concat(result.stdout).toString());
        if (result.stderr.length) process.stderr.write(Buffer.concat(result.stderr).toString());
        if (result.error) console.error(result.error.message);
        if (result.status !== 0 || result.error) {
            passed = false;
            console.error(`Check failed: ${result.command.label}`);
        }
    }
    return passed;
}

function refreshDerived() {
    const result = spawnSync(process.execPath, ['scripts/refresh-derived.js'], {
        cwd: process.cwd(),
        stdio: 'inherit',
        shell: false
    });
    return result.status === 0;
}

async function main(argv = process.argv.slice(2)) {
    const options = parseArgs(argv);
    if (options.help) {
        usage();
        return 0;
    }
    if (options.refresh && !refreshDerived()) return 1;

    const files = changedFiles();
    const commands = plan(files);
    printPlan(files, commands);
    if (!options.run || !commands.length) return 0;
    const passed = options.parallel ? await runPlanParallel(commands) : runPlan(commands);
    return passed ? 0 : 1;
}

if (require.main === module) {
    main().then(status => {
        if (status) process.exit(status);
    }).catch(error => {
        console.error(error.message);
        process.exit(1);
    });
}

module.exports = {
    changedFiles,
    main,
    parseArgs,
    plan,
    removeQualityCoveredCommands,
    resolveParallelism,
    runBounded,
    runPlanParallel
};

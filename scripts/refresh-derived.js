#!/usr/bin/env node
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.join(__dirname, '..');

const TASKS = [
    {
        label: 'unresolved chronology report',
        check: ['node', 'scripts/source-checked-placeholder-report.js', '--check'],
        refresh: ['node', 'scripts/source-checked-placeholder-report.js']
    },
    {
        label: 'random source-fit report',
        check: ['node', 'scripts/audit-random-source-fit.js', '--check'],
        refresh: ['node', 'scripts/audit-random-source-fit.js']
    },
    {
        label: 'quality snapshot',
        check: ['node', 'scripts/generate-quality-snapshot.js', '--check'],
        refresh: ['node', 'scripts/generate-quality-snapshot.js']
    },
    {
        label: 'CRISPR field snapshot',
        check: ['node', 'scripts/generate-field-quality-snapshot.js', '--check'],
        refresh: ['node', 'scripts/generate-field-quality-snapshot.js']
    },
    {
        label: 'public site',
        check: ['node', 'scripts/check-public-site.js'],
        refresh: ['node', 'scripts/generate-public-site.js']
    }
];

function runCommand(command) {
    const result = spawnSync(command[0], command.slice(1), {
        cwd: ROOT_DIR,
        encoding: 'utf8',
        shell: false
    });
    return {
        status: result.status,
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        error: result.error
    };
}

function printFailure(label, command, result, logger) {
    logger.error(`Failed to refresh ${label}: ${command.join(' ')}`);
    if (result.stdout.trim()) logger.error(result.stdout.trim());
    if (result.stderr.trim()) logger.error(result.stderr.trim());
    if (result.error) logger.error(result.error.message);
}

function refreshDerived(tasks = TASKS, execute = runCommand, logger = console) {
    const refreshed = [];
    const current = [];

    for (const task of tasks) {
        const check = execute(task.check);
        if (check.status === 0 && !check.error) {
            current.push(task.label);
            continue;
        }

        const refresh = execute(task.refresh);
        if (refresh.status !== 0 || refresh.error) {
            printFailure(task.label, task.refresh, refresh, logger);
            return { ok: false, refreshed, current, failed: task.label };
        }
        if (refresh.stdout.trim()) logger.log(refresh.stdout.trim());
        refreshed.push(task.label);
    }

    if (refreshed.length) logger.log(`Refreshed: ${refreshed.join(', ')}.`);
    logger.log(`${current.length} derived artifact set(s) were already current.`);
    return { ok: true, refreshed, current, failed: null };
}

function main() {
    const result = refreshDerived();
    if (!result.ok) process.exit(1);
}

if (require.main === module) main();

module.exports = {
    TASKS,
    refreshDerived,
    runCommand
};

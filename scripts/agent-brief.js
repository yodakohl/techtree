const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');

function readJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function maybeGit(args) {
    try {
        return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch (error) {
        return '';
    }
}

function latestRiskReport() {
    const docsDir = path.join(ROOT, 'docs');
    return fs.readdirSync(docsDir)
        .filter(file => /^ACCURACY_RISK_REPORT_.*\.md$/.test(file))
        .sort()
        .at(-1);
}

function parseRiskQueue(file) {
    if (!file) return [];
    const content = fs.readFileSync(path.join(ROOT, 'docs', file), 'utf8');
    return content
        .split('\n')
        .map(line => line.match(/^\|\s*\d+\s*\|\s*`([^`]+)`\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/))
        .filter(Boolean)
        .slice(0, 8)
        .map(match => `${match[1]} (${match[2].trim()}, ${match[3].trim()}: ${match[4].trim()})`);
}

function metricLines(snapshot) {
    return (snapshot.metrics || []).map(metric => {
        const note = metric.note ? ` (${metric.note})` : '';
        return `${metric.label}: ${metric.formatted}${note}`;
    });
}

function main() {
    const pkg = readJson('package.json');
    const snapshot = readJson('data/quality-snapshot.json');
    const riskFile = latestRiskReport();
    const riskQueue = parseRiskQueue(riskFile);
    const status = maybeGit(['status', '--short']);
    const branch = maybeGit(['branch', '--show-current']) || 'unknown';
    const lastCommit = maybeGit(['log', '-1', '--oneline']) || 'unknown';

    console.log('TechTree Agent Brief');
    console.log(`Branch: ${branch}`);
    console.log(`Last commit: ${lastCommit}`);
    console.log(`Worktree: ${status ? `${status.split('\n').length} changed path(s)` : 'clean'}`);
    console.log('');

    console.log('Quality Snapshot');
    for (const line of metricLines(snapshot)) console.log(`- ${line}`);
    console.log('');

    console.log(`Next Accuracy Queue${riskFile ? ` (${riskFile})` : ''}`);
    if (riskQueue.length) {
        for (const item of riskQueue) console.log(`- ${item}`);
    } else {
        console.log('- Run: npm run accuracy:risks');
    }
    console.log('');

    console.log('Fast Commands');
    for (const name of ['test', 'quality', 'coverage', 'accuracy:risks', 'source-urls', 'start']) {
        if (pkg.scripts?.[name]) console.log(`- npm run ${name}`);
    }
    console.log('');

    console.log('Token-Saving Workflow');
    console.log('- Start with this brief, then targeted rg/node reads; avoid opening whole data/*.json files.');
    console.log('- For data changes, inspect exact node packets with npm run node-packet -- <id> before editing.');
    console.log('- For bulk additions, use compact TSV + scripts/import-compact-tech.js; do not hand-edit era JSON in bulk.');
    console.log('- For demo/UI work, touch demo.html, demo.js, style.css; run node --check demo.js plus npm test.');
    console.log('- Before final: npm test && npm run quality && git diff --check, then commit and push origin HEAD:main.');
}

main();

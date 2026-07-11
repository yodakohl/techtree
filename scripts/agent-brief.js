const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const {
    TAXONOMY_FILE,
    loadData,
    makeReport,
    readJson
} = require('./accuracy-risk-report');
const { buildQueue } = require('./agent-next');

const ROOT = path.join(__dirname, '..');

function readRepoJson(relativePath) {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'));
}

function maybeGit(args) {
    try {
        return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch (error) {
        return '';
    }
}

function currentRiskQueue() {
    const data = loadData();
    const report = makeReport(data, readJson(TAXONOMY_FILE));
    if (report.candidateQueue.length) {
        return report.candidateQueue
            .slice(0, 8)
            .map(item => `${item.id} (${item.era}, ${item.firstKnownDate}: ${item.risks.map(risk => risk.risk).join(', ')})`);
    }
    return buildQueue(data, { limit: 8 }).queue
        .map(item => `${item.id} [${item.score}] (${item.era}, ${item.firstKnownDate}: ${item.debt.join(', ')})`);
}

function metricLines(snapshot) {
    return (snapshot.metrics || []).map(metric => {
        const note = metric.note ? ` (${metric.note})` : '';
        return `${metric.label}: ${metric.formatted}${note}`;
    });
}

function main() {
    const pkg = readRepoJson('package.json');
    const snapshot = readRepoJson('data/quality-snapshot.json');
    const riskQueue = currentRiskQueue();
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

    console.log('Next Review Queue (live)');
    if (riskQueue.length) {
        for (const item of riskQueue) console.log(`- ${item}`);
    } else {
        console.log('- Run: npm run accuracy:risks');
    }
    console.log('');

    console.log('Fast Commands');
    for (const name of ['agent:batch', 'agent:next', 'agent:ready', 'test', 'quality', 'coverage', 'accuracy:risks', 'source-urls', 'start']) {
        if (pkg.scripts?.[name]) console.log(`- npm run ${name}`);
    }
    console.log('');

    console.log('Token-Saving Workflow');
    console.log('- Start with this brief, then targeted rg/node reads; avoid opening whole data/*.json files.');
    console.log('- Use npm run agent:batch for a file-grouped multi-node queue; focus chronology, edges, node-evidence, review-status, or source-fit.');
    console.log('- Use npm run agent:next for one ranked target and copy-ready review commands.');
    console.log('- Use npm run node-packet -- <id> when a target needs scope or dependency-semantic changes.');
    console.log('- For bulk additions, use compact TSV + scripts/import-compact-tech.js; do not hand-edit era JSON in bulk.');
    console.log('- For demo/UI work, touch demo.html, demo.js, style.css; run node --check demo.js plus npm test.');
    console.log('- After edits, npm run agent:ready refreshes stale derived files and runs independent changed-file checks concurrently.');
    console.log('- Before final: ensure the agent:ready plan covered the full change, then commit and push origin HEAD:main.');
}

main();

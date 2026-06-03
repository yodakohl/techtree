#!/usr/bin/env node
const fs = require('fs');

function usage() {
    console.error('Usage: node scripts/compare-node-scope-snapshots.js before.json after.json [--require-behavior-change] [--require-claim-change]');
    process.exit(1);
}

function stable(value) {
    if (Array.isArray(value)) return value.map(stable);
    if (value && typeof value === 'object') {
        return Object.keys(value).sort().reduce((accumulator, key) => {
            accumulator[key] = stable(value[key]);
            return accumulator;
        }, {});
    }
    return value;
}

function stableJson(value) {
    return JSON.stringify(stable(value));
}

function readSnapshot(file) {
    const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (!parsed.nodeId || !parsed.claimSurface || !parsed.behaviorSurface) {
        throw new Error(`${file} is not a node-scope snapshot`);
    }
    return parsed;
}

function diffByKey(beforeItems, afterItems, keyFn) {
    const before = new Map(beforeItems.map(item => [keyFn(item), item]));
    const after = new Map(afterItems.map(item => [keyFn(item), item]));
    const added = [];
    const removed = [];
    const changed = [];

    for (const [key, item] of after) {
        if (!before.has(key)) {
            added.push(key);
        } else if (stableJson(before.get(key)) !== stableJson(item)) {
            changed.push(key);
        }
    }

    for (const key of before.keys()) {
        if (!after.has(key)) removed.push(key);
    }

    return { added: added.sort(), removed: removed.sort(), changed: changed.sort() };
}

function formatList(values) {
    if (!values.length) return '- none';
    const shown = values.slice(0, 40).map(value => `- ${value}`);
    if (values.length > shown.length) shown.push(`- ... ${values.length - shown.length} more`);
    return shown.join('\n');
}

function printDiff(label, diff) {
    const total = diff.added.length + diff.removed.length + diff.changed.length;
    console.log(`\n## ${label} (${total})`);
    console.log('\nAdded:');
    console.log(formatList(diff.added));
    console.log('\nRemoved:');
    console.log(formatList(diff.removed));
    console.log('\nChanged:');
    console.log(formatList(diff.changed));
}

function main() {
    const args = process.argv.slice(2);
    if (args.length < 2 || args.includes('--help') || args.includes('-h')) usage();

    const [beforeFile, afterFile] = args;
    const requireBehaviorChange = args.includes('--require-behavior-change');
    const requireClaimChange = args.includes('--require-claim-change');
    const before = readSnapshot(beforeFile);
    const after = readSnapshot(afterFile);

    if (before.nodeId !== after.nodeId) {
        throw new Error(`Snapshot node ids differ: ${before.nodeId} vs ${after.nodeId}`);
    }

    const claimChanged = before.claimSignature !== after.claimSignature;
    const behaviorChanged = before.behaviorSignature !== after.behaviorSignature;

    console.log(`# Node Scope Snapshot Diff: ${before.nodeId}`);
    console.log(`claim signature before: ${before.claimSignature}`);
    console.log(`claim signature after:  ${after.claimSignature}`);
    console.log(`claim changed: ${claimChanged ? 'yes' : 'no'}`);
    console.log(`behavior signature before: ${before.behaviorSignature}`);
    console.log(`behavior signature after:  ${after.behaviorSignature}`);
    console.log(`behavior changed: ${behaviorChanged ? 'yes' : 'no'}`);

    const beforeBehavior = before.behaviorSurface;
    const afterBehavior = after.behaviorSurface;
    printDiff(
        'Incoming Edges',
        diffByKey(beforeBehavior.incomingEdges || [], afterBehavior.incomingEdges || [], item => `${item.from}->${item.to}`)
    );
    printDiff(
        'Outgoing Edges',
        diffByKey(beforeBehavior.outgoingEdges || [], afterBehavior.outgoingEdges || [], item => `${item.from}->${item.to}`)
    );
    printDiff(
        'Through Paths',
        diffByKey(beforeBehavior.throughPaths || [], afterBehavior.throughPaths || [], item => `${item.from}->${item.via}->${item.to}`)
    );

    if (requireClaimChange && !claimChanged) {
        console.error('\nRequired claim-surface change was not detected.');
        process.exit(1);
    }
    if (requireBehaviorChange && !behaviorChanged) {
        console.error('\nRequired behavior-surface change was not detected. This is a likely caption-only or ontology-laundering no-op.');
        process.exit(1);
    }
}

main();

#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const RECEIPT_DIR = path.join(__dirname, '..', 'docs', 'edge-change-receipts');
const INVARIANT_DIR = path.join(__dirname, '..', 'docs', 'graph-invariants');

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function edgeKey(edge) {
    return `${edge.dependent}->${edge.prerequisite}`;
}

function loadReceipts() {
    return fs.readdirSync(RECEIPT_DIR)
        .filter(file => file.endsWith('.json'))
        .sort()
        .map(file => ({ file, receipt: readJson(path.join(RECEIPT_DIR, file)) }));
}

function loadInvariantCoverage() {
    const coverage = {
        directAbsent: new Map(),
        edgeType: new Map()
    };

    for (const file of fs.readdirSync(INVARIANT_DIR).filter(name => name.endsWith('.json')).sort()) {
        const invariant = readJson(path.join(INVARIANT_DIR, file));
        for (const check of invariant.checks || []) {
            if (check.type === 'direct_edge_absent') {
                const key = `${check.dependent}->${check.prerequisite}`;
                if (!coverage.directAbsent.has(key)) coverage.directAbsent.set(key, []);
                coverage.directAbsent.get(key).push(file);
            }
            if (check.type === 'edge_type') {
                const key = `${check.dependent}->${check.prerequisite}:${check.expected}`;
                if (!coverage.edgeType.has(key)) coverage.edgeType.set(key, []);
                coverage.edgeType.get(key).push(file);
            }
        }
    }

    return coverage;
}

function expectedCoverageForReceipt(receipt) {
    const expectations = [];

    if (receipt.removed_edge === true) {
        expectations.push({
            kind: 'directAbsent',
            key: edgeKey(receipt.edge),
            reason: 'removed edge must stay absent'
        });
    }

    if (receipt.replaced_edge) {
        expectations.push({
            kind: 'directAbsent',
            key: edgeKey(receipt.replaced_edge),
            reason: 'replaced edge must stay absent'
        });
    }

    if (receipt.change_class === 'semantic_retype' || receipt.replaced_edge) {
        const type = receipt.new_claim && receipt.new_claim.type;
        if (type) {
            expectations.push({
                kind: 'edgeType',
                key: `${edgeKey(receipt.edge)}:${type}`,
                reason: 'corrected edge type must stay stable'
            });
        }
    }

    return expectations;
}

function main() {
    const receipts = loadReceipts();
    const coverage = loadInvariantCoverage();
    const missing = [];
    let expectedCount = 0;
    let coveredCount = 0;

    for (const { file, receipt } of receipts) {
        const expectations = expectedCoverageForReceipt(receipt);
        if (!expectations.length) continue;

        for (const expectation of expectations) {
            expectedCount += 1;
            const coveredBy = coverage[expectation.kind].get(expectation.key) || [];
            if (coveredBy.length) {
                coveredCount += 1;
            } else {
                missing.push({
                    file,
                    receiptId: receipt.id,
                    expectation
                });
            }
        }
    }

    if (missing.length) {
        console.error(`Invariant coverage audit failed: ${missing.length}/${expectedCount} expected receipt invariant(s) are missing.`);
        for (const item of missing) {
            console.error(`- ${item.file}: ${item.expectation.kind} ${item.expectation.key} (${item.expectation.reason})`);
        }
        process.exit(1);
    }

    console.log(`Invariant coverage audit passed: ${coveredCount}/${expectedCount} receipt invariant expectation(s) covered.`);
}

main();

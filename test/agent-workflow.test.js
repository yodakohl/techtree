const assert = require('node:assert/strict');
const test = require('node:test');

const {
    buildQueue,
    parseArgs: parseNextArgs,
    renderBatch
} = require('../scripts/agent-next');
const {
    collectChangedSources,
    parseArgs: parseSourceUrlArgs
} = require('../scripts/audit-source-urls');
const {
    parseArgs: parseCheckArgs,
    plan
} = require('../scripts/agent-check-plan');
const {
    TASKS,
    refreshDerived
} = require('../scripts/refresh-derived');

function node(overrides = {}) {
    return {
        id: 'sample_node',
        name: 'Sample Node',
        era: 'Modern',
        firstKnownDate: 1990,
        datePrecision: 'exact',
        region: 'Global',
        reviewStatus: 'source_checked',
        prerequisites: [],
        dependencyEdges: [],
        sources: [{
            title: 'Primary evidence',
            url: 'https://example.com/primary',
            publisher: 'Example',
            source_type: 'primary_paper',
            source_locator: 'Abstract, first sentence.',
            supports: ['node']
        }],
        ...overrides
    };
}

test('batch queue can focus chronology work and excludes Future nodes', () => {
    const data = [
        node({ id: 'dated_unknown', name: 'Dated Unknown', datePrecision: 'unknown', __file: 'modern.json' }),
        node({ id: 'missing_evidence', name: 'Missing Evidence', sources: [], __file: 'modern.json' }),
        node({ id: 'future_unknown', name: 'Future Unknown', era: 'Future', datePrecision: 'unknown', sources: [], __file: 'future.json' })
    ];
    const result = buildQueue(data, { focus: 'chronology', limit: 8 });

    assert.deepEqual(result.queue.map(row => row.id), ['dated_unknown']);
    const output = renderBatch(result, { focus: 'chronology', limit: 8 });
    assert.match(output, /data\/modern\.json: dated_unknown/);
    assert.match(output, /locator: Abstract, first sentence\./);
    assert.doesNotMatch(output, /future_unknown/);
});

test('source-fit focus surfaces suspicious evidence without including Future nodes', () => {
    const data = [
        node({
            id: 'sociology_early',
            name: 'Sociology',
            sources: [{
                title: 'Presocratic Philosophy',
                url: 'https://example.com/presocratics',
                source_type: 'textbook',
                supports: ['node']
            }]
        }),
        node({
            id: 'future_sociology',
            name: 'Future Sociology',
            era: 'Future',
            sources: [{
                title: 'Unrelated Evidence',
                url: 'https://example.com/unrelated',
                source_type: 'textbook',
                supports: ['node']
            }]
        })
    ];

    const result = buildQueue(data, { focus: 'source-fit', limit: 8 });
    assert.deepEqual(result.queue.map(row => row.id), ['sociology_early']);
    assert.match(result.queue[0].debt.join(' '), /mechanical node\/source evidence mismatch/);
});

test('batch argument parser validates focus and parallel ready options', () => {
    assert.deepEqual(parseNextArgs(['--batch', '--focus', 'edges', '--limit', '6']), {
        batch: true,
        focus: 'edges',
        id: null,
        limit: 6,
        json: false
    });
    assert.throws(() => parseNextArgs(['--focus', 'future']), /--focus must be one of/);
    assert.deepEqual(parseCheckArgs(['--refresh', '--parallel']), {
        help: false,
        parallel: true,
        refresh: true,
        run: true
    });
});

test('changed URL collection checks only newly attached pre-Future URLs', () => {
    const base = [node({
        id: 'changed_node',
        sources: [{ url: 'https://example.com/kept', supports: ['node'] }],
        dependencyEdges: [{
            prerequisite: 'sample_node',
            sources: [{ url: 'https://example.com/old-edge', supports: ['edge'] }]
        }]
    })];
    const current = [
        node({
            id: 'changed_node',
            sources: [
                { url: 'https://example.com/kept', supports: ['node'] },
                { url: 'https://example.com/new', supports: ['node'] }
            ],
            dependencyEdges: [{
                prerequisite: 'sample_node',
                sources: [
                    { url: 'https://example.com/old-edge', supports: ['edge'] },
                    { url: 'https://example.com/new', supports: ['edge'] }
                ]
            }]
        }),
        node({
            id: 'future_node',
            era: 'Future',
            sources: [{ url: 'https://example.com/future', supports: ['node'] }]
        })
    ];

    assert.deepEqual(collectChangedSources(current, base), [{
        url: 'https://example.com/new',
        ids: ['changed_node']
    }]);
});

test('source URL arguments preserve full mode and reject conflicting scopes', () => {
    const defaults = parseSourceUrlArgs([]);
    assert.equal(defaults.changed, false);
    assert.equal(defaults.timeoutMs, 10000);
    assert.equal(parseSourceUrlArgs(['--changed', '--concurrency', '3']).changed, true);
    assert.throws(() => parseSourceUrlArgs(['--all', '--changed']), /cannot be combined/);
    assert.throws(() => parseSourceUrlArgs(['--concurrency', '0']), /positive integer/);
});

test('data validation plan audits changed URLs instead of the full corpus', () => {
    const commands = plan(['data/modern.json']).map(command => command.cmd);
    assert(commands.some(command => command.join(' ') === 'npm run source-urls -- --changed'));
    assert(!commands.some(command => command.join(' ') === 'npm run source-urls'));
});

test('derived refresh writes only stale tasks and keeps public generation last', () => {
    assert.equal(TASKS.at(-1).label, 'public site');
    const calls = [];
    const tasks = [
        { label: 'current', check: ['check-current'], refresh: ['refresh-current'] },
        { label: 'stale', check: ['check-stale'], refresh: ['refresh-stale'] }
    ];
    const execute = command => {
        calls.push(command[0]);
        if (command[0] === 'check-stale') return { status: 1, stdout: '', stderr: '', error: null };
        return { status: 0, stdout: '', stderr: '', error: null };
    };

    const result = refreshDerived(tasks, execute, { log() {}, error() {} });
    assert.equal(result.ok, true);
    assert.deepEqual(result.current, ['current']);
    assert.deepEqual(result.refreshed, ['stale']);
    assert.deepEqual(calls, ['check-current', 'check-stale', 'refresh-stale']);
});

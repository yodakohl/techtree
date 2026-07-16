const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const zlib = require('node:zlib');
const taxonomy = require('../data/taxonomy.json');
const { createEtag, createServer } = require('../server');

function technology(overrides = {}) {
    return {
        id: 'root_technology',
        name: 'Root Technology',
        era: 'Ancient',
        description: 'A test technology used as a dependency root.',
        prerequisites: [],
        dependencyEdges: [],
        firstKnownDate: -1000,
        datePrecision: 'century',
        region: 'Test region',
        reviewStatus: 'structurally_validated',
        ...overrides
    };
}

function dependencyEdge(prerequisite) {
    return {
        prerequisite,
        type: 'enabling',
        confidence: 0.7,
        evidence_level: 'expert_inference',
        note: 'The prerequisite enables the dependent test technology.',
        reviewStatus: 'structurally_validated'
    };
}

async function startFixture(t, options = {}) {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'techtree-server-'));
    const dataDir = path.join(rootDir, 'data');
    fs.writeFileSync(path.join(rootDir, 'index.html'), '<!doctype html><title>TechTree test</title>');
    fs.writeFileSync(path.join(rootDir, 'server.js'), 'private source');
    fs.mkdirSync(path.join(rootDir, '.git'));
    fs.writeFileSync(path.join(rootDir, '.git', 'config'), 'private git config');
    fs.mkdirSync(path.join(rootDir, 'assets'));
    fs.writeFileSync(path.join(rootDir, 'assets', 'sample.png'), Buffer.from([0x89, 0x50, 0x4e, 0x47]));

    if (options.dataDirAsFile) {
        fs.writeFileSync(dataDir, 'not a directory');
    } else {
        fs.mkdirSync(dataDir);
    }

    const initialData = options.initialData || [technology()];
    const server = createServer({
        rootDir,
        dataDir,
        taxonomy,
        initialData,
        readOnly: options.readOnly ?? true,
        maxBodyBytes: options.maxBodyBytes
    });
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(0, '127.0.0.1', resolve);
    });

    t.after(async () => {
        await new Promise(resolve => server.close(resolve));
        fs.rmSync(rootDir, { recursive: true, force: true });
    });

    return {
        baseUrl: `http://127.0.0.1:${server.address().port}`,
        dataDir,
        etag: createEtag(initialData),
        initialData,
        rootDir
    };
}

async function responseJson(response) {
    const value = await response.json();
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8');
    return value;
}

function beginStreamingPut(baseUrl, data, etag) {
    const body = JSON.stringify(data);
    const url = new URL('/api/tech-tree', baseUrl);
    let finish;
    const response = new Promise((resolve, reject) => {
        const request = http.request(url, {
            method: 'PUT',
            headers: {
                'Content-Length': Buffer.byteLength(body),
                'Content-Type': 'application/json',
                'If-Match': etag
            }
        }, incoming => {
            const chunks = [];
            incoming.on('data', chunk => chunks.push(chunk));
            incoming.on('end', () => {
                resolve({
                    body: JSON.parse(Buffer.concat(chunks).toString('utf8')),
                    status: incoming.statusCode
                });
            });
        });
        request.on('error', reject);
        request.write(body.slice(0, 16));
        request.flushHeaders();
        finish = () => request.end(body.slice(16));
    });
    return { finish: () => finish(), response };
}

test('serves API and public assets without exposing repository internals', async t => {
    const fixture = await startFixture(t);

    const configResponse = await fetch(`${fixture.baseUrl}/api/config?cache-bust=1`);
    assert.equal(configResponse.status, 200);
    assert.deepEqual(await responseJson(configResponse), { readOnly: true });
    assert.equal(configResponse.headers.get('x-content-type-options'), 'nosniff');
    assert.match(configResponse.headers.get('content-security-policy'), /default-src 'self'/);

    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree?cache-bust=1`, {
        headers: { 'Accept-Encoding': 'identity' }
    });
    assert.equal(dataResponse.status, 200);
    assert.deepEqual(await responseJson(dataResponse), fixture.initialData);
    assert.equal(dataResponse.headers.get('etag'), fixture.etag);
    assert.equal(dataResponse.headers.get('cache-control'), 'public, no-cache');

    const headResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'HEAD',
        headers: { 'Accept-Encoding': 'identity' }
    });
    assert.equal(headResponse.status, 200);
    assert.equal(await headResponse.text(), '');
    assert.ok(Number(headResponse.headers.get('content-length')) > 0);
    assert.equal(headResponse.headers.get('cache-control'), 'public, no-cache');

    const indexResponse = await fetch(`${fixture.baseUrl}/?cache-bust=1`);
    assert.equal(indexResponse.status, 200);
    assert.match(await indexResponse.text(), /TechTree test/);

    for (const privatePath of ['/server.js', '/.git/config', '/data/ancient.json', '/scripts/validate-data.js']) {
        const response = await fetch(`${fixture.baseUrl}${privatePath}`);
        assert.equal(response.status, 404, privatePath);
    }
});

test('revalidates tech-tree GET and HEAD responses without retransmitting the dataset', async t => {
    const fixture = await startFixture(t);

    const conditionalGet = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: {
            'Accept-Encoding': 'identity',
            'If-None-Match': `"stale", W/${fixture.etag}`
        }
    });
    assert.equal(conditionalGet.status, 304);
    assert.equal(await conditionalGet.text(), '');
    assert.equal(conditionalGet.headers.get('etag'), fixture.etag);
    assert.equal(conditionalGet.headers.get('cache-control'), 'public, no-cache');
    assert.equal(conditionalGet.headers.get('vary'), 'Accept-Encoding');
    assert.equal(conditionalGet.headers.get('content-length'), null);
    assert.equal(conditionalGet.headers.get('content-type'), null);

    const conditionalHead = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'HEAD',
        headers: {
            'Accept-Encoding': 'identity',
            'If-None-Match': fixture.etag
        }
    });
    assert.equal(conditionalHead.status, 304);
    assert.equal(await conditionalHead.text(), '');
    assert.equal(conditionalHead.headers.get('etag'), fixture.etag);
    assert.equal(conditionalHead.headers.get('cache-control'), 'public, no-cache');
    assert.equal(conditionalHead.headers.get('content-length'), null);

    const wildcardGet = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: { 'If-None-Match': '*' }
    });
    assert.equal(wildcardGet.status, 304);
    assert.equal(await wildcardGet.text(), '');

    const staleGet = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: {
            'Accept-Encoding': 'identity',
            'If-None-Match': '"stale"'
        }
    });
    assert.equal(staleGet.status, 200);
    assert.deepEqual(await responseJson(staleGet), fixture.initialData);
    assert.equal(staleGet.headers.get('etag'), fixture.etag);
    assert.equal(staleGet.headers.get('cache-control'), 'public, no-cache');
});

test('keeps gzip GET and HEAD metadata consistent and skips compressed binary assets', async t => {
    const fixture = await startFixture(t);
    const headers = { 'Accept-Encoding': 'gzip' };

    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, { headers });
    assert.equal(dataResponse.status, 200);
    assert.equal(dataResponse.headers.get('content-encoding'), 'gzip');
    const gzipEtag = dataResponse.headers.get('etag');
    assert.notEqual(gzipEtag, fixture.etag);
    const compressedLength = dataResponse.headers.get('content-length');
    assert.ok(Number(compressedLength) > 0);
    assert.deepEqual(await responseJson(dataResponse), fixture.initialData);

    const headResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'HEAD',
        headers
    });
    assert.equal(headResponse.status, 200);
    assert.equal(headResponse.headers.get('content-encoding'), 'gzip');
    assert.equal(headResponse.headers.get('etag'), gzipEtag);
    assert.equal(headResponse.headers.get('content-length'), compressedLength);
    assert.equal(await headResponse.text(), '');

    const conditionalGzip = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: {
            'Accept-Encoding': 'gzip',
            'If-None-Match': gzipEtag
        }
    });
    assert.equal(conditionalGzip.status, 304);
    assert.equal(conditionalGzip.headers.get('etag'), gzipEtag);
    assert.equal(await conditionalGzip.text(), '');

    const mismatchedVariant = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: {
            'Accept-Encoding': 'identity',
            'If-None-Match': gzipEtag
        }
    });
    assert.equal(mismatchedVariant.status, 200);
    assert.equal(mismatchedVariant.headers.get('etag'), fixture.etag);
    assert.deepEqual(await responseJson(mismatchedVariant), fixture.initialData);

    const imageResponse = await fetch(`${fixture.baseUrl}/assets/sample.png`, { headers });
    assert.equal(imageResponse.status, 200);
    assert.equal(imageResponse.headers.get('content-encoding'), null);
    assert.equal(imageResponse.headers.get('vary'), null);
    assert.deepEqual(Buffer.from(await imageResponse.arrayBuffer()), Buffer.from([0x89, 0x50, 0x4e, 0x47]));
});

test('rejects unsafe and symlinked public paths without terminating the server', async t => {
    const fixture = await startFixture(t);
    fs.symlinkSync(path.join(fixture.rootDir, 'server.js'), path.join(fixture.rootDir, 'assets', 'private.js'));

    for (const unsafePath of [
        '/assets/private.js',
        '/assets/%00',
        '/assets/%2e%2e%5cserver.js'
    ]) {
        const response = await fetch(`${fixture.baseUrl}${unsafePath}`);
        assert.equal(response.status, 404, unsafePath);
        assert.equal((await responseJson(response)).error.code, 'not_found');
    }

    const healthResponse = await fetch(`${fixture.baseUrl}/api/config`);
    assert.equal(healthResponse.status, 200);
    assert.deepEqual(await responseJson(healthResponse), { readOnly: true });
});

test('returns one uncompressed error if response compression fails', async t => {
    const fixture = await startFixture(t);
    const originalGzip = zlib.gzip;
    zlib.gzip = (body, callback) => setImmediate(() => callback(new Error('forced compression failure')));
    t.after(() => {
        zlib.gzip = originalGzip;
    });

    const failedResponse = await fetch(`${fixture.baseUrl}/index.html`, {
        headers: { 'Accept-Encoding': 'gzip' }
    });
    assert.equal(failedResponse.status, 500);
    assert.equal(failedResponse.headers.get('content-encoding'), null);
    assert.equal((await responseJson(failedResponse)).error.code, 'compression_failed');

    const identityResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: { 'Accept-Encoding': 'identity' }
    });
    assert.equal(identityResponse.status, 200);
    assert.deepEqual(await responseJson(identityResponse), fixture.initialData);
});

test('accepts the current gzip representation ETag as a write precondition', async t => {
    const fixture = await startFixture(t, { readOnly: false });
    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        headers: { 'Accept-Encoding': 'gzip' }
    });
    const gzipEtag = dataResponse.headers.get('etag');
    assert.notEqual(gzipEtag, fixture.etag);
    assert.deepEqual(await responseJson(dataResponse), fixture.initialData);

    const candidate = [technology({ name: 'Updated through gzip ETag' })];
    const writeResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'If-Match': gzipEtag
        },
        body: JSON.stringify(candidate)
    });
    assert.equal(writeResponse.status, 200);
    assert.deepEqual(await responseJson(writeResponse), { ok: true, technologies: 1 });

    const currentResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`);
    assert.deepEqual(await responseJson(currentResponse), candidate);
});

test('enforces API methods and read-only mode', async t => {
    const fixture = await startFixture(t);

    const methodResponse = await fetch(`${fixture.baseUrl}/api/config`, { method: 'POST' });
    assert.equal(methodResponse.status, 405);
    assert.equal(methodResponse.headers.get('allow'), 'GET, HEAD');
    assert.equal((await responseJson(methodResponse)).error.code, 'method_not_allowed');

    const writeResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixture.initialData)
    });
    assert.equal(writeResponse.status, 403);
    assert.equal((await responseJson(writeResponse)).error.code, 'read_only');

    const missingResponse = await fetch(`${fixture.baseUrl}/api/missing`);
    assert.equal(missingResponse.status, 404);
    assert.equal((await responseJson(missingResponse)).error.code, 'not_found');
});

test('rejects unsupported, oversized, malformed, and structurally invalid writes', async t => {
    const fixture = await startFixture(t, { readOnly: false, maxBodyBytes: 1024 });

    const mediaResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'text/plain' },
        body: '[]'
    });
    assert.equal(mediaResponse.status, 415);
    assert.equal((await responseJson(mediaResponse)).error.code, 'unsupported_media_type');

    const preconditionResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixture.initialData)
    });
    assert.equal(preconditionResponse.status, 428);
    assert.equal((await responseJson(preconditionResponse)).error.code, 'precondition_required');

    const oversizedResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify({ padding: 'x'.repeat(1500) })
    });
    assert.equal(oversizedResponse.status, 413);
    assert.equal((await responseJson(oversizedResponse)).error.code, 'body_too_large');

    const jsonResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: '{'
    });
    assert.equal(jsonResponse.status, 400);
    assert.equal((await responseJson(jsonResponse)).error.code, 'invalid_json');

    const invalid = technology({ prerequisites: ['root_technology'], dependencyEdges: [null] });
    const invalidResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify([invalid])
    });
    assert.equal(invalidResponse.status, 422);
    const invalidBody = await responseJson(invalidResponse);
    assert.equal(invalidBody.error.code, 'invalid_dataset');
    assert.ok(invalidBody.error.details.some(detail => detail.includes('must be an object')));
    assert.deepEqual(fs.readdirSync(fixture.dataDir), []);
});

test('rejects temporal reversals and invalid era paths before persistence', async t => {
    const fixture = await startFixture(t, { readOnly: false });
    const later = technology({
        id: 'later_technology',
        name: 'Later Technology',
        era: 'Modern',
        firstKnownDate: 2000
    });
    const earlier = technology({
        id: 'earlier_technology',
        name: 'Earlier Technology',
        era: 'Modern',
        firstKnownDate: 1900,
        prerequisites: [later.id],
        dependencyEdges: [dependencyEdge(later.id)]
    });

    const temporalResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify([later, earlier])
    });
    assert.equal(temporalResponse.status, 422);
    const temporalBody = await responseJson(temporalResponse);
    assert.ok(temporalBody.error.details.some(detail => detail.includes('later firstKnownDate')));

    const traversalCandidate = technology({ era: '../outside' });
    const traversalResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify([traversalCandidate])
    });
    assert.equal(traversalResponse.status, 422);
    assert.equal((await responseJson(traversalResponse)).error.code, 'invalid_dataset');
    assert.deepEqual(fs.readdirSync(fixture.dataDir), []);
    assert.equal(fs.existsSync(path.join(fixture.rootDir, 'outside.json')), false);
});

test('persists a valid graph by canonical era and updates the in-memory API', async t => {
    const fixture = await startFixture(t, { readOnly: false });
    const dependent = technology({
        id: 'dependent_technology',
        name: 'Dependent Technology',
        era: 'Modern',
        description: 'A later technology with a reviewed dependency mirror.',
        prerequisites: ['root_technology'],
        dependencyEdges: [dependencyEdge('root_technology')],
        firstKnownDate: 2000,
        datePrecision: 'year'
    });
    const candidate = [...fixture.initialData, dependent];

    const writeResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json; charset=utf-8', 'If-Match': fixture.etag },
        body: JSON.stringify(candidate)
    });
    assert.equal(writeResponse.status, 200);
    assert.deepEqual(await responseJson(writeResponse), { ok: true, technologies: 2 });

    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture.dataDir, 'ancient.json'), 'utf8')), [candidate[0]]);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture.dataDir, 'modern.json'), 'utf8')), [candidate[1]]);
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture.dataDir, 'future.json'), 'utf8')), []);
    assert.equal(fs.existsSync(path.join(fixture.rootDir, 'tech-tree.json')), false);
    assert.equal(fs.readdirSync(fixture.dataDir).some(file => file.endsWith('.tmp')), false);

    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`);
    assert.deepEqual(await responseJson(dataResponse), candidate);

    const staleResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify([candidate[0], { ...candidate[1], name: 'Stale overwrite' }])
    });
    assert.equal(staleResponse.status, 412);
    assert.equal((await responseJson(staleResponse)).error.code, 'dataset_changed');
});

test('keeps in-memory data unchanged when persistence fails', async t => {
    const fixture = await startFixture(t, { readOnly: false, dataDirAsFile: true });
    const candidate = [technology({ name: 'Changed name' })];

    const originalConsoleError = console.error;
    console.error = () => {};
    t.after(() => {
        console.error = originalConsoleError;
    });

    const writeResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'If-Match': fixture.etag },
        body: JSON.stringify(candidate)
    });
    assert.equal(writeResponse.status, 500);
    assert.equal((await responseJson(writeResponse)).error.code, 'persistence_failed');

    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`);
    assert.deepEqual(await responseJson(dataResponse), fixture.initialData);
});

test('rejects a concurrent upload after another request changes the ETag', async t => {
    const fixture = await startFixture(t, { readOnly: false });
    const first = beginStreamingPut(fixture.baseUrl, [technology({ name: 'First write' })], fixture.etag);
    const second = beginStreamingPut(fixture.baseUrl, [technology({ name: 'Second write' })], fixture.etag);

    await new Promise(resolve => setTimeout(resolve, 50));
    first.finish();
    const firstResponse = await first.response;
    assert.equal(firstResponse.status, 200);

    second.finish();
    const secondResponse = await second.response;
    assert.equal(secondResponse.status, 412);
    assert.equal(secondResponse.body.error.code, 'dataset_changed');

    const dataResponse = await fetch(`${fixture.baseUrl}/api/tech-tree`);
    assert.deepEqual(await responseJson(dataResponse), [technology({ name: 'First write' })]);
});

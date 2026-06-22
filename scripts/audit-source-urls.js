const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');

const args = process.argv.slice(2);
const fieldArgIndex = args.indexOf('--field');
const fieldFilter = fieldArgIndex >= 0 ? args[fieldArgIndex + 1] : null;
const checkAll = args.includes('--all') || !fieldFilter;
const timeoutArgIndex = args.indexOf('--timeout-ms');
const timeoutMs = timeoutArgIndex >= 0 ? Number(args[timeoutArgIndex + 1]) : 10000;
const retryTimeoutMs = Math.max(timeoutMs, Math.min(timeoutMs * 3, 30000));
const concurrencyArgIndex = args.indexOf('--concurrency');
const concurrency = concurrencyArgIndex >= 0 ? Number(args[concurrencyArgIndex + 1]) : 8;
const TRANSIENT_FAILURE_STATUSES = new Set([
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'socket hang up'
]);

if (!checkAll && !fieldFilter) {
    console.error('Usage: node scripts/audit-source-urls.js [--all] [--field "Field Name"] [--timeout-ms 10000] [--concurrency 8]');
    process.exit(1);
}

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')));
}

function collectSources(items) {
    const urls = new Map();
    for (const item of items) {
        if (fieldFilter && !item.fields?.includes(fieldFilter)) continue;
        const sources = [
            ...(Array.isArray(item.sources) ? item.sources : []),
            ...(Array.isArray(item.dependencyEdges)
                ? item.dependencyEdges.flatMap(edge => Array.isArray(edge.sources) ? edge.sources : [])
                : [])
        ];
        for (const source of sources) {
            if (!source?.url) continue;
            if (!urls.has(source.url)) urls.set(source.url, new Set());
            urls.get(source.url).add(item.id);
        }
    }
    return [...urls.entries()].map(([url, ids]) => ({ url, ids: [...ids].sort() }));
}

function requestUrl(url, method, redirects = 0, requestTimeoutMs = timeoutMs) {
    return new Promise(resolve => {
        let parsed;
        try {
            parsed = new URL(url);
        } catch (error) {
            resolve({ ok: false, status: 'invalid_url', finalUrl: url });
            return;
        }

        const client = parsed.protocol === 'http:' ? http : https;
        const req = client.request(parsed, { method, timeout: requestTimeoutMs, headers: { 'User-Agent': 'curl/8.5.0' } }, res => {
            const location = res.headers.location;
            res.resume();
            if (location && [301, 302, 303, 307, 308].includes(res.statusCode) && redirects < 6) {
                const nextUrl = new URL(location, parsed).toString();
                resolve(requestUrl(nextUrl, method, redirects + 1, requestTimeoutMs));
                return;
            }
            resolve({ ok: res.statusCode !== 404 && res.statusCode < 500, status: res.statusCode, finalUrl: parsed.toString() });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ ok: false, status: 'timeout', finalUrl: parsed.toString() });
        });
        req.on('error', error => {
            resolve({ ok: false, status: error.code || error.message, finalUrl: parsed.toString() });
        });
        req.end();
    });
}

function isTransientFailure(status) {
    return TRANSIENT_FAILURE_STATUSES.has(status);
}

async function requestWithFallback(url, requestTimeoutMs) {
    let result = await requestUrl(url, 'HEAD', 0, requestTimeoutMs);
    if ([403, 404, 405].includes(result.status)) {
        result = await requestUrl(url, 'GET', 0, requestTimeoutMs);
    }
    return result;
}

async function checkSource(entry) {
    let result = await requestWithFallback(entry.url, timeoutMs);
    if (!result.ok && isTransientFailure(result.status) && retryTimeoutMs > timeoutMs) {
        result = await requestWithFallback(entry.url, retryTimeoutMs);
    }
    return { ...entry, ...result };
}

async function runPool(entries) {
    const results = [];
    let nextIndex = 0;
    const workers = Array.from({ length: Math.max(1, concurrency) }, async () => {
        while (nextIndex < entries.length) {
            const current = entries[nextIndex];
            nextIndex += 1;
            results.push(await checkSource(current));
        }
    });
    await Promise.all(workers);
    return results.sort((a, b) => a.url.localeCompare(b.url));
}

async function main() {
    const sources = collectSources(loadData());
    if (sources.length === 0) {
        console.log(`No source URLs found${fieldFilter ? ` for ${fieldFilter}` : ''}.`);
        return;
    }

    const results = await runPool(sources);
    const failures = results.filter(result => !result.ok);
    const scope = fieldFilter ? ` for ${fieldFilter}` : '';

    if (failures.length) {
        console.error(`Source URL audit failed${scope}: ${failures.length}/${results.length} URL(s) failed.`);
        for (const failure of failures) {
            console.error(`- ${failure.status} ${failure.url} (${failure.ids.slice(0, 5).join(', ')})`);
        }
        process.exit(1);
    }

    console.log(`Source URL audit passed${scope}: ${results.length} unique URL(s) returned non-404/non-5xx statuses.`);
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});

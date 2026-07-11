#!/usr/bin/env node
const fs = require('fs');
const http = require('http');
const https = require('https');
const path = require('path');
const { execFileSync } = require('child_process');
const { isTechnologyDataFile } = require('./data-files');
const { FUTURE_EXCLUSION_NOTE, isLaunchQualityNode } = require('./quality-scope');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TRANSIENT_FAILURE_STATUSES = new Set([
    500,
    502,
    503,
    504,
    'timeout',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
    'socket hang up'
]);

function usage() {
    console.log(`Usage: node scripts/audit-source-urls.js [--all | --changed] [--field "Field Name"] [--timeout-ms 10000] [--concurrency 8]

With --changed, only URLs newly introduced since HEAD are checked. Future nodes
remain excluded. With no scope flag, all pre-Future URLs are checked.`);
}

function parseArgs(args) {
    const options = {
        all: false,
        changed: false,
        concurrency: 8,
        fieldFilter: null,
        help: false,
        timeoutMs: 10000
    };

    for (let index = 0; index < args.length; index += 1) {
        const arg = args[index];
        if (arg === '--all') {
            options.all = true;
        } else if (arg === '--changed') {
            options.changed = true;
        } else if (arg === '--field') {
            options.fieldFilter = args[index + 1];
            index += 1;
        } else if (arg === '--timeout-ms') {
            options.timeoutMs = Number(args[index + 1]);
            index += 1;
        } else if (arg === '--concurrency') {
            options.concurrency = Number(args[index + 1]);
            index += 1;
        } else if (arg === '--help' || arg === '-h') {
            options.help = true;
        } else {
            throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (options.all && options.changed) throw new Error('--all and --changed cannot be combined');
    if (!Number.isFinite(options.timeoutMs) || options.timeoutMs < 1) {
        throw new Error('--timeout-ms must be a positive number');
    }
    if (!Number.isInteger(options.concurrency) || options.concurrency < 1) {
        throw new Error('--concurrency must be a positive integer');
    }
    if (args.includes('--field') && !options.fieldFilter) throw new Error('--field requires a value');
    options.retryTimeoutMs = Math.max(options.timeoutMs, Math.min(options.timeoutMs * 3, 30000));
    return options;
}

function readItems(content, label) {
    const parsed = JSON.parse(content);
    if (!Array.isArray(parsed)) throw new Error(`${label} must contain a JSON array`);
    return parsed;
}

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => readItems(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'), file));
}

function itemSources(item) {
    return [
        ...(Array.isArray(item.sources) ? item.sources : []),
        ...(Array.isArray(item.dependencyEdges)
            ? item.dependencyEdges.flatMap(edge => Array.isArray(edge.sources) ? edge.sources : [])
            : [])
    ].filter(source => source?.url);
}

function collectSources(items, options = {}) {
    const urls = new Map();
    for (const item of items) {
        if (!isLaunchQualityNode(item)) continue;
        if (options.fieldFilter && !item.fields?.includes(options.fieldFilter)) continue;
        for (const source of itemSources(item)) {
            if (!urls.has(source.url)) urls.set(source.url, new Set());
            urls.get(source.url).add(item.id);
        }
    }
    return [...urls.entries()].map(([url, ids]) => ({ url, ids: [...ids].sort() }));
}

function collectChangedSources(currentItems, baseItems, options = {}) {
    const baseById = new Map(baseItems.map(item => [item.id, item]));
    const changedItems = currentItems.map(item => {
        const previousUrls = new Set(itemSources(baseById.get(item.id) || {}).map(source => source.url));
        const sources = itemSources(item).filter(source => !previousUrls.has(source.url));
        return {
            ...item,
            sources,
            dependencyEdges: []
        };
    });
    return collectSources(changedItems, options);
}

function gitLines(args) {
    return execFileSync('git', args, { cwd: ROOT_DIR, encoding: 'utf8' })
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(Boolean);
}

function isTechnologyDataPath(file) {
    return /^data\/[^/]+\.json$/.test(file) && isTechnologyDataFile(path.basename(file));
}

function changedTechnologyFiles() {
    let tracked = [];
    try {
        tracked = gitLines(['diff', '--name-only', 'HEAD', '--', 'data']);
    } catch (error) {
        tracked = [];
    }
    const untracked = gitLines(['ls-files', '--others', '--exclude-standard', '--', 'data']);
    return [...new Set([...tracked, ...untracked].filter(isTechnologyDataPath))].sort();
}

function loadChangedData() {
    const currentItems = [];
    const baseItems = [];
    for (const file of changedTechnologyFiles()) {
        const currentPath = path.join(ROOT_DIR, file);
        if (fs.existsSync(currentPath)) {
            currentItems.push(...readItems(fs.readFileSync(currentPath, 'utf8'), file));
        }
        try {
            const base = execFileSync('git', ['show', `HEAD:${file}`], {
                cwd: ROOT_DIR,
                encoding: 'utf8',
                stdio: ['ignore', 'pipe', 'ignore']
            });
            baseItems.push(...readItems(base, `HEAD:${file}`));
        } catch (error) {
            // New files have no HEAD version.
        }
    }
    return { currentItems, baseItems };
}

function requestUrl(url, method, requestTimeoutMs, redirects = 0) {
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
                resolve(requestUrl(nextUrl, method, requestTimeoutMs, redirects + 1));
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
    let result = await requestUrl(url, 'HEAD', requestTimeoutMs);
    if ([403, 404, 405, 500, 502, 503, 504].includes(result.status)) {
        result = await requestUrl(url, 'GET', requestTimeoutMs);
    }
    return result;
}

async function checkSource(entry, options) {
    let result = await requestWithFallback(entry.url, options.timeoutMs);
    if (!result.ok && isTransientFailure(result.status) && options.retryTimeoutMs > options.timeoutMs) {
        result = await requestWithFallback(entry.url, options.retryTimeoutMs);
    }
    return { ...entry, ...result };
}

async function runPool(entries, options) {
    const results = [];
    let nextIndex = 0;
    const workers = Array.from({ length: options.concurrency }, async () => {
        while (nextIndex < entries.length) {
            const current = entries[nextIndex];
            nextIndex += 1;
            results.push(await checkSource(current, options));
        }
    });
    await Promise.all(workers);
    return results.sort((left, right) => left.url.localeCompare(right.url));
}

async function main(argv = process.argv.slice(2)) {
    const options = parseArgs(argv);
    if (options.help) {
        usage();
        return 0;
    }

    const sources = options.changed
        ? (() => {
            const { currentItems, baseItems } = loadChangedData();
            return collectChangedSources(currentItems, baseItems, options);
        })()
        : collectSources(loadData(), options);
    const scope = options.changed
        ? ' newly introduced by changed pre-Future data'
        : options.fieldFilter ? ` for ${options.fieldFilter}` : '';

    if (sources.length === 0) {
        console.log(`No pre-Future source URLs found${scope}. ${FUTURE_EXCLUSION_NOTE}`);
        return 0;
    }

    const results = await runPool(sources, options);
    const failures = results.filter(result => !result.ok);
    if (failures.length) {
        console.error(`Source URL audit failed${scope}: ${failures.length}/${results.length} URL(s) failed.`);
        for (const failure of failures) {
            console.error(`- ${failure.status} ${failure.url} (${failure.ids.slice(0, 5).join(', ')})`);
        }
        console.error(FUTURE_EXCLUSION_NOTE);
        return 1;
    }

    console.log(`Source URL audit passed${scope}: ${results.length} unique URL(s) returned non-404/non-5xx statuses.`);
    console.log(FUTURE_EXCLUSION_NOTE);
    return 0;
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
    changedTechnologyFiles,
    collectChangedSources,
    collectSources,
    itemSources,
    loadChangedData,
    main,
    parseArgs,
    runPool
};

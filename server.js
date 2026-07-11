const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { validateData } = require('./scripts/validate-data');
const { auditTemporalConsistency } = require('./scripts/audit-temporal-consistency');

const DEFAULT_ROOT_DIR = __dirname;
const DEFAULT_MAX_BODY_BYTES = 8 * 1024 * 1024;
const PUBLIC_ROOT_FILES = new Set([
    'index.html',
    'demo.html',
    'sorted.html',
    'app.js',
    'demo.js',
    'sorted.js',
    'style.css',
    'robots.txt',
    'sitemap.xml',
    'llms.txt'
]);
const PUBLIC_DIRECTORIES = new Set(['assets', 'fields', 'tech', 'vendor']);
const MIME_TYPES = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.ico': 'image/x-icon',
    '.js': 'application/javascript; charset=utf-8',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain; charset=utf-8',
    '.webp': 'image/webp',
    '.xml': 'application/xml; charset=utf-8'
};

function parseReadOnly(value) {
    if (value === undefined || value === null || value === '') return true;
    return !/^(0|false|no)$/i.test(String(value));
}

function loadTaxonomy(dataDir) {
    return JSON.parse(fs.readFileSync(path.join(dataDir, 'taxonomy.json'), 'utf8'));
}

function loadData(dataDir, taxonomy) {
    return taxonomy.eras.flatMap(era => {
        const file = `${era.toLowerCase()}.json`;
        const filePath = path.join(dataDir, file);
        const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(chunk)) throw new Error(`${file} must contain a JSON array`);
        return chunk;
    });
}

function serializableTechnology(item) {
    const { __file, ...technology } = item;
    return technology;
}

function createEtag(data) {
    const digest = crypto.createHash('sha256').update(JSON.stringify(data)).digest('base64url');
    return `"${digest}"`;
}

function saveData(data, dataDir, taxonomy) {
    fs.mkdirSync(dataDir, { recursive: true });
    const byEra = new Map(taxonomy.eras.map(era => [era, []]));
    for (const item of data) byEra.get(item.era).push(serializableTechnology(item));

    const pending = [];
    try {
        for (const era of taxonomy.eras) {
            const targetPath = path.join(dataDir, `${era.toLowerCase()}.json`);
            const content = `${JSON.stringify(byEra.get(era), null, 2)}\n`;
            if (fs.existsSync(targetPath) && fs.readFileSync(targetPath, 'utf8') === content) continue;

            const tempPath = `${targetPath}.${process.pid}.${Date.now()}.${pending.length}.tmp`;
            fs.writeFileSync(tempPath, content, { encoding: 'utf8', flag: 'wx' });
            pending.push({ targetPath, tempPath });
        }

        for (const { targetPath, tempPath } of pending) {
            fs.renameSync(tempPath, targetPath);
        }
    } finally {
        for (const { tempPath } of pending) {
            try {
                fs.unlinkSync(tempPath);
            } catch (error) {
                if (error.code !== 'ENOENT') throw error;
            }
        }
    }
}

function setSecurityHeaders(res) {
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'");
    res.setHeader('Permissions-Policy', 'camera=(), geolocation=(), microphone=()');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
}

function acceptsGzip(req) {
    return String(req.headers['accept-encoding'] || '')
        .split(',')
        .map(value => value.trim().toLowerCase())
        .some(value => value === 'gzip' || (value.startsWith('gzip;') && !/q=0(?:\.0+)?(?:;|$)/.test(value)));
}

function send(req, res, statusCode, content, contentType, cacheControl = 'no-store', extraHeaders = {}) {
    const body = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
    const headers = {
        'Cache-Control': cacheControl,
        'Content-Type': contentType,
        Vary: 'Accept-Encoding',
        ...extraHeaders
    };
    setSecurityHeaders(res);

    if (req.method === 'HEAD' || !body.length || !acceptsGzip(req)) {
        res.writeHead(statusCode, { ...headers, 'Content-Length': body.length });
        res.end(req.method === 'HEAD' ? undefined : body);
        return;
    }

    zlib.gzip(body, (error, compressed) => {
        if (error) {
            sendJson(req, res, 500, 'compression_failed', 'Response compression failed.');
            return;
        }
        res.writeHead(statusCode, {
            ...headers,
            'Content-Encoding': 'gzip',
            'Content-Length': compressed.length,
            Vary: 'Accept-Encoding'
        });
        res.end(compressed);
    });
}

function sendJson(req, res, statusCode, code, message, details, extraHeaders = {}) {
    const error = { code, message };
    if (details?.length) error.details = details.slice(0, 50);
    if (details?.length > 50) error.omittedDetails = details.length - 50;
    send(req, res, statusCode, JSON.stringify({ error }), 'application/json; charset=utf-8', 'no-store', extraHeaders);
}

function sendJsonValue(req, res, statusCode, value, cacheControl = 'no-store', extraHeaders = {}) {
    send(req, res, statusCode, JSON.stringify(value), 'application/json; charset=utf-8', cacheControl, extraHeaders);
}

function readRequestBody(req, maxBodyBytes, callback) {
    const declaredLength = Number(req.headers['content-length']);
    if (Number.isFinite(declaredLength) && declaredLength > maxBodyBytes) {
        req.resume();
        callback(Object.assign(new Error('Request body is too large.'), { code: 'body_too_large' }));
        return;
    }

    const chunks = [];
    let size = 0;
    let complete = false;

    function finish(error, body) {
        if (complete) return;
        complete = true;
        callback(error, body);
    }

    req.on('data', chunk => {
        size += chunk.length;
        if (size > maxBodyBytes) {
            finish(Object.assign(new Error('Request body is too large.'), { code: 'body_too_large' }));
            return;
        }
        if (!complete) chunks.push(chunk);
    });
    req.on('end', () => {
        if (!complete) finish(null, Buffer.concat(chunks).toString('utf8'));
    });
    req.on('aborted', () => finish(Object.assign(new Error('Request was aborted.'), { code: 'request_aborted' })));
    req.on('error', error => finish(error));
}

function isJsonContentType(value) {
    return /^application\/(?:[a-z0-9.+-]+\+)?json(?:\s*;|$)/i.test(String(value || ''));
}

function parsePathname(req) {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    return decodeURIComponent(url.pathname);
}

function isPublicPath(requestedPath) {
    if (PUBLIC_ROOT_FILES.has(requestedPath)) return true;
    const segments = requestedPath.split('/');
    return segments.length > 1
        && PUBLIC_DIRECTORIES.has(segments[0])
        && segments.every(segment => segment && segment !== '.' && segment !== '..' && !segment.startsWith('.'));
}

function serveStatic(req, res, rootDir, pathname) {
    if (!['GET', 'HEAD'].includes(req.method)) {
        sendJson(req, res, 405, 'method_not_allowed', 'Only GET and HEAD are allowed for static resources.', null, { Allow: 'GET, HEAD' });
        return;
    }

    const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    if (!isPublicPath(requestedPath)) {
        sendJson(req, res, 404, 'not_found', 'Resource not found.');
        return;
    }

    const filePath = path.resolve(rootDir, requestedPath);
    const rootPrefix = `${path.resolve(rootDir)}${path.sep}`;
    if (!filePath.startsWith(rootPrefix)) {
        sendJson(req, res, 404, 'not_found', 'Resource not found.');
        return;
    }

    fs.realpath(filePath, (realPathError, realPath) => {
        if (realPathError || !realPath.startsWith(rootPrefix)) {
            sendJson(req, res, 404, 'not_found', 'Resource not found.');
            return;
        }
        fs.readFile(realPath, (readError, content) => {
            if (readError) {
                sendJson(req, res, 404, 'not_found', 'Resource not found.');
                return;
            }

            const extension = path.extname(realPath).toLowerCase();
            const contentType = MIME_TYPES[extension] || 'application/octet-stream';
            const basename = path.basename(realPath);
            const cacheControl = extension === '.html'
                || ['sitemap.xml', 'robots.txt', 'llms.txt'].includes(basename)
                ? 'no-cache'
                : 'public, max-age=31536000, immutable';
            send(req, res, 200, content, contentType, cacheControl);
        });
    });
}

function createServer(options = {}) {
    const rootDir = path.resolve(options.rootDir || DEFAULT_ROOT_DIR);
    const dataDir = path.resolve(options.dataDir || path.join(rootDir, 'data'));
    const readOnly = options.readOnly ?? parseReadOnly(process.env.TECHTREE_READ_ONLY);
    const maxBodyBytes = options.maxBodyBytes || DEFAULT_MAX_BODY_BYTES;
    const taxonomy = options.taxonomy || loadTaxonomy(dataDir);
    let techData = options.initialData || loadData(dataDir, taxonomy);
    let dataEtag = createEtag(techData);

    return http.createServer((req, res) => {
        let pathname;
        try {
            pathname = parsePathname(req);
        } catch (error) {
            sendJson(req, res, 400, 'bad_request', 'Request URL is invalid.');
            return;
        }

        if (pathname === '/api/config') {
            if (!['GET', 'HEAD'].includes(req.method)) {
                sendJson(req, res, 405, 'method_not_allowed', 'Only GET and HEAD are allowed.', null, { Allow: 'GET, HEAD' });
                return;
            }
            sendJsonValue(req, res, 200, { readOnly }, 'no-store');
            return;
        }

        if (pathname === '/api/tech-tree') {
            if (['GET', 'HEAD'].includes(req.method)) {
                sendJsonValue(req, res, 200, techData, 'no-store', { ETag: dataEtag });
                return;
            }
            if (req.method !== 'PUT') {
                sendJson(req, res, 405, 'method_not_allowed', 'Use GET, HEAD, or PUT for this endpoint.', null, { Allow: 'GET, HEAD, PUT' });
                return;
            }
            if (readOnly) {
                req.resume();
                sendJson(req, res, 403, 'read_only', 'This server is running in read-only mode.');
                return;
            }
            if (!isJsonContentType(req.headers['content-type'])) {
                req.resume();
                sendJson(req, res, 415, 'unsupported_media_type', 'PUT requests must use application/json.');
                return;
            }
            const requestedEtag = req.headers['if-match'];
            if (!requestedEtag) {
                req.resume();
                sendJson(req, res, 428, 'precondition_required', 'PUT requests must include the ETag from the latest GET response.');
                return;
            }
            if (requestedEtag !== dataEtag) {
                req.resume();
                sendJson(req, res, 412, 'dataset_changed', 'The dataset changed after it was loaded. Fetch the latest graph and retry.');
                return;
            }

            readRequestBody(req, maxBodyBytes, (readError, body) => {
                if (readError) {
                    const statusCode = readError.code === 'body_too_large' ? 413 : 400;
                    const code = readError.code === 'body_too_large' ? 'body_too_large' : 'invalid_request_body';
                    sendJson(req, res, statusCode, code, readError.message);
                    return;
                }
                if (requestedEtag !== dataEtag) {
                    sendJson(req, res, 412, 'dataset_changed', 'The dataset changed while this request was uploading. Fetch the latest graph and retry.');
                    return;
                }

                let candidate;
                try {
                    candidate = JSON.parse(body);
                } catch (error) {
                    sendJson(req, res, 400, 'invalid_json', 'Request body is not valid JSON.');
                    return;
                }

                let validationErrors;
                try {
                    validationErrors = validateData(candidate, taxonomy, { label: 'payload' });
                    if (!validationErrors.length) {
                        validationErrors.push(...auditTemporalConsistency(candidate, { label: 'payload' }));
                    }
                } catch (error) {
                    console.error('Dataset validation failed unexpectedly:', error);
                    sendJson(req, res, 500, 'validation_failed', 'Dataset validation could not be completed.');
                    return;
                }
                if (validationErrors.length) {
                    sendJson(req, res, 422, 'invalid_dataset', `Dataset validation failed with ${validationErrors.length} issue(s).`, validationErrors);
                    return;
                }

                const cleanCandidate = candidate.map(serializableTechnology);
                try {
                    saveData(cleanCandidate, dataDir, taxonomy);
                } catch (error) {
                    console.error('Failed to persist technology data:', error);
                    sendJson(req, res, 500, 'persistence_failed', 'Validated data could not be persisted.');
                    return;
                }

                techData = cleanCandidate;
                dataEtag = createEtag(techData);
                sendJsonValue(req, res, 200, { ok: true, technologies: techData.length }, 'no-store', { ETag: dataEtag });
            });
            return;
        }

        if (pathname.startsWith('/api/')) {
            sendJson(req, res, 404, 'not_found', 'API endpoint not found.');
            return;
        }

        serveStatic(req, res, rootDir, pathname);
    });
}

if (require.main === module) {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '127.0.0.1';
    const readOnly = parseReadOnly(process.env.TECHTREE_READ_ONLY);
    const server = createServer({ readOnly });
    server.listen(port, host, () => {
        console.log(`TechTree server running at http://${host}:${port} (${readOnly ? 'read-only' : 'write-enabled'})`);
    });
}

module.exports = {
    DEFAULT_MAX_BODY_BYTES,
    createEtag,
    createServer,
    isJsonContentType,
    loadData,
    parseReadOnly,
    saveData
};

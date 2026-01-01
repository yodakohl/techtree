const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const DATA_FILE = path.join(__dirname, 'tech-tree.json');
const DATA_DIR = path.join(__dirname, 'data');
const SEARCH_BUCKET_SIZE = 2;

function loadData() {
    // Prefer split data files if available
    if (fs.existsSync(DATA_DIR)) {
        const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
        if (files.length) {
            const combined = [];
            for (const f of files) {
                const p = path.join(DATA_DIR, f);
                try {
                    const chunk = JSON.parse(fs.readFileSync(p, 'utf8'));
                    if (Array.isArray(chunk)) combined.push(...chunk);
                } catch (e) {
                    console.error('Failed to parse', p, e);
                }
            }
            if (combined.length) return combined;
        }
    }
    // Fallback to single JSON file
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    // Fallback to bundled initial data
    let initial = [];
    try {
        initial = require('./tech-data.js');
    } catch (e) {
        console.error('Failed to load initial tech data:', e);
    }
    saveDataArray(initial);
    return initial;
}

let techData = loadData();
let techIndex = buildIndexes(techData);

function normalize(value) {
    return (value || '').toString().toLowerCase();
}

function bucketKey(value) {
    const cleaned = normalize(value).replace(/[^a-z0-9]/g, '');
    if (cleaned.length < SEARCH_BUCKET_SIZE) {
        return '';
    }
    return cleaned.slice(0, SEARCH_BUCKET_SIZE);
}

function addToSearchBucket(buckets, tech, value) {
    const key = bucketKey(value);
    if (!key) return;
    let bucket = buckets.get(key);
    if (!bucket) {
        bucket = new Map();
        buckets.set(key, bucket);
    }
    if (!bucket.has(tech.id)) {
        bucket.set(tech.id, {
            id: tech.id,
            nameLower: normalize(tech.name),
            idLower: normalize(tech.id)
        });
    }
}

function buildIndexes(data) {
    const techById = new Map();
    const dependentsMap = new Map();
    const roots = [];
    const searchBuckets = new Map();

    data.forEach(tech => {
        if (!tech || !tech.id) return;
        techById.set(tech.id, tech);

        const prereqs = tech.prerequisites || [];
        if (prereqs.length === 0) {
            roots.push(tech);
        }
        prereqs.forEach(prereqId => {
            const set = dependentsMap.get(prereqId) || new Set();
            set.add(tech.id);
            dependentsMap.set(prereqId, set);
        });

        addToSearchBucket(searchBuckets, tech, tech.name);
        addToSearchBucket(searchBuckets, tech, tech.id);
    });

    return {
        techById,
        dependentsMap,
        roots,
        searchBuckets
    };
}

function rebuildIndexes() {
    techIndex = buildIndexes(techData);
}

function saveDataArray(data) {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const byEra = {};
    data.forEach(t => {
        const key = (t.era || 'unknown').toLowerCase().replace(/\s+/g, '_');
        (byEra[key] = byEra[key] || []).push(t);
    });
    for (const [era, arr] of Object.entries(byEra)) {
        fs.writeFileSync(path.join(DATA_DIR, `${era}.json`), JSON.stringify(arr, null, 2));
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function saveData() {
    saveDataArray(techData);
    rebuildIndexes();
}

function sendCompressed(req, res, content, mime) {
    const enc = req.headers['accept-encoding'] || '';
    const headers = {
        'Content-Type': mime,
        'Cache-Control': 'public, max-age=3600'
    };
    if (/(^|,\s*)gzip(,|$)/.test(enc)) {
        zlib.gzip(content, (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end();
                return;
            }
            res.writeHead(200, { ...headers, 'Content-Encoding': 'gzip' });
            res.end(data);
        });
    } else {
        res.writeHead(200, headers);
        res.end(content);
    }
}

function sendJson(req, res, payload, statusCode = 200) {
    const json = JSON.stringify(payload);
    if (statusCode !== 200) {
        res.statusCode = statusCode;
    }
    sendCompressed(req, res, Buffer.from(json), 'application/json');
}

function serveStatic(req, res) {
    const filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.statusCode = 404;
            res.end('Not found');
            return;
        }
        const ext = path.extname(filePath);
        const mime = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json'
        }[ext] || 'text/plain';
        sendCompressed(req, res, content, mime);
    });
}

function parseLimit(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 0) return fallback;
    return parsed;
}

function handleGetTechTree(req, res, url) {
    const idsParam = url.searchParams.get('ids');
    const search = url.searchParams.get('search');
    const neighbors = url.searchParams.get('neighbors');
    const roots = url.searchParams.get('roots');
    const limit = parseLimit(url.searchParams.get('limit'), 200);
    const offset = parseLimit(url.searchParams.get('offset'), 0);

    if (neighbors) {
        const depth = parseLimit(url.searchParams.get('depth'), 1);
        const result = collectNeighbors(neighbors, depth);
        sendJson(req, res, result);
        return;
    }

    if (idsParam) {
        const ids = idsParam.split(',').map(id => id.trim()).filter(Boolean);
        const result = ids
            .map(id => techIndex.techById.get(id))
            .filter(Boolean);
        sendJson(req, res, result);
        return;
    }

    if (search) {
        const trimmed = normalize(search).trim();
        if (trimmed.length < SEARCH_BUCKET_SIZE) {
            sendJson(req, res, []);
            return;
        }
        const key = bucketKey(trimmed);
        const bucket = techIndex.searchBuckets.get(key);
        if (!bucket) {
            sendJson(req, res, []);
            return;
        }
        const matches = [];
        for (const entry of bucket.values()) {
            if (entry.nameLower.includes(trimmed) || entry.idLower.includes(trimmed)) {
                const tech = techIndex.techById.get(entry.id);
                if (tech) matches.push(tech);
            }
            if (matches.length >= limit) break;
        }
        sendJson(req, res, matches);
        return;
    }

    if (roots) {
        const result = techIndex.roots.slice(offset, offset + limit);
        sendJson(req, res, result);
        return;
    }

    if (url.searchParams.has('limit') || url.searchParams.has('offset')) {
        const result = techData.slice(offset, offset + limit);
        sendJson(req, res, result);
        return;
    }

    sendJson(req, res, techData);
}

function collectNeighbors(startId, depth) {
    const result = [];
    const visited = new Set();
    const queue = [{ id: startId, depth: 0 }];

    while (queue.length > 0) {
        const current = queue.shift();
        if (visited.has(current.id)) continue;
        visited.add(current.id);
        const tech = techIndex.techById.get(current.id);
        if (tech) {
            result.push(tech);
        }
        if (current.depth >= depth) continue;

        const prereqs = tech ? tech.prerequisites || [] : [];
        prereqs.forEach(pr => {
            if (!visited.has(pr)) {
                queue.push({ id: pr, depth: current.depth + 1 });
            }
        });
        const dependents = techIndex.dependentsMap.get(current.id) || new Set();
        dependents.forEach(dep => {
            if (!visited.has(dep)) {
                queue.push({ id: dep, depth: current.depth + 1 });
            }
        });
    }

    return result;
}

function handleWriteTech(req, res, method, url) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
        try {
            const data = body ? JSON.parse(body) : {};
            if (!data || !data.id) {
                res.statusCode = 400;
                res.end('Invalid JSON');
                return;
            }

            if (method === 'POST') {
                if (techIndex.techById.has(data.id)) {
                    res.statusCode = 409;
                    res.end('Technology already exists');
                    return;
                }
                techData.push(data);
                saveData();
                sendJson(req, res, { status: 'ok' });
                return;
            }

            if (method === 'PUT') {
                const existing = techIndex.techById.get(data.id);
                if (!existing) {
                    res.statusCode = 404;
                    res.end('Technology not found');
                    return;
                }
                existing.name = data.name;
                existing.era = data.era;
                existing.description = data.description;
                existing.prerequisites = data.prerequisites || [];
                saveData();
                sendJson(req, res, { status: 'ok' });
                return;
            }

            if (method === 'DELETE') {
                const id = url.searchParams.get('id') || data.id;
                if (!id || !techIndex.techById.has(id)) {
                    res.statusCode = 404;
                    res.end('Technology not found');
                    return;
                }
                techData = techData.filter(t => t.id !== id);
                techData.forEach(t => {
                    if (Array.isArray(t.prerequisites)) {
                        t.prerequisites = t.prerequisites.filter(pr => pr !== id);
                    }
                });
                saveData();
                sendJson(req, res, { status: 'ok' });
                return;
            }

            res.statusCode = 405;
            res.end('Method not allowed');
        } catch (e) {
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
}

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/api/tech-tree') {
        if (req.method === 'GET') {
            handleGetTechTree(req, res, url);
            return;
        }
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
            handleWriteTech(req, res, req.method, url);
            return;
        }
    }

    serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

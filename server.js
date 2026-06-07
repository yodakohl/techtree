const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { isTechnologyDataFile } = require('./scripts/data-files');

const DATA_FILE = path.join(__dirname, 'tech-tree.json');
const DATA_DIR = path.join(__dirname, 'data');
const READ_ONLY = /^(1|true|yes)$/i.test(process.env.TECHTREE_READ_ONLY || '');

function loadData() {
    // Prefer split data files if available
    if (fs.existsSync(DATA_DIR)) {
        const files = fs.readdirSync(DATA_DIR).filter(isTechnologyDataFile);
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
}

function sendCompressed(req, res, content, mime, cacheControl = 'public, max-age=3600') {
    const enc = req.headers['accept-encoding'] || '';
    const headers = {
        'Content-Type': mime,
        'Cache-Control': cacheControl
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

function serveStatic(req, res) {
    let pathname;
    try {
        pathname = new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
    } catch (e) {
        res.statusCode = 400;
        res.end('Bad request');
        return;
    }

    const requestedPath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
    const filePath = path.resolve(__dirname, requestedPath);
    if (!filePath.startsWith(`${__dirname}${path.sep}`)) {
        res.statusCode = 403;
        res.end('Forbidden');
        return;
    }

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
        const basename = path.basename(filePath);
        const cacheControl = ext === '.html' || basename === 'quality-snapshot.json'
            ? 'no-cache'
            : 'public, max-age=31536000, immutable';
        sendCompressed(req, res, content, mime, cacheControl);
    });
}

const server = http.createServer((req, res) => {
    if (req.url === '/api/tech-tree') {
        if (req.method === 'GET') {
            const json = JSON.stringify(techData);
            sendCompressed(req, res, Buffer.from(json), 'application/json', 'no-store');
            return;
        } else if (req.method === 'PUT') {
            if (READ_ONLY) {
                res.statusCode = 403;
                res.end('Read-only mode');
                return;
            }
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const data = JSON.parse(body);
                    if (!Array.isArray(data)) throw new Error('Invalid data');
                    techData = data;
                    saveData();
                    res.end('ok');
                } catch (e) {
                    res.statusCode = 400;
                    res.end('Invalid JSON');
                }
            });
            return;
        }
    }

    if (req.url === '/api/config' && req.method === 'GET') {
        const json = JSON.stringify({ readOnly: READ_ONLY });
        sendCompressed(req, res, Buffer.from(json), 'application/json', 'no-store');
        return;
    }

    serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'tech-tree.json');
const DATA_DIR = path.join(__dirname, 'data');

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
        res.setHeader('Content-Type', mime);
        res.end(content);
    });
}

const server = http.createServer((req, res) => {
    if (req.url === '/api/tech-tree') {
        if (req.method === 'GET') {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(techData));
            return;
        } else if (req.method === 'PUT') {
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

    serveStatic(req, res);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

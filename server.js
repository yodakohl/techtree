const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'tech-tree.json');

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
    let initial = [];
    try {
        initial = require('./tech-data.js');
    } catch (e) {
        console.error('Failed to load initial tech data:', e);
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
}

let techData = loadData();

function saveData() {
    fs.writeFileSync(DATA_FILE, JSON.stringify(techData, null, 2));
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

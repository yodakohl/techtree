// Render technologies in a simple SVG grid sorted by era and dependency level

document.addEventListener('DOMContentLoaded', async () => {
    let data = [];
    try {
        const resp = await fetch('/api/tech-tree');
        if (resp.ok) {
            data = await resp.json();
        } else {
            throw new Error('Failed to load tech tree');
        }
    } catch (err) {
        console.error('Error loading tech tree:', err);
        return;
    }

    // Build adjacency map and compute dependency levels
    const dependentsMap = {};
    const levelMap = {};
    data.forEach(t => {
        (t.prerequisites || []).forEach(pr => {
            if (!dependentsMap[pr]) dependentsMap[pr] = [];
            dependentsMap[pr].push(t.id);
        });
    });
    const queue = [];
    data.forEach(t => {
        if (!t.prerequisites || t.prerequisites.length === 0) {
            levelMap[t.id] = 0;
            queue.push(t.id);
        }
    });
    while (queue.length) {
        const current = queue.shift();
        const currentLevel = levelMap[current];
        (dependentsMap[current] || []).forEach(dep => {
            const nextLevel = currentLevel + 1;
            if (levelMap[dep] === undefined || nextLevel < levelMap[dep]) {
                levelMap[dep] = nextLevel;
                queue.push(dep);
            }
        });
    }
    data.forEach(t => {
        if (levelMap[t.id] === undefined) levelMap[t.id] = 0;
        t.level = levelMap[t.id];
    });

    const eraOrder = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const eraColors = {
        Ancient: '#e67e22',
        Classical: '#3498db',
        Medieval: '#2ecc71',
        Renaissance: '#9b59b6',
        Industrial: '#f1c40f',
        Modern: '#e74c3c',
        Future: '#95a5a6'
    };

    const nodeWidth = 120;
    const nodeHeight = 40;
    const xSpacing = 200;
    const ySpacing = 80;
    const margin = 40;

    const maxLevel = Math.max(...data.map(t => t.level), 0);
    const maxEraIndex = Math.max(...data.map(t => eraOrder[t.era] ?? 7), 0);

    const svg = document.getElementById('tech-svg');
    svg.setAttribute('width', margin * 2 + (maxEraIndex + 1) * xSpacing);
    svg.setAttribute('height', margin * 2 + (maxLevel + 1) * ySpacing);

    // Arrow head definition
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '10');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '6');
    marker.setAttribute('orient', 'auto');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', '#999');
    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);

    const linkGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(linkGroup);
    const nodeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    svg.appendChild(nodeGroup);

    const positions = {};
    data.forEach(t => {
        const eraIdx = eraOrder[t.era] ?? 7;
        const x = margin + eraIdx * xSpacing;
        const y = margin + t.level * ySpacing;
        positions[t.id] = { x, y };
    });

    // Draw links
    data.forEach(t => {
        (t.prerequisites || []).forEach(pr => {
            const src = positions[pr];
            const dst = positions[t.id];
            if (!src || !dst) return;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('class', 'tech-link');
            line.setAttribute('x1', src.x + nodeWidth / 2);
            line.setAttribute('y1', src.y + nodeHeight / 2);
            line.setAttribute('x2', dst.x + nodeWidth / 2);
            line.setAttribute('y2', dst.y + nodeHeight / 2);
            line.setAttribute('marker-end', 'url(#arrow)');
            linkGroup.appendChild(line);
        });
    });

    // Draw nodes
    data.forEach(t => {
        const pos = positions[t.id];
        const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        g.setAttribute('class', 'tech-node');
        g.setAttribute('transform', `translate(${pos.x},${pos.y})`);

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('width', nodeWidth);
        rect.setAttribute('height', nodeHeight);
        rect.setAttribute('rx', 6);
        rect.setAttribute('fill', eraColors[t.era] || '#cccccc');
        g.appendChild(rect);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', nodeWidth / 2);
        text.setAttribute('y', nodeHeight / 2);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('dominant-baseline', 'middle');
        text.textContent = t.name;
        g.appendChild(text);

        nodeGroup.appendChild(g);
    });
});


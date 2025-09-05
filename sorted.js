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

    // Build adjacency and compute levels for topological order
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

    data.sort((a, b) => {
        const eraDiff = (eraOrder[a.era] ?? 99) - (eraOrder[b.era] ?? 99);
        if (eraDiff !== 0) return eraDiff;
        const levelDiff = a.level - b.level;
        if (levelDiff !== 0) return levelDiff;
        return a.name.localeCompare(b.name);
    });

    const width = Math.max(1000, data.length * 40);
    const height = 400;
    const margin = 40;

    const eras = Array.from(new Set(data
        .map(d => d.era)
        .filter(e => e && eraOrder[e] !== undefined)))
        .sort((a, b) => eraOrder[a] - eraOrder[b]);
    const hasUnknown = data.some(d => !d.era || eraOrder[d.era] === undefined);
    if (hasUnknown) eras.push('Unknown');

    const yScale = d3.scalePoint()
        .domain(eras)
        .range([margin, height - margin]);
    const xScale = d3.scaleLinear()
        .domain([0, data.length - 1])
        .range([margin, width - margin]);
    const color = d3.scaleOrdinal()
        .domain(eras)
        .range(d3.schemeTableau10);

    const svg = d3.select('#sorted-svg')
        .attr('width', width)
        .attr('height', height);

    svg.append('g')
        .attr('transform', `translate(${margin},0)`)
        .call(d3.axisLeft(yScale));

    const nodes = svg.selectAll('g.node')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr('transform', (d, i) => `translate(${xScale(i)}, ${yScale(d.era || 'Unknown')})`);

    nodes.append('circle')
        .attr('r', 6)
        .attr('fill', d => color(d.era || 'Unknown'));

    nodes.append('text')
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .text(d => d.name);
});


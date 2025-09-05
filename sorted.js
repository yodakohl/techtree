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

    const tbody = document.querySelector('#tech-table tbody');
    data.forEach((t, idx) => {
        const tr = document.createElement('tr');
        const prereqText = (t.prerequisites || []).join(', ');
        tr.innerHTML = `<td>${idx + 1}</td><td>${t.name}</td><td>${t.era || ''}</td><td>${prereqText}</td>`;
        tbody.appendChild(tr);
    });
});


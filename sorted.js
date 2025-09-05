// Render a table of technologies sorted by era and dependency level

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

    // Sort technologies by era then dependency level
    data.sort((a, b) => {
        const eraCmp = (eraOrder[a.era] ?? 99) - (eraOrder[b.era] ?? 99);
        if (eraCmp !== 0) return eraCmp;
        const lvlCmp = a.level - b.level;
        if (lvlCmp !== 0) return lvlCmp;
        return a.name.localeCompare(b.name);
    });

    const tbody = document.querySelector('#sorted-table tbody');
    data.forEach(t => {
        const tr = document.createElement('tr');
        const eraTd = document.createElement('td');
        eraTd.textContent = t.era || '';
        tr.appendChild(eraTd);

        const lvlTd = document.createElement('td');
        lvlTd.textContent = t.level;
        tr.appendChild(lvlTd);

        const nameTd = document.createElement('td');
        nameTd.textContent = t.name;
        tr.appendChild(nameTd);

        const prereqTd = document.createElement('td');
        prereqTd.textContent = (t.prerequisites || []).join(', ');
        tr.appendChild(prereqTd);

        tbody.appendChild(tr);
    });
});


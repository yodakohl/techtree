// app.js with Vis.js

const DEFAULT_ROOT_LIMIT = 200;
const SEARCH_LIMIT = 50;

function normalizeQuery(value) {
    return (value || '').toString().trim();
}

document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('tech-tree-container');
    const techNameEl = document.getElementById('tech-name');
    const techEraEl = document.getElementById('tech-era');
    const techDescriptionEl = document.getElementById('tech-description');
    const techPrerequisitesEl = document.getElementById('tech-prerequisites');
    const editBtn = document.getElementById('edit-tech-btn');
    const deleteBtn = document.getElementById('delete-tech-btn');
    const updateBtn = document.getElementById('update-tech-btn');
    const addBtn = document.getElementById('add-tech-btn');
    const searchInput = document.getElementById('search-tech');
    const eraFilter = document.getElementById('era-filter');

    const techStore = new Map();
    const prereqMap = new Map();
    const dependentsMap = new Map();
    const dependentsCount = new Map();
    const edgeKeys = new Set();

    const eraColors = {
        Ancient: '#e67e22',
        Classical: '#3498db',
        Medieval: '#2ecc71',
        Renaissance: '#9b59b6',
        Industrial: '#f1c40f',
        Modern: '#e74c3c',
        Future: '#95a5a6'
    };

    function renderLegend() {
        const legend = document.getElementById('era-legend');
        if (!legend) return;
        legend.innerHTML = '';
        for (const [era, color] of Object.entries(eraColors)) {
            const item = document.createElement('div');
            item.className = 'legend-item';
            const swatch = document.createElement('span');
            swatch.className = 'legend-swatch';
            swatch.style.backgroundColor = color;
            const label = document.createElement('span');
            label.textContent = era;
            item.appendChild(swatch);
            item.appendChild(label);
            legend.appendChild(item);
        }
    }

    function populateEraFilter() {
        if (!eraFilter) return;
        eraFilter.innerHTML = '<option value="all">All Eras</option>';
        for (const era of Object.keys(eraColors)) {
            const opt = document.createElement('option');
            opt.value = era;
            opt.textContent = era;
            eraFilter.appendChild(opt);
        }
    }

    renderLegend();
    populateEraFilter();

    const nodes = new vis.DataSet();
    const edges = new vis.DataSet();

    const data = { nodes: nodes, edges: edges };

    const options = {
        layout: {
            improvedLayout: false
        },
        physics: {
            enabled: true,
            barnesHut: {
                springLength: 200,
                springConstant: 0.005,
                centralGravity: 0.1,
                avoidOverlap: 0.5
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        },
        nodes: {
            shape: 'box',
            margin: 10,
            scaling: {
                min: 16,
                max: 40,
                label: {
                    enabled: true,
                    min: 12,
                    max: 24
                }
            },
            font: {
                size: 12
            }
        },
        edges: {
            smooth: {
                type: 'continuous'
            }
        }
    };

    const network = new vis.Network(container, data, options);

    // Disable physics once the network stabilizes to prevent endless jiggle
    network.once('stabilizationIterationsDone', function () {
        network.setOptions({ physics: false });
    });

    // Fit once after initial draw so the layout sizes correctly
    network.once('afterDrawing', () => {
        network.fit();
    });

    // Refit on window resize
    window.addEventListener('resize', () => {
        if (network) {
            network.fit();
        }
    });

    const ERA_OFFSETS = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    function addEdge(from, to) {
        const key = `${from}->${to}`;
        if (edgeKeys.has(key)) return;
        edgeKeys.add(key);
        edges.add({
            id: key,
            from,
            to,
            arrows: 'to',
            color: { color: '#848484' },
            origColor: '#848484'
        });
    }

    function removeEdgesForNode(nodeId) {
        const connectedEdges = edges.get({
            filter: e => e.to === nodeId || e.from === nodeId
        });
        connectedEdges.forEach(e => {
            edgeKeys.delete(e.id);
            edges.remove(e.id);
        });
    }

    function ingestTechs(techs) {
        const added = [];

        techs.forEach(tech => {
            if (!tech || !tech.id) return;
            const existing = techStore.get(tech.id);
            if (!existing) {
                techStore.set(tech.id, tech);
                added.push(tech);
            } else {
                existing.name = tech.name;
                existing.era = tech.era;
                existing.description = tech.description;
                existing.prerequisites = tech.prerequisites || [];
            }

            const prereqs = tech.prerequisites || [];
            prereqMap.set(tech.id, prereqs);
            prereqs.forEach(pr => {
                const set = dependentsMap.get(pr) || new Set();
                if (!set.has(tech.id)) {
                    set.add(tech.id);
                    dependentsMap.set(pr, set);
                    const count = (dependentsCount.get(pr) || 0) + 1;
                    dependentsCount.set(pr, count);
                    if (nodes.get(pr)) {
                        nodes.update({ id: pr, value: count + 1 });
                    }
                }
            });

            const baseColor = eraColors[tech.era] || '#cccccc';
            const value = (dependentsCount.get(tech.id) || 0) + 1;
            if (!nodes.get(tech.id)) {
                nodes.add({
                    id: tech.id,
                    label: tech.name,
                    title: tech.description,
                    era: tech.era,
                    description: tech.description,
                    value,
                    color: baseColor,
                    origColor: baseColor
                });
            } else {
                nodes.update({
                    id: tech.id,
                    label: tech.name,
                    title: tech.description,
                    era: tech.era,
                    description: tech.description,
                    value,
                    color: baseColor,
                    origColor: baseColor
                });
            }
        });

        techs.forEach(tech => {
            if (!tech || !tech.id) return;
            const prereqs = tech.prerequisites || [];
            prereqs.forEach(prereqId => {
                if (nodes.get(prereqId)) {
                    addEdge(prereqId, tech.id);
                }
            });
        });

        return added;
    }

    function computeLevelMap() {
        const levelMap = new Map();
        const queue = [];

        techStore.forEach((tech, id) => {
            const prereqs = prereqMap.get(id) || [];
            const hasLoadedPrereq = prereqs.some(pr => techStore.has(pr));
            if (!hasLoadedPrereq) {
                levelMap.set(id, 0);
                queue.push(id);
            }
        });

        while (queue.length > 0) {
            const current = queue.shift();
            const currentLevel = levelMap.get(current) || 0;
            const dependents = dependentsMap.get(current) || new Set();
            dependents.forEach(dep => {
                if (!techStore.has(dep)) return;
                const nextLevel = currentLevel + 1;
                if (!levelMap.has(dep) || nextLevel < levelMap.get(dep)) {
                    levelMap.set(dep, nextLevel);
                    queue.push(dep);
                }
            });
        }

        techStore.forEach((_, id) => {
            if (!levelMap.has(id)) {
                levelMap.set(id, 0);
            }
        });

        return levelMap;
    }

    function applyLayout() {
        if (techStore.size === 0) return;

        const levelMap = computeLevelMap();
        const groups = new Map();

        levelMap.forEach((lvl, id) => {
            const tech = techStore.get(id);
            const adjusted = lvl + (ERA_OFFSETS[tech.era] || 0);
            const list = groups.get(adjusted) || [];
            list.push(id);
            groups.set(adjusted, list);
        });

        const radiusStep = 400;
        groups.forEach((ids, lvl) => {
            const radius = radiusStep * Number(lvl);
            ids.forEach((id, index) => {
                const angle = (2 * Math.PI / ids.length) * index;
                const x = radius * Math.cos(angle);
                const y = radius * Math.sin(angle);
                nodes.update({ id, x, y });
            });
        });

        const nonFutureLevels = [];
        techStore.forEach((tech, id) => {
            if (tech.era !== 'Future') {
                nonFutureLevels.push(levelMap.get(id) || 0);
            }
        });
        const maxNonFuture = nonFutureLevels.length ? Math.max(...nonFutureLevels) : null;

        techStore.forEach((tech, id) => {
            const updates = {};
            if (tech.era === 'Future') {
                updates.color = { background: '#dddddd', border: '#aaaaaa' };
                updates.font = { color: '#666666' };
                updates.origColor = updates.color;
            } else if (maxNonFuture !== null && (levelMap.get(id) || 0) === maxNonFuture) {
                updates.shadow = { enabled: true, color: 'rgba(255,215,0,0.8)', size: 20 };
                updates.borderWidth = 2;
            }
            if (Object.keys(updates).length > 0) {
                nodes.update({ id, ...updates });
            }
        });
    }

    async function fetchTechs(url) {
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error('Failed to load tech data');
        }
        return resp.json();
    }

    async function loadRoots() {
        try {
            const roots = await fetchTechs(`/api/tech-tree?roots=true&limit=${DEFAULT_ROOT_LIMIT}`);
            ingestTechs(roots);
            applyLayout();
        } catch (err) {
            console.error('Error loading tech tree:', err);
            alert('Failed to load tech tree from server.');
        }
    }

    async function loadNeighbors(nodeId) {
        try {
            const neighbors = await fetchTechs(`/api/tech-tree?neighbors=${encodeURIComponent(nodeId)}&depth=1`);
            const added = ingestTechs(neighbors);
            if (added.length > 0) {
                applyLayout();
                network.fit({ animation: false });
            }
        } catch (err) {
            console.error('Error loading neighbors:', err);
        }
    }

    await loadRoots();

    function highlightRelevantNodes(nodeId) {
        const connected = new Set([nodeId]);
        (prereqMap.get(nodeId) || []).forEach(id => connected.add(id));
        (dependentsMap.get(nodeId) || new Set()).forEach(id => connected.add(id));

        const nodeUpdates = [];
        nodes.forEach(n => {
            const base = n.origColor || n.color;
            const color = connected.has(n.id) ? base : '#dddddd';
            nodeUpdates.push({ id: n.id, color });
        });
        if (nodeUpdates.length) nodes.update(nodeUpdates);

        const edgeUpdates = [];
        edges.forEach(e => {
            const isConnected = connected.has(e.from) && connected.has(e.to);
            const base = e.origColor || (e.color && e.color.color) || e.color || '#848484';
            edgeUpdates.push({ id: e.id, color: { color: isConnected ? base : '#dddddd' } });
        });
        if (edgeUpdates.length) edges.update(edgeUpdates);
    }

    function resetHighlight() {
        const nodeUpdates = [];
        nodes.forEach(n => {
            if (n.origColor) {
                nodeUpdates.push({ id: n.id, color: n.origColor });
            }
        });
        if (nodeUpdates.length) nodes.update(nodeUpdates);

        const edgeUpdates = [];
        edges.forEach(e => {
            const base = e.origColor || (e.color && e.color.color) || '#848484';
            edgeUpdates.push({ id: e.id, color: { color: base } });
        });
        if (edgeUpdates.length) edges.update(edgeUpdates);
    }

    function highlightMatches(matchIds) {
        const matchSet = new Set(matchIds);
        const nodeUpdates = [];
        nodes.forEach(n => {
            const base = n.origColor || n.color;
            const color = matchSet.has(n.id) ? base : '#dddddd';
            nodeUpdates.push({ id: n.id, color });
        });
        if (nodeUpdates.length) nodes.update(nodeUpdates);
    }

    let searchTimeout = null;
    async function applySearch(query) {
        const normalized = normalizeQuery(query);
        if (!normalized) {
            resetHighlight();
            return;
        }
        if (normalized.length < 2) {
            resetHighlight();
            return;
        }

        try {
            const results = await fetchTechs(`/api/tech-tree?search=${encodeURIComponent(normalized)}&limit=${SEARCH_LIMIT}`);
            const added = ingestTechs(results);
            if (added.length > 0) {
                applyLayout();
            }
            highlightMatches(results.map(r => r.id));
            if (results.length === 1) {
                network.focus(results[0].id, { scale: 1.2, animation: true });
                loadNeighbors(results[0].id);
            }
        } catch (err) {
            console.error('Search failed:', err);
        }
    }

    function applyEraFilter(era) {
        const visible = new Set();
        const nodeUpdates = [];
        if (!era || era === 'all') {
            nodes.forEach(n => {
                nodeUpdates.push({ id: n.id, hidden: false });
                visible.add(n.id);
            });
        } else {
            nodes.forEach(n => {
                const isVisible = n.era === era;
                nodeUpdates.push({ id: n.id, hidden: !isVisible });
                if (isVisible) visible.add(n.id);
            });
        }
        if (nodeUpdates.length) nodes.update(nodeUpdates);

        const edgeUpdates = [];
        edges.forEach(e => {
            const isVisible = visible.has(e.from) && visible.has(e.to);
            edgeUpdates.push({ id: e.id, hidden: !isVisible });
        });
        if (edgeUpdates.length) edges.update(edgeUpdates);

        network.fit({ animation: false });
    }

    let selectedNodeId = null;
    network.on('selectNode', async function (params) {
        if (params.nodes.length > 0) {
            selectedNodeId = params.nodes[0];
            await loadNeighbors(selectedNodeId);
            const nodeData = nodes.get(selectedNodeId);
            const techData = techStore.get(selectedNodeId);

            techNameEl.textContent = nodeData.label;
            techEraEl.textContent = `Era: ${nodeData.era || 'N/A'}`;
            techDescriptionEl.textContent = nodeData.description || '';

            const prereqIds = techData ? techData.prerequisites || [] : [];
            if (prereqIds.length > 0) {
                const prereqNames = prereqIds
                    .map(id => techStore.get(id)?.name || id)
                    .join(', ');
                techPrerequisitesEl.textContent = `Prerequisites: ${prereqNames}`;
            } else {
                techPrerequisitesEl.textContent = 'Prerequisites: None';
            }

            editBtn.disabled = false;
            deleteBtn.disabled = false;

            highlightRelevantNodes(selectedNodeId);
        }
    });

    network.on('deselectNode', function () {
        selectedNodeId = null;
        techNameEl.textContent = '';
        techEraEl.textContent = '';
        techDescriptionEl.textContent = '';
        techPrerequisitesEl.textContent = '';
        editBtn.disabled = true;
        deleteBtn.disabled = true;
        resetHighlight();
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            searchTimeout = setTimeout(() => applySearch(searchInput.value), 250);
        });
    }

    if (eraFilter) {
        eraFilter.addEventListener('change', () => applyEraFilter(eraFilter.value));
    }

    async function createTech(tech) {
        const resp = await fetch('/api/tech-tree', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tech)
        });
        if (!resp.ok) {
            throw new Error('Failed to save tech');
        }
    }

    async function updateTech(tech) {
        const resp = await fetch('/api/tech-tree', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tech)
        });
        if (!resp.ok) {
            throw new Error('Failed to update tech');
        }
    }

    async function deleteTech(id) {
        const resp = await fetch(`/api/tech-tree?id=${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        if (!resp.ok) {
            throw new Error('Failed to delete tech');
        }
    }

    function clearForm() {
        document.getElementById('new-tech-id').value = '';
        document.getElementById('new-tech-name').value = '';
        document.getElementById('new-tech-era').value = '';
        document.getElementById('new-tech-description').value = '';
        document.getElementById('new-tech-prereq').value = '';
        document.getElementById('new-tech-id').disabled = false;
        updateBtn.style.display = 'none';
        addBtn.style.display = 'inline-block';
    }

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            const id = document.getElementById('new-tech-id').value.trim();
            const name = document.getElementById('new-tech-name').value.trim();
            const era = document.getElementById('new-tech-era').value.trim();
            const desc = document.getElementById('new-tech-description').value.trim();
            const prereqStr = document.getElementById('new-tech-prereq').value.trim();

            if (!id || !name) {
                alert('ID and Name are required.');
                return;
            }

            if (nodes.get(id)) {
                alert('A technology with this ID already exists.');
                return;
            }

            const prereqs = prereqStr ? prereqStr.split(',').map(p => p.trim()).filter(Boolean) : [];

            const newTech = { id, name, era, description: desc, prerequisites: prereqs };
            try {
                await createTech(newTech);
                ingestTechs([newTech]);
                applyLayout();
                clearForm();
                network.fit();
            } catch (e) {
                console.error('Failed to add tech:', e);
            }
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (!selectedNodeId) return;
            const tech = techStore.get(selectedNodeId);
            if (!tech) return;

            document.getElementById('new-tech-id').value = tech.id;
            document.getElementById('new-tech-name').value = tech.name;
            document.getElementById('new-tech-era').value = tech.era;
            document.getElementById('new-tech-description').value = tech.description;
            document.getElementById('new-tech-prereq').value = (tech.prerequisites || []).join(', ');
            document.getElementById('new-tech-id').disabled = true;
            addBtn.style.display = 'none';
            updateBtn.style.display = 'inline-block';
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            if (!selectedNodeId) return;
            const name = document.getElementById('new-tech-name').value.trim();
            const era = document.getElementById('new-tech-era').value.trim();
            const desc = document.getElementById('new-tech-description').value.trim();
            const prereqStr = document.getElementById('new-tech-prereq').value.trim();
            const prereqs = prereqStr ? prereqStr.split(',').map(p => p.trim()).filter(Boolean) : [];

            const tech = techStore.get(selectedNodeId);
            if (!tech) return;
            const oldPrereqs = prereqMap.get(selectedNodeId) || [];

            tech.name = name;
            tech.era = era;
            tech.description = desc;
            tech.prerequisites = prereqs;
            prereqMap.set(selectedNodeId, prereqs);

            oldPrereqs.forEach(pr => {
                const set = dependentsMap.get(pr);
                if (set && set.has(selectedNodeId)) {
                    set.delete(selectedNodeId);
                    const count = Math.max(0, (dependentsCount.get(pr) || 1) - 1);
                    dependentsCount.set(pr, count);
                    if (nodes.get(pr)) {
                        nodes.update({ id: pr, value: count + 1 });
                    }
                }
            });

            prereqs.forEach(pr => {
                const set = dependentsMap.get(pr) || new Set();
                if (!set.has(selectedNodeId)) {
                    set.add(selectedNodeId);
                    dependentsMap.set(pr, set);
                    const count = (dependentsCount.get(pr) || 0) + 1;
                    dependentsCount.set(pr, count);
                    if (nodes.get(pr)) {
                        nodes.update({ id: pr, value: count + 1 });
                    }
                }
            });

            nodes.update({ id: selectedNodeId, label: name, era, description: desc, title: desc });

            removeEdgesForNode(selectedNodeId);
            prereqs.forEach(pr => {
                if (nodes.get(pr)) {
                    addEdge(pr, selectedNodeId);
                }
            });
            techStore.forEach(t => {
                if ((t.prerequisites || []).includes(selectedNodeId)) {
                    addEdge(selectedNodeId, t.id);
                }
            });

            try {
                await updateTech(tech);
                applyLayout();
                clearForm();
                network.fit();
            } catch (e) {
                console.error('Failed to update tech:', e);
            }
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (!selectedNodeId) return;

            try {
                await deleteTech(selectedNodeId);
            } catch (e) {
                console.error('Failed to delete tech:', e);
                return;
            }

            removeEdgesForNode(selectedNodeId);

            const prereqs = prereqMap.get(selectedNodeId) || [];
            prereqs.forEach(pr => {
                const set = dependentsMap.get(pr);
                if (set) {
                    set.delete(selectedNodeId);
                    const count = Math.max(0, (dependentsCount.get(pr) || 1) - 1);
                    dependentsCount.set(pr, count);
                    if (nodes.get(pr)) {
                        nodes.update({ id: pr, value: count + 1 });
                    }
                }
            });
            dependentsMap.delete(selectedNodeId);
            prereqMap.delete(selectedNodeId);
            dependentsCount.delete(selectedNodeId);

            techStore.forEach(t => {
                t.prerequisites = (t.prerequisites || []).filter(p => p !== selectedNodeId);
            });

            nodes.remove({ id: selectedNodeId });
            techStore.delete(selectedNodeId);

            techNameEl.textContent = '';
            techEraEl.textContent = '';
            techDescriptionEl.textContent = '';
            techPrerequisitesEl.textContent = '';
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            selectedNodeId = null;
            clearForm();
            applyLayout();
            network.fit();
        });
    }
});

// app.js with Vis.js
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

    let dynamicData = [];
    try {
        const resp = await fetch('/api/tech-tree');
        if (resp.ok) {
            dynamicData = await resp.json();
        } else {
            throw new Error('Failed to load tech tree');
        }
    } catch (err) {
        console.error('Error loading tech tree:', err);
        alert('Failed to load tech tree from server.');
        return;
    }

    // Calculate how many technologies depend on each tech to scale node size
    const dependentsCount = {};
    dynamicData.forEach(t => dependentsCount[t.id] = 0);
    dynamicData.forEach(t => {
        if (t.prerequisites) {
            t.prerequisites.forEach(p => {
                if (dependentsCount[p] === undefined) dependentsCount[p] = 0;
                dependentsCount[p] += 1;
            });
        }
    });

    const eraColors = {
        Ancient: '#e67e22',
        Classical: '#3498db',
        Medieval: '#2ecc71',
        Renaissance: '#9b59b6',
        Industrial: '#f1c40f',
        Modern: '#e74c3c',
        Future: '#95a5a6'
    };

    // Compute radial layout levels using an adjacency list for efficiency
    const levelMap = {};
    const dependentsMap = {};
    const prereqMap = {};
    dynamicData.forEach(t => {
        prereqMap[t.id] = t.prerequisites || [];
        (t.prerequisites || []).forEach(pr => {
            if (!dependentsMap[pr]) dependentsMap[pr] = [];
            dependentsMap[pr].push(t.id);
        });
    });

    const queue = [];
    dynamicData.forEach(t => {
        if (!t.prerequisites || t.prerequisites.length === 0) {
            levelMap[t.id] = 0;
            queue.push(t.id);
        }
    });

    while (queue.length > 0) {
        const current = queue.shift();
        const currentLevel = levelMap[current];
        const dependents = dependentsMap[current] || [];
        dependents.forEach(dep => {
            const nextLevel = currentLevel + 1;
            if (levelMap[dep] === undefined || nextLevel < levelMap[dep]) {
                levelMap[dep] = nextLevel;
                queue.push(dep);
            }
        });
    }

    // Any nodes involved in cycles may not have been assigned a level.
    // Default them to 0 so the layout still renders.
    dynamicData.forEach(t => {
        if (levelMap[t.id] === undefined) {
            levelMap[t.id] = 0;
        }
    });

    // Build node dataset now that levels are known
    const nodes = new vis.DataSet(
        dynamicData.map(tech => {
            const baseColor = eraColors[tech.era] || '#cccccc';
            return {
                id: tech.id,
                label: tech.name,
                title: tech.description, // Tooltip
                era: tech.era, // Store custom data
                description: tech.description,
                value: (dependentsCount[tech.id] || 0) + 1,
                color: baseColor,
                origColor: baseColor
            };
        })
    );

    // Edges use longer lengths for deeper technologies to spread the tree
    const edges = new vis.DataSet();
    dynamicData.forEach(tech => {
        if (tech.prerequisites && tech.prerequisites.length > 0) {
            tech.prerequisites.forEach(prereqId => {
                const level = levelMap[tech.id] || 0;
                const length = 200 + level * 50;
                edges.add({ from: prereqId, to: tech.id, arrows: 'to', length });
            });
        }
    });
    // Store original edge colors for later highlighting
    edges.forEach(e => {
        const base = e.color && typeof e.color === 'object' ? (e.color.color || '#848484') : (e.color || '#848484');
        edges.update({ id: e.id, origColor: base });
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

    const groups = {};
    dynamicData.forEach(t => {
        const lvl = (levelMap[t.id] || 0) + (ERA_OFFSETS[t.era] || 0);
        if (!groups[lvl]) groups[lvl] = [];
        groups[lvl].push(t.id);
    });

    // Increase spacing between levels for a less cramped layout
    const radiusStep = 400;
    Object.entries(groups).forEach(([lvl, ids]) => {
        const radius = radiusStep * parseInt(lvl, 10);
        ids.forEach((id, index) => {
            const angle = (2 * Math.PI / ids.length) * index;
            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            nodes.update({ id, x, y });
        });
    });

    // Determine the newest non-Future technologies for glow effect
    const maxNonFuture = Math.max(
        ...dynamicData
            .filter(t => t.era !== 'Future')
            .map(t => levelMap[t.id] || 0)
    );

    dynamicData.forEach(t => {
        const update = {};
        if (t.era === 'Future') {
            update.color = { background: '#dddddd', border: '#aaaaaa' };
            update.font = { color: '#666666' };
        } else if ((levelMap[t.id] || 0) === maxNonFuture) {
            update.shadow = { enabled: true, color: 'rgba(255,215,0,0.8)', size: 20 };
            update.borderWidth = 2;
        }
        if (Object.keys(update).length > 0) {
            nodes.update({ id: t.id, ...update });
        }
    });

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

    function highlightRelevantNodes(nodeId) {
        const connected = new Set([nodeId]);
        (prereqMap[nodeId] || []).forEach(id => connected.add(id));
        (dependentsMap[nodeId] || []).forEach(id => connected.add(id));

        nodes.forEach(n => {
            const base = n.origColor || n.color;
            const color = connected.has(n.id) ? base : '#dddddd';
            nodes.update({ id: n.id, color });
        });

        edges.forEach(e => {
            const isConnected = connected.has(e.from) && connected.has(e.to);
            const base = e.origColor || (e.color && e.color.color) || e.color || '#848484';
            edges.update({ id: e.id, color: { color: isConnected ? base : '#dddddd' } });
        });
    }

    function resetHighlight() {
        nodes.forEach(n => {
            if (n.origColor) {
                nodes.update({ id: n.id, color: n.origColor });
            }
        });
        edges.forEach(e => {
            const base = e.origColor || (e.color && e.color.color) || '#848484';
            edges.update({ id: e.id, color: { color: base } });
        });
    }


    let selectedNodeId = null;
    network.on("selectNode", function (params) {
        if (params.nodes.length > 0) {
            selectedNodeId = params.nodes[0];
            const nodeData = nodes.get(selectedNodeId);

            techNameEl.textContent = nodeData.label;
            techEraEl.textContent = `Era: ${nodeData.era || 'N/A'}`;
            techDescriptionEl.textContent = nodeData.description;

            const prereqIds = dynamicData.find(t => t.id === selectedNodeId).prerequisites;
            if (prereqIds && prereqIds.length > 0) {
                const prereqNames = prereqIds.map(id => nodes.get(id).label).join(', ');
                techPrerequisitesEl.textContent = `Prerequisites: ${prereqNames}`;
            } else {
                techPrerequisitesEl.textContent = "Prerequisites: None";
            }

            editBtn.disabled = false;
            deleteBtn.disabled = false;

            highlightRelevantNodes(selectedNodeId);
        }
    });

    network.on("deselectNode", function () {
        selectedNodeId = null;
        techNameEl.textContent = '';
        techEraEl.textContent = '';
        techDescriptionEl.textContent = '';
        techPrerequisitesEl.textContent = '';
        editBtn.disabled = true;
        deleteBtn.disabled = true;
        resetHighlight();
    });


    async function saveData() {
        try {
            await fetch('/api/tech-tree', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dynamicData)
            });
        } catch (e) {
            console.error('Failed to save tech tree:', e);
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
        addBtn.addEventListener('click', () => {
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
            dynamicData.push(newTech);
            prereqMap[id] = prereqs;
            prereqs.forEach(pr => {
                if (!dependentsMap[pr]) dependentsMap[pr] = [];
                dependentsMap[pr].push(id);
            });

            nodes.add({ id, label: name, title: desc, era, description: desc });
            prereqs.forEach(pr => {
                if (nodes.get(pr)) {
                    edges.add({ from: pr, to: id, arrows: 'to' });
                }
            });

            saveData();
            clearForm();
            network.fit();
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (!selectedNodeId) return;
            const tech = dynamicData.find(t => t.id === selectedNodeId);
            if (!tech) return;

            document.getElementById('new-tech-id').value = tech.id;
            document.getElementById('new-tech-name').value = tech.name;
            document.getElementById('new-tech-era').value = tech.era;
            document.getElementById('new-tech-description').value = tech.description;
            document.getElementById('new-tech-prereq').value = tech.prerequisites.join(', ');
            document.getElementById('new-tech-id').disabled = true;
            addBtn.style.display = 'none';
            updateBtn.style.display = 'inline-block';
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener('click', () => {
            if (!selectedNodeId) return;
            const name = document.getElementById('new-tech-name').value.trim();
            const era = document.getElementById('new-tech-era').value.trim();
            const desc = document.getElementById('new-tech-description').value.trim();
            const prereqStr = document.getElementById('new-tech-prereq').value.trim();
            const prereqs = prereqStr ? prereqStr.split(',').map(p => p.trim()).filter(Boolean) : [];

            const techIndex = dynamicData.findIndex(t => t.id === selectedNodeId);
            if (techIndex === -1) return;
            const tech = dynamicData[techIndex];
            const oldPrereqs = prereqMap[selectedNodeId] || [];
            tech.name = name;
            tech.era = era;
            tech.description = desc;
            tech.prerequisites = prereqs;
            prereqMap[selectedNodeId] = prereqs;
            oldPrereqs.forEach(pr => {
                dependentsMap[pr] = (dependentsMap[pr] || []).filter(d => d !== selectedNodeId);
            });
            prereqs.forEach(pr => {
                if (!dependentsMap[pr]) dependentsMap[pr] = [];
                if (!dependentsMap[pr].includes(selectedNodeId)) dependentsMap[pr].push(selectedNodeId);
            });

            nodes.update({ id: selectedNodeId, label: name, era, description: desc, title: desc });

            // Remove old edges
            edges.get({ filter: e => e.to === selectedNodeId || e.from === selectedNodeId }).forEach(e => edges.remove(e.id));
            // Re-add edges for this node
            prereqs.forEach(pr => {
                if (nodes.get(pr)) {
                    edges.add({ from: pr, to: selectedNodeId, arrows: 'to' });
                }
            });
            // Reconnect edges from this node to its dependents
            dynamicData.forEach(t => {
                if (t.prerequisites.includes(selectedNodeId)) {
                    edges.add({ from: selectedNodeId, to: t.id, arrows: 'to' });
                }
            });
            oldPrereqs.forEach(pr => {
                dependentsMap[pr] = (dependentsMap[pr] || []).filter(d => d !== selectedNodeId);
            });
            prereqs.forEach(pr => {
                if (!dependentsMap[pr]) dependentsMap[pr] = [];
                if (!dependentsMap[pr].includes(selectedNodeId)) dependentsMap[pr].push(selectedNodeId);
            });

            saveData();
            clearForm();
            network.fit();
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (!selectedNodeId) return;

            // Remove edges connected to the node
            edges.get({ filter: e => e.to === selectedNodeId || e.from === selectedNodeId }).forEach(e => edges.remove(e.id));

            // Remove from other tech prerequisites
            dynamicData.forEach(t => {
                t.prerequisites = t.prerequisites.filter(p => p !== selectedNodeId);
            });
            if (dependentsMap[selectedNodeId]) {
                dependentsMap[selectedNodeId].forEach(dep => {
                    prereqMap[dep] = (prereqMap[dep] || []).filter(p => p !== selectedNodeId);
                });
                delete dependentsMap[selectedNodeId];
            }
            delete prereqMap[selectedNodeId];

            nodes.remove({ id: selectedNodeId });
            dynamicData = dynamicData.filter(t => t.id !== selectedNodeId);

            saveData();
            techNameEl.textContent = '';
            techEraEl.textContent = '';
            techDescriptionEl.textContent = '';
            techPrerequisitesEl.textContent = '';
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            selectedNodeId = null;
            clearForm();
            network.fit();
        });
    }
});

// app.js with Vis.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-tree-container');
    const techNameEl = document.getElementById('tech-name');
    const techEraEl = document.getElementById('tech-era');
    const techDescriptionEl = document.getElementById('tech-description');
    const techPrerequisitesEl = document.getElementById('tech-prerequisites');
    const editBtn = document.getElementById('edit-tech-btn');
    const deleteBtn = document.getElementById('delete-tech-btn');
    const updateBtn = document.getElementById('update-tech-btn');
    const addBtn = document.getElementById('add-tech-btn');

    if (typeof techTreeData === 'undefined' || !techTreeData || techTreeData.length === 0) {
        console.error("Error: techTreeData is not defined, is null, or is empty. Make sure tech-data.js is loaded correctly and contains the tech tree data array.");
        alert("Tech tree data is missing or empty. The tech tree cannot be displayed. Please ensure 'tech-data.js' is correctly set up.");
        return;
    }

    const stored = localStorage.getItem('techTreeData');
    let dynamicData = stored ? JSON.parse(stored) : techTreeData.slice();
    if (!stored) {
        localStorage.setItem('techTreeData', JSON.stringify(dynamicData));
    }

    // 1. Transform dynamicData into Vis.js nodes and edges
    const nodes = new vis.DataSet(
        dynamicData.map(tech => ({
            id: tech.id,
            label: tech.name,
            title: tech.description, // Tooltip
            era: tech.era, // Store custom data
            description: tech.description
        }))
    );

    const edges = new vis.DataSet();
    dynamicData.forEach(tech => {
        if (tech.prerequisites && tech.prerequisites.length > 0) {
            tech.prerequisites.forEach(prereqId => {
                edges.add({ from: prereqId, to: tech.id, arrows: 'to' });
            });
        }
    });

    const data = { nodes: nodes, edges: edges };

    const options = {
        layout: {
            hierarchical: {
                direction: "LR", // Left to Right
                sortMethod: "directed", // Follows the edges
                levelSeparation: 200,
                nodeSpacing: 150,
            }
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        },
        physics: { // Disable physics if using hierarchical layout for stability
            enabled: false
        },
        nodes: {
            shape: 'box',
            margin: 10,
            font: {
                size: 12
            }
        },
        edges: {
            smooth: {
                type: 'cubicBezier',
                forceDirection: 'horizontal',
                roundness: 0.4
            }
        }
    };

    const network = new vis.Network(container, data, options);

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
        }
    });

    function saveData() {
        localStorage.setItem('techTreeData', JSON.stringify(dynamicData));
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
            tech.name = name;
            tech.era = era;
            tech.description = desc;
            tech.prerequisites = prereqs;

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

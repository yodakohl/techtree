// app.js with Vis.js
document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('tech-tree-container');
    const techNameEl = document.getElementById('tech-name');
    const techEraEl = document.getElementById('tech-era');
    const techDescriptionEl = document.getElementById('tech-description');
    const techPrerequisitesEl = document.getElementById('tech-prerequisites');

    // Check if techTreeData is defined
    if (typeof techTreeData === 'undefined' || !techTreeData || techTreeData.length === 0) {
        console.error("Error: techTreeData is not defined, is null, or is empty. Make sure tech-data.js is loaded correctly and contains the tech tree data array.");
        alert("Tech tree data is missing or empty. The tech tree cannot be displayed. Please ensure 'tech-data.js' is correctly set up.");
        return; // Stop further execution
    }

    // 1. Transform techTreeData into Vis.js nodes and edges
    const nodes = new vis.DataSet(
        techTreeData.map(tech => ({
            id: tech.id,
            label: tech.name,
            title: tech.description, // Tooltip
            era: tech.era, // Store custom data
            description: tech.description
        }))
    );

    const edges = new vis.DataSet();
    techTreeData.forEach(tech => {
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

    // 1a. Fit the network to the view
    network.fit();

    // Refit on window resize
    window.addEventListener('resize', () => {
        if (network) {
            network.fit();
        }
    });


    // 2. Handle node selection
    network.on("selectNode", function (params) {
        if (params.nodes.length > 0) {
            const selectedNodeId = params.nodes[0];
            const nodeData = nodes.get(selectedNodeId); // Get data from Vis.js DataSet

            techNameEl.textContent = nodeData.label;
            techEraEl.textContent = `Era: ${nodeData.era || 'N/A'}`;
            techDescriptionEl.textContent = nodeData.description;

            const prereqIds = techTreeData.find(t => t.id === selectedNodeId).prerequisites;
            if (prereqIds && prereqIds.length > 0) {
                const prereqNames = prereqIds.map(id => nodes.get(id).label).join(', ');
                techPrerequisitesEl.textContent = `Prerequisites: ${prereqNames}`;
            } else {
                techPrerequisitesEl.textContent = "Prerequisites: None";
            }
        }
    });
});

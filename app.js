// app.js with Vis.js
document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('tech-tree-container');
    const techNameEl = document.getElementById('tech-name');
    const techEraEl = document.getElementById('tech-era');
    const techDescriptionEl = document.getElementById('tech-description');
    const techPrerequisitesEl = document.getElementById('tech-prerequisites');
    const techInfoPanel = document.getElementById('tech-info-panel');
    const editBtn = document.getElementById('edit-tech-btn');
    const deleteBtn = document.getElementById('delete-tech-btn');
    const updateBtn = document.getElementById('update-tech-btn');
    const addBtn = document.getElementById('add-tech-btn');
    const searchInput = document.getElementById('search-tech');
    const eraFilter = document.getElementById('era-filter');
    const fieldFilter = document.getElementById('field-filter');
    const focusRelevantInput = document.getElementById('focus-relevant');
    const graphContextSummaryEl = document.getElementById('graph-context-summary');
    const relationshipsEl = document.getElementById('tech-relationships');
    const prereqListEl = document.getElementById('tech-prereq-list');
    const unlocksListEl = document.getElementById('tech-unlocks-list');
    const addPanel = document.getElementById('tech-add-panel');
    const techMetadataEl = document.createElement('div');
    techMetadataEl.className = 'tech-metadata';
    techMetadataEl.hidden = true;
    if (techInfoPanel && techPrerequisitesEl) {
        techInfoPanel.insertBefore(techMetadataEl, techPrerequisitesEl.nextSibling);
    }

    let appConfig = { readOnly: false };
    let dynamicData = [];
    try {
        const [configResult, resp] = await Promise.all([
            fetch('api/config')
                .then(configResp => configResp.ok ? configResp.json() : appConfig)
                .catch(() => appConfig),
            fetch('api/tech-tree')
        ]);
        appConfig = configResult;
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

    function getDependencyEdges(tech) {
        if (Array.isArray(tech.dependencyEdges)) return tech.dependencyEdges;
        return (tech.prerequisites || []).map(prerequisite => ({
            prerequisite,
            type: 'enabling',
            confidence: 0.5,
            evidence_level: 'weak_inference',
            note: 'Legacy prerequisite edge.'
        }));
    }

    function getPrerequisiteIds(tech) {
        return getDependencyEdges(tech).map(edge => edge.prerequisite);
    }

    function edgeColor(type) {
        return {
            required: '#2f6fbb',
            enabling: '#8d99a6',
            accelerates: '#6a9f58',
            historical_predecessor: '#9b6a3d',
            common_dependency: '#9aa5af',
            commercial_or_scaling_dependency: '#b7791f',
            speculative: '#8a63b0'
        }[type] || '#9aa5af';
    }

    const eraDefaultDates = {
        Ancient: { firstKnownDate: -10000, datePrecision: 'millennium', region: 'Global / multiple regions' },
        Classical: { firstKnownDate: -500, datePrecision: 'century', region: 'Global / multiple regions' },
        Medieval: { firstKnownDate: 500, datePrecision: 'century', region: 'Global / multiple regions' },
        Renaissance: { firstKnownDate: 1400, datePrecision: 'century', region: 'Global / multiple regions' },
        Industrial: { firstKnownDate: 1760, datePrecision: 'decade', region: 'Global / multiple regions' },
        Modern: { firstKnownDate: 1945, datePrecision: 'decade', region: 'Global / multiple regions' },
        Future: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / not yet broadly established' }
    };

    function createDefaultDependencyEdge(prerequisite) {
        return {
            prerequisite,
            type: 'enabling',
            confidence: 0.5,
            evidence_level: 'weak_inference',
            note: 'User-entered dependency; semantic review required.',
            reviewStatus: 'generated'
        };
    }

    function applyDefaultMetadata(tech) {
        const defaults = eraDefaultDates[tech.era] || eraDefaultDates.Modern;
        tech.firstKnownDate = tech.firstKnownDate ?? defaults.firstKnownDate;
        tech.datePrecision = tech.datePrecision || defaults.datePrecision;
        tech.region = tech.region || defaults.region;
        tech.reviewStatus = tech.reviewStatus || 'generated';
        tech.dependencyEdges = (tech.prerequisites || []).map(createDefaultDependencyEdge);
        return tech;
    }

    // Calculate how many technologies depend on each tech to scale node size
    const dependentsCount = {};
    dynamicData.forEach(t => dependentsCount[t.id] = 0);
    dynamicData.forEach(t => {
        getPrerequisiteIds(t).forEach(p => {
            if (dependentsCount[p] === undefined) dependentsCount[p] = 0;
            dependentsCount[p] += 1;
        });
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

    function populateFieldFilter() {
        if (!fieldFilter) return;
        const fields = [...new Set(dynamicData.flatMap(tech => Array.isArray(tech.fields) ? tech.fields : []))]
            .sort((a, b) => a.localeCompare(b));
        fieldFilter.innerHTML = '<option value="all">All Fields</option>';
        for (const field of fields) {
            const opt = document.createElement('option');
            opt.value = field;
            opt.textContent = field;
            fieldFilter.appendChild(opt);
        }
    }

    renderLegend();
    populateEraFilter();
    populateFieldFilter();

    if (appConfig.readOnly) {
        if (addPanel) addPanel.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
    }

    // Compute radial layout levels using an adjacency list for efficiency
    const levelMap = {};
    const dependentsMap = {};
    const prereqMap = {};
    dynamicData.forEach(t => {
        prereqMap[t.id] = getPrerequisiteIds(t);
        getPrerequisiteIds(t).forEach(pr => {
            if (!dependentsMap[pr]) dependentsMap[pr] = [];
            dependentsMap[pr].push(t.id);
        });
    });

    const queue = [];
    dynamicData.forEach(t => {
        if (getPrerequisiteIds(t).length === 0) {
            levelMap[t.id] = 0;
            queue.push(t.id);
        }
    });

    for (let queueIndex = 0; queueIndex < queue.length; queueIndex += 1) {
        const current = queue[queueIndex];
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

    const ERA_OFFSETS = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const nodesById = {};
    dynamicData.forEach(t => {
        nodesById[t.id] = t;
    });

    const groups = {};
    dynamicData.forEach(t => {
        const lvl = (levelMap[t.id] || 0) + (ERA_OFFSETS[t.era] || 0) * 2;
        if (!groups[lvl]) groups[lvl] = [];
        groups[lvl].push(t.id);
    });

    const positions = {};
    const xStep = 300;
    const yStep = 76;
    Object.entries(groups).forEach(([lvl, ids]) => {
        ids.sort((a, b) => nodesById[a].name.localeCompare(nodesById[b].name));
        const x = xStep * parseInt(lvl, 10);
        const yStart = -((ids.length - 1) * yStep) / 2;
        ids.forEach((id, index) => {
            positions[id] = { x, y: yStart + index * yStep };
        });
    });

    // Determine the newest non-Future technologies for glow effect
    const maxNonFuture = Math.max(
        ...dynamicData
            .filter(t => t.era !== 'Future')
            .map(t => levelMap[t.id] || 0)
    );

    const nodeItems = dynamicData.map(tech => {
        const baseColor = eraColors[tech.era] || '#cccccc';
        const position = positions[tech.id] || { x: 0, y: 0 };
        const node = {
            id: tech.id,
            label: tech.name,
            title: tech.description,
            era: tech.era,
            description: tech.description,
            value: Math.min((dependentsCount[tech.id] || 0) + 1, 12),
            color: baseColor,
            origColor: baseColor,
            borderWidth: 1,
            origBorderWidth: 1,
            origX: position.x,
            origY: position.y,
            x: position.x,
            y: position.y
        };
        if (tech.era === 'Future') {
            node.color = { background: '#dddddd', border: '#aaaaaa' };
            node.origColor = node.color;
            node.font = { color: '#666666' };
        } else if ((levelMap[tech.id] || 0) === maxNonFuture) {
            node.borderWidth = 2;
            node.origBorderWidth = 2;
        }
        return node;
    });

    const edgeItems = [];
    dynamicData.forEach(tech => {
        getDependencyEdges(tech).forEach(edge => {
            const prereqId = edge.prerequisite;
            const type = edge.type || 'enabling';
            const confidence = typeof edge.confidence === 'number' ? edge.confidence : 0.5;
            edgeItems.push({
                from: prereqId,
                to: tech.id,
                arrows: 'to',
                color: { color: edgeColor(type) },
                origColor: edgeColor(type),
                width: type === 'required' ? 2 : 1,
                dashes: type === 'speculative' || type === 'common_dependency',
                title: `${type.replaceAll('_', ' ')} · ${Math.round(confidence * 100)}% confidence · ${edge.evidence_level || 'unknown'}\n${edge.note || ''}`
            });
        });
    });

    const nodes = new vis.DataSet(nodeItems);
    const edges = new vis.DataSet(edgeItems);

    const data = { nodes: nodes, edges: edges };

    const options = {
        layout: {
            improvedLayout: false
        },
        physics: {
            enabled: false
        },
        interaction: {
            dragNodes: true,
            dragView: true,
            zoomView: true
        },
        nodes: {
            shape: 'box',
            margin: 7,
            widthConstraint: {
                maximum: 170
            },
            scaling: {
                min: 16,
                max: 30,
                label: {
                    enabled: true,
                    min: 10,
                    max: 18
                }
            },
            font: {
                size: 11
            }
        },
        edges: {
            smooth: false
        }
    };

    const network = new vis.Network(container, data, options);

    // Fit once after initial draw so the layout sizes correctly
    network.once('afterDrawing', () => {
        network.fit();
    });


    // Refit on window resize
    let resizeTimer = null;
    window.addEventListener('resize', () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => network.fit({ animation: false }), 120);
    });

    let selectedNodeId = null;
    let currentSearchQuery = '';
    let currentEraFilter = 'all';
    let currentFieldFilter = 'all';

    function existingIds(ids) {
        return ids.filter(id => Boolean(nodes.get(id)));
    }

    function getOneHopContext(ids) {
        const context = new Set();
        ids.forEach(id => {
            if (!nodes.get(id)) return;
            context.add(id);
            existingIds(prereqMap[id] || []).forEach(prereqId => context.add(prereqId));
            existingIds(dependentsMap[id] || []).forEach(depId => context.add(depId));
        });
        return context;
    }

    function sortedTechIds(ids) {
        return existingIds([...new Set(ids)])
            .sort((a, b) => formatTechLabel(a).localeCompare(formatTechLabel(b)));
    }

    function assignPackedColumn(positionsMap, ids, baseX, direction) {
        const orderedIds = sortedTechIds(ids);
        if (!orderedIds.length) return;
        const rowCount = Math.min(7, Math.ceil(Math.sqrt(orderedIds.length) * 1.2));
        const xStep = 158;
        const yStep = 48;
        orderedIds.forEach((id, index) => {
            const col = Math.floor(index / rowCount);
            const row = index % rowCount;
            positionsMap.set(id, {
                x: baseX + (direction * col * xStep),
                y: (row - (Math.min(rowCount, orderedIds.length) - 1) / 2) * yStep
            });
        });
    }

    function createCompactPositions(matchIds) {
        const positionsMap = new Map();
        const matches = sortedTechIds(matchIds);
        const centerIds = selectedNodeId ? [selectedNodeId] : matches;
        const centerSet = new Set(centerIds);
        const prereqIds = new Set();
        const unlockIds = new Set();

        centerIds.forEach(id => {
            existingIds(prereqMap[id] || []).forEach(prereqId => {
                if (!centerSet.has(prereqId)) prereqIds.add(prereqId);
            });
            existingIds(dependentsMap[id] || []).forEach(depId => {
                if (!centerSet.has(depId)) unlockIds.add(depId);
            });
        });

        const orderedCenterIds = sortedTechIds(centerIds);
        const centerRows = Math.min(7, Math.max(1, Math.ceil(Math.sqrt(orderedCenterIds.length))));
        orderedCenterIds.forEach((id, index) => {
            const col = Math.floor(index / centerRows);
            const row = index % centerRows;
            positionsMap.set(id, {
                x: col * 158,
                y: (row - (Math.min(centerRows, orderedCenterIds.length) - 1) / 2) * 52
            });
        });

        assignPackedColumn(positionsMap, [...prereqIds], -200, -1);
        assignPackedColumn(positionsMap, [...unlockIds], 200 + Math.max(0, Math.ceil(orderedCenterIds.length / centerRows) - 1) * 158, 1);

        return positionsMap;
    }

    function getSearchMatches(query) {
        const lower = query.trim().toLowerCase();
        if (!lower) return new Set();
        return new Set(dynamicData
            .filter(t => {
                const text = `${t.name} ${t.id} ${t.description || ''}`.toLowerCase();
                return text.includes(lower);
            })
            .map(t => t.id));
    }

    function getFieldMatches(field) {
        if (!field || field === 'all') return new Set();
        return new Set(dynamicData
            .filter(t => Array.isArray(t.fields) && t.fields.includes(field))
            .map(t => t.id));
    }

    function intersectSets(primary, secondary) {
        if (!secondary || secondary.size === 0) return new Set(primary);
        return new Set([...primary].filter(id => secondary.has(id)));
    }

    function formatTechLabel(id) {
        return nodes.get(id)?.label || nodesById[id]?.name || id;
    }

    function createRelationshipChip(id) {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'relationship-chip';
        chip.textContent = formatTechLabel(id);
        chip.addEventListener('click', () => selectTechnology(id));
        return chip;
    }

    function renderRelationshipList(containerEl, ids) {
        if (!containerEl) return;
        containerEl.innerHTML = '';
        const visibleIds = existingIds(ids);
        if (!visibleIds.length) {
            const empty = document.createElement('span');
            empty.className = 'relationship-empty';
            empty.textContent = 'None';
            containerEl.appendChild(empty);
            return;
        }
        visibleIds
            .sort((a, b) => formatTechLabel(a).localeCompare(formatTechLabel(b)))
            .forEach(id => containerEl.appendChild(createRelationshipChip(id)));
    }

    function appendMetadataValue(labelText, valueText) {
        const row = document.createElement('p');
        const label = document.createElement('strong');
        label.textContent = `${labelText}: `;
        row.appendChild(label);
        row.appendChild(document.createTextNode(valueText));
        techMetadataEl.appendChild(row);
    }

    function renderTechMetadata(tech) {
        techMetadataEl.replaceChildren();
        if (!tech) {
            techMetadataEl.hidden = true;
            return;
        }

        if (Array.isArray(tech.fields) && tech.fields.length) {
            appendMetadataValue('Field', tech.fields.join(', '));
        }
        if (tech.maturity) {
            appendMetadataValue('Maturity', tech.maturity);
        }
        if (tech.firstKnownDate !== undefined) {
            appendMetadataValue('First known', `${tech.firstKnownDate} (${tech.datePrecision || 'unknown'}; ${tech.region || 'region unknown'})`);
        }
        if (tech.reviewStatus) {
            appendMetadataValue('Review', tech.reviewStatus.replaceAll('_', ' '));
        }
        if (tech.roadmap) {
            appendMetadataValue('Roadmap', `${tech.roadmap.role || 'forecast'} · ${tech.roadmap.timeframe || 'unknown'} · ${tech.roadmap.confidence || 'unknown'} confidence`);
            if (tech.roadmap.rationale) appendMetadataValue('Rationale', tech.roadmap.rationale);
            if (Array.isArray(tech.roadmap.blockers) && tech.roadmap.blockers.length) {
                appendMetadataValue('Blockers', tech.roadmap.blockers.join(', '));
            }
        }
        if (Array.isArray(tech.sources) && tech.sources.length) {
            const section = document.createElement('section');
            const title = document.createElement('h3');
            title.textContent = 'Sources';
            section.appendChild(title);
            const list = document.createElement('ul');
            for (const source of tech.sources) {
                const item = document.createElement('li');
                const link = document.createElement('a');
                link.href = source.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = source.title || source.url;
                item.appendChild(link);
                const meta = [source.publisher, source.year].filter(Boolean).join(', ');
                if (meta) item.appendChild(document.createTextNode(` (${meta})`));
                list.appendChild(item);
            }
            section.appendChild(list);
            techMetadataEl.appendChild(section);
        }

        techMetadataEl.hidden = techMetadataEl.childNodes.length === 0;
    }

    function updateInfoPanel(nodeId) {
        if (!nodeId) {
            techNameEl.textContent = '';
            techEraEl.textContent = '';
            techDescriptionEl.textContent = '';
            techPrerequisitesEl.textContent = '';
            renderTechMetadata(null);
            if (relationshipsEl) relationshipsEl.hidden = true;
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            return;
        }

        const nodeData = nodes.get(nodeId);
        if (!nodeData) return;

        techNameEl.textContent = nodeData.label;
        techEraEl.textContent = `Era: ${nodeData.era || 'N/A'}`;
        techDescriptionEl.textContent = nodeData.description;

        const prereqIds = (nodesById[nodeId] || {}).prerequisites || [];
        const dependentIds = dependentsMap[nodeId] || [];
        techPrerequisitesEl.textContent = `Prerequisites: ${prereqIds.length ? prereqIds.map(formatTechLabel).join(', ') : 'None'}`;
        renderTechMetadata(nodesById[nodeId]);
        renderRelationshipList(prereqListEl, prereqIds);
        renderRelationshipList(unlocksListEl, dependentIds);
        if (relationshipsEl) relationshipsEl.hidden = false;

        editBtn.disabled = false;
        deleteBtn.disabled = false;
    }

    function updateGraphSummary(visibleCount, totalCount, matchCount) {
        if (!graphContextSummaryEl) return;
        const parts = [`${visibleCount} of ${totalCount} visible`];
        if (currentEraFilter !== 'all') parts.push(currentEraFilter);
        if (currentFieldFilter !== 'all') parts.push(currentFieldFilter);
        if (currentSearchQuery) parts.push(`${matchCount} search match${matchCount === 1 ? '' : 'es'}`);
        if (selectedNodeId) {
            const prereqCount = existingIds(prereqMap[selectedNodeId] || []).length;
            const unlockCount = existingIds(dependentsMap[selectedNodeId] || []).length;
            parts.push(`${prereqCount} prerequisites`);
            parts.push(`${unlockCount} unlocks`);
        }
        graphContextSummaryEl.textContent = parts.join(' · ');
    }

    function updateGraphView({ fit = false, focusSelected = false } = {}) {
        const focusRelevant = focusRelevantInput ? focusRelevantInput.checked : true;
        const matchIds = getSearchMatches(currentSearchQuery);
        const fieldIds = getFieldMatches(currentFieldFilter);
        const filteredMatchIds = currentFieldFilter === 'all'
            ? matchIds
            : intersectSets(matchIds, fieldIds);
        let compactIds = null;

        if (focusRelevant && selectedNodeId) {
            compactIds = getOneHopContext([selectedNodeId]);
        } else if (focusRelevant && currentSearchQuery) {
            compactIds = getOneHopContext(filteredMatchIds);
        } else if (focusRelevant && currentFieldFilter !== 'all') {
            compactIds = fieldIds;
        }
        const compactPositions = compactIds
            ? createCompactPositions(selectedNodeId ? [selectedNodeId] : (currentSearchQuery ? filteredMatchIds : fieldIds))
            : null;

        const nodeUpdates = [];
        const visible = new Set();
        nodes.forEach(n => {
            const base = n.origColor || n.color;
            const fontColor = n.font?.color;
            const compactPosition = compactPositions?.get(n.id);
            const eraVisible = currentEraFilter === 'all' || n.era === currentEraFilter;
            const fieldVisible = currentFieldFilter === 'all' || fieldIds.has(n.id) || Boolean(compactIds?.has(n.id));
            const compactVisible = !compactIds || compactIds.has(n.id);
            const isVisible = eraVisible && fieldVisible && compactVisible;
            if (isVisible) visible.add(n.id);
            const isSelected = n.id === selectedNodeId;
            const isMatch = filteredMatchIds.has(n.id) || (currentFieldFilter !== 'all' && fieldIds.has(n.id));
            nodeUpdates.push({
                id: n.id,
                hidden: !isVisible,
                color: base,
                borderWidth: isSelected ? 4 : (isMatch ? 3 : (n.origBorderWidth || 1)),
                margin: compactPositions ? 4 : 7,
                widthConstraint: {
                    maximum: compactPositions ? 130 : 170
                },
                font: {
                    size: isSelected || isMatch ? (compactPositions ? 12 : 15) : (compactPositions ? 9 : 11),
                    bold: Boolean(isSelected || isMatch),
                    ...(fontColor ? { color: fontColor } : {})
                },
                x: compactPosition ? compactPosition.x : (n.origX ?? n.x),
                y: compactPosition ? compactPosition.y : (n.origY ?? n.y)
            });
        });
        if (nodeUpdates.length) nodes.update(nodeUpdates);

        const edgeUpdates = [];
        edges.forEach(e => {
            const isVisible = visible.has(e.from) && visible.has(e.to);
            const isSelectedEdge = selectedNodeId && (e.from === selectedNodeId || e.to === selectedNodeId);
            const base = e.origColor || (e.color && e.color.color) || e.color || '#848484';
            edgeUpdates.push({
                id: e.id,
                hidden: !isVisible,
                color: { color: isSelectedEdge ? '#34495e' : base },
                width: isSelectedEdge ? 2 : 1
            });
        });
        if (edgeUpdates.length) edges.update(edgeUpdates);

        updateGraphSummary(visible.size, dynamicData.length, currentSearchQuery ? filteredMatchIds.size : fieldIds.size);

        if ((focusSelected || fit) && visible.size > 0) {
            network.fit({
                nodes: Array.from(visible),
                animation: focusSelected ? { duration: 250, easingFunction: 'easeInOutQuad' } : false
            });
        } else if (fit) {
            network.fit({ animation: false });
        }
    }

    function resetHighlight() {
        currentSearchQuery = '';
        currentEraFilter = 'all';
        currentFieldFilter = 'all';
        if (fieldFilter) fieldFilter.value = 'all';
        updateGraphView({ fit: true });
    }

    function applySearch(query) {
        currentSearchQuery = query.trim();
        updateGraphView({ fit: true });
    }

    function applyEraFilter(era) {
        currentEraFilter = era || 'all';
        updateGraphView({ fit: true });
    }

    function applyFieldFilter(field) {
        currentFieldFilter = field || 'all';
        if (selectedNodeId && currentFieldFilter !== 'all' && !getFieldMatches(currentFieldFilter).has(selectedNodeId)) {
            selectedNodeId = null;
            network.unselectAll();
            updateInfoPanel(null);
        }
        updateGraphView({ fit: true });
    }

    function selectTechnology(nodeId, syncSelection = true) {
        if (!nodes.get(nodeId)) return;
        selectedNodeId = nodeId;
        if (syncSelection) network.selectNodes([nodeId]);
        updateInfoPanel(nodeId);
        updateGraphView({ focusSelected: true });
    }

    network.on("selectNode", function (params) {
        if (params.nodes.length > 0) {
            selectTechnology(params.nodes[0], false);
        }
    });

    network.on("deselectNode", function () {
        selectedNodeId = null;
        updateInfoPanel(null);
        updateGraphView({ fit: true });
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => applySearch(searchInput.value));
    }

    if (eraFilter) {
        eraFilter.addEventListener('change', () => applyEraFilter(eraFilter.value));
    }

    if (fieldFilter) {
        fieldFilter.addEventListener('change', () => applyFieldFilter(fieldFilter.value));
    }

    if (focusRelevantInput) {
        focusRelevantInput.addEventListener('change', () => updateGraphView({ fit: true, focusSelected: true }));
    }

    updateGraphView();

    async function saveData() {
        try {
            await fetch('api/tech-tree', {
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
            if (appConfig.readOnly) return;
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

            const newTech = applyDefaultMetadata({ id, name, era, description: desc, prerequisites: prereqs });
            dynamicData.push(newTech);
            nodesById[id] = newTech;
            prereqMap[id] = prereqs;
            prereqs.forEach(pr => {
                if (!dependentsMap[pr]) dependentsMap[pr] = [];
                dependentsMap[pr].push(id);
            });

            const baseColor = eraColors[era] || '#cccccc';
            nodes.add({
                id,
                label: name,
                title: desc,
                era,
                description: desc,
                color: baseColor,
                origColor: baseColor,
                borderWidth: 1,
                origBorderWidth: 1,
                origX: 0,
                origY: 0,
                x: 0,
                y: 0
            });
            prereqs.forEach(pr => {
                if (nodes.get(pr)) {
                    edges.add({ from: pr, to: id, arrows: 'to', color: { color: edgeColor('enabling') } });
                }
            });

            saveData();
            clearForm();
            updateGraphView({ fit: true });
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
            if (appConfig.readOnly) return;
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
            tech.dependencyEdges = prereqs.map(createDefaultDependencyEdge);
            applyDefaultMetadata(tech);
            nodesById[selectedNodeId] = tech;
            prereqMap[selectedNodeId] = prereqs;
            oldPrereqs.forEach(pr => {
                dependentsMap[pr] = (dependentsMap[pr] || []).filter(d => d !== selectedNodeId);
            });
            prereqs.forEach(pr => {
                if (!dependentsMap[pr]) dependentsMap[pr] = [];
                if (!dependentsMap[pr].includes(selectedNodeId)) dependentsMap[pr].push(selectedNodeId);
            });

            const baseColor = eraColors[era] || '#cccccc';
            nodes.update({
                id: selectedNodeId,
                label: name,
                era,
                description: desc,
                title: desc,
                color: baseColor,
                origColor: baseColor
            });

            // Remove old edges
            edges.get({ filter: e => e.to === selectedNodeId || e.from === selectedNodeId }).forEach(e => edges.remove(e.id));
            // Re-add edges for this node
            prereqs.forEach(pr => {
                if (nodes.get(pr)) {
                    edges.add({ from: pr, to: selectedNodeId, arrows: 'to', color: { color: edgeColor('enabling') } });
                }
            });
            // Reconnect edges from this node to its dependents
            dynamicData.forEach(t => {
                if (getPrerequisiteIds(t).includes(selectedNodeId)) {
                    edges.add({ from: selectedNodeId, to: t.id, arrows: 'to', color: { color: edgeColor('enabling') } });
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
            updateInfoPanel(selectedNodeId);
            updateGraphView({ fit: true, focusSelected: true });
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (appConfig.readOnly) return;
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
            delete nodesById[selectedNodeId];

            nodes.remove({ id: selectedNodeId });
            dynamicData = dynamicData.filter(t => t.id !== selectedNodeId);

            saveData();
            selectedNodeId = null;
            updateInfoPanel(null);
            clearForm();
            updateGraphView({ fit: true });
        });
    }
});

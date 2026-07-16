// app.js with Vis.js
document.addEventListener('DOMContentLoaded', async () => {
    const mainEl = document.getElementById('graph-main');
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
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const editorTitleEl = document.getElementById('editor-title');
    const editorStatusEl = document.getElementById('editor-status');
    const appStatusEl = document.getElementById('app-status');
    const newTechIdInput = document.getElementById('new-tech-id');
    const newTechNameInput = document.getElementById('new-tech-name');
    const newTechEraInput = document.getElementById('new-tech-era');
    const newTechDescriptionInput = document.getElementById('new-tech-description');
    const newTechPrereqInput = document.getElementById('new-tech-prereq');
    const searchInput = document.getElementById('search-tech');
    const searchOptionsEl = document.getElementById('search-tech-options');
    const eraFilter = document.getElementById('era-filter');
    const fieldFilter = document.getElementById('field-filter');
    const focusRelevantInput = document.getElementById('focus-relevant');
    const resetFiltersBtn = document.getElementById('reset-graph-filters');
    const graphContextSummaryEl = document.getElementById('graph-context-summary');
    const graphCanvasShellEl = document.getElementById('graph-canvas-shell');
    const graphIntroEl = document.getElementById('graph-intro');
    const relationshipsEl = document.getElementById('tech-relationships');
    const prereqListEl = document.getElementById('tech-prereq-list');
    const unlocksListEl = document.getElementById('tech-unlocks-list');
    const techEmptyStateEl = document.getElementById('tech-empty-state');
    const techDetailContentEl = document.getElementById('tech-detail-content');
    const techDetailLinkEl = document.getElementById('tech-detail-link');
    const techAdminActionsEl = document.getElementById('tech-admin-actions');
    const demoLinkEl = document.getElementById('graph-demo-link');
    const sortedLinkEl = document.getElementById('graph-sorted-link');
    const addPanel = document.getElementById('tech-add-panel');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const techMetadataEl = document.createElement('div');
    techMetadataEl.className = 'tech-metadata';
    techMetadataEl.hidden = true;
    if (techPrerequisitesEl?.parentElement) {
        techPrerequisitesEl.parentElement.insertBefore(techMetadataEl, techPrerequisitesEl.nextSibling);
    }

    function setStatus(element, message, state = '') {
        if (!element) return;
        element.textContent = message;
        element.classList.toggle('is-error', state === 'error');
        element.classList.toggle('is-success', state === 'success');
        element.setAttribute('aria-live', state === 'error' ? 'assertive' : 'polite');
    }

    let appConfig = { readOnly: true };
    let dynamicData = [];
    let datasetEtag = '';
    try {
        const [configResult, resp] = await Promise.all([
            fetch('api/config')
                .then(configResp => configResp.ok ? configResp.json() : appConfig)
                .catch(() => appConfig),
            fetch('api/tech-tree')
        ]);
        appConfig = { readOnly: configResult?.readOnly !== false };
        if (resp.ok) {
            datasetEtag = resp.headers.get('etag') || '';
            dynamicData = await resp.json();
            if (!Array.isArray(dynamicData)) throw new Error('Server returned an invalid dataset');
        } else {
            throw new Error(`Failed to load tech tree (${resp.status})`);
        }
    } catch (err) {
        console.error('Error loading tech tree:', err);
        setStatus(appStatusEl, 'The technology graph could not be loaded. Refresh the page or check the server.', 'error');
        container.setAttribute('aria-busy', 'false');
        mainEl?.setAttribute('aria-busy', 'false');
        return;
    }

    if (!window.vis?.Network || !window.vis?.DataSet) {
        setStatus(appStatusEl, 'The graph library could not be loaded. Refresh the page and try again.', 'error');
        container.setAttribute('aria-busy', 'false');
        mainEl?.setAttribute('aria-busy', 'false');
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
        if (!Array.isArray(tech.dependencyEdges)) {
            tech.dependencyEdges = (tech.prerequisites || []).map(createDefaultDependencyEdge);
        }
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
        legend.querySelectorAll('.legend-item').forEach(item => item.remove());
        const fragment = document.createDocumentFragment();
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
            fragment.appendChild(item);
        }
        legend.appendChild(fragment);
    }

    function populateEraFilter() {
        if (!eraFilter) return;
        eraFilter.replaceChildren(new Option('All Eras', 'all'));
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
        fieldFilter.replaceChildren(new Option('All Fields', 'all'));
        for (const field of fields) {
            const opt = document.createElement('option');
            opt.value = field;
            opt.textContent = field;
            fieldFilter.appendChild(opt);
        }
    }

    function populateSearchOptions() {
        if (!searchOptionsEl) return;
        const fragment = document.createDocumentFragment();
        dynamicData
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name))
            .forEach(tech => {
                const option = document.createElement('option');
                option.value = tech.id;
                option.label = tech.name;
                fragment.appendChild(option);
            });
        searchOptionsEl.replaceChildren(fragment);
    }

    renderLegend();
    populateEraFilter();
    populateFieldFilter();
    populateSearchOptions();

    if (appConfig.readOnly) {
        if (addPanel) addPanel.style.display = 'none';
        if (editBtn) editBtn.style.display = 'none';
        if (deleteBtn) deleteBtn.style.display = 'none';
        if (techAdminActionsEl) techAdminActionsEl.hidden = true;
    }

    // Compute radial layout levels using an adjacency list for efficiency
    const levelMap = {};
    const dependentsMap = {};
    const prereqMap = {};
    dynamicData.forEach(t => {
        const prerequisiteIds = getPrerequisiteIds(t);
        prereqMap[t.id] = prerequisiteIds;
        prerequisiteIds.forEach(pr => {
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
    const requestedTargetId = new URLSearchParams(window.location.search).get('target');
    const initialTargetId = requestedTargetId && nodes.get(requestedTargetId)
        ? requestedTargetId
        : null;
    const starterTargetIds = [
        'printing_press',
        'steam_engine',
        'internet',
        'crispr_gene_editing'
    ].filter(id => Boolean(nodes.get(id)));
    let selectedNodeId = null;
    let currentSearchQuery = '';
    let currentEraFilter = 'all';
    let currentFieldFilter = 'all';
    let introMode = !initialTargetId;
    let searchTimer = null;

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
            zoomView: true,
            tooltipDelay: 240,
            keyboard: {
                enabled: true,
                bindToWindow: false,
                autoFocus: true,
                speed: {
                    x: 12,
                    y: 12,
                    zoom: 0.025
                }
            }
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
    const graphFrame = container.querySelector('.vis-network');
    if (graphFrame) {
        graphFrame.setAttribute('role', 'group');
        graphFrame.setAttribute('aria-label', 'Technology graph canvas');
        graphFrame.setAttribute('aria-describedby', 'graph-keyboard-help graph-context-summary');
    }

    // Apply a compact starter map before revealing the graph, unless a URL target was requested.
    network.once('afterDrawing', () => {
        window.requestAnimationFrame(() => {
            if (initialTargetId) selectTechnology(initialTargetId);
            else updateGraphView({ fit: true });
            graphCanvasShellEl?.classList.remove('is-loading');
        });
    });


    // Let the canvas resize without discarding the user's current pan and zoom.
    let resizeTimer = null;
    const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(() => {
            network.setSize('100%', '100%');
            network.redraw();
        }, 120);
    };
    window.addEventListener('resize', handleResize, { passive: true });

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

    function getStarterContext(ids) {
        const context = new Set(existingIds(ids));
        ids.forEach(id => {
            existingIds(prereqMap[id] || []).forEach(prereqId => context.add(prereqId));
            existingIds(dependentsMap[id] || [])
                .sort((left, right) => {
                    const leftDate = nodesById[left]?.firstKnownDate ?? Number.POSITIVE_INFINITY;
                    const rightDate = nodesById[right]?.firstKnownDate ?? Number.POSITIVE_INFINITY;
                    return leftDate - rightDate || formatTechLabel(left).localeCompare(formatTechLabel(right));
                })
                .slice(0, 3)
                .forEach(depId => context.add(depId));
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

    function createCompactPositions(matchIds, allowedIds = null) {
        const positionsMap = new Map();
        const matches = sortedTechIds(matchIds);
        const centerIds = selectedNodeId ? [selectedNodeId] : matches;
        const centerSet = new Set(centerIds);
        const prereqIds = new Set();
        const unlockIds = new Set();

        centerIds.forEach(id => {
            existingIds(prereqMap[id] || []).forEach(prereqId => {
                if (!centerSet.has(prereqId) && (!allowedIds || allowedIds.has(prereqId))) prereqIds.add(prereqId);
            });
            existingIds(dependentsMap[id] || []).forEach(depId => {
                if (!centerSet.has(depId) && (!allowedIds || allowedIds.has(depId))) unlockIds.add(depId);
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

    function getSelectableSearchIds(query) {
        const fieldMatches = getFieldMatches(currentFieldFilter);
        return sortedTechIds([...getSearchMatches(query)].filter(id => {
            const node = nodes.get(id);
            const matchesEra = currentEraFilter === 'all' || node?.era === currentEraFilter;
            const matchesField = currentFieldFilter === 'all' || fieldMatches.has(id);
            return matchesEra && matchesField;
        }));
    }

    function intersectSets(primary, secondary) {
        if (!secondary || secondary.size === 0) return new Set(primary);
        return new Set([...primary].filter(id => secondary.has(id)));
    }

    function formatTechLabel(id) {
        return nodes.get(id)?.label || nodesById[id]?.name || id;
    }

    function formatDate(value) {
        if (typeof value !== 'number') return String(value);
        if (value < 0) return `${Math.abs(value).toLocaleString()} BCE`;
        return String(value);
    }

    function syncContextLinks(nodeId) {
        if (demoLinkEl) {
            demoLinkEl.href = nodeId
                ? `demo.html?target=${encodeURIComponent(nodeId)}`
                : 'demo.html';
        }
        if (sortedLinkEl) {
            sortedLinkEl.href = nodeId
                ? `sorted.html#tech-${encodeURIComponent(nodeId)}`
                : 'sorted.html';
        }
        if (techDetailLinkEl) {
            techDetailLinkEl.hidden = !nodeId;
            techDetailLinkEl.href = nodeId
                ? `tech/${encodeURIComponent(nodeId)}.html`
                : '#';
        }
    }

    function isUnseededFocusedView() {
        return !selectedNodeId
            && !currentSearchQuery
            && currentEraFilter === 'all'
            && currentFieldFilter === 'all'
            && (focusRelevantInput?.checked ?? true);
    }

    function updateIntroVisibility() {
        const visible = introMode && isUnseededFocusedView();
        if (graphIntroEl) graphIntroEl.hidden = !visible;
        graphCanvasShellEl?.classList.toggle('is-intro', visible);
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
            appendMetadataValue('First known', `${formatDate(tech.firstKnownDate)} (${tech.datePrecision || 'unknown'}; ${tech.region || 'region unknown'})`);
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
            if (techEmptyStateEl) techEmptyStateEl.hidden = false;
            if (techDetailContentEl) techDetailContentEl.hidden = true;
            syncContextLinks(null);
            editBtn.disabled = true;
            deleteBtn.disabled = true;
            return;
        }

        const nodeData = nodes.get(nodeId);
        if (!nodeData) return;

        techNameEl.textContent = nodeData.label;
        techEraEl.textContent = nodeData.era || 'Era unknown';
        techDescriptionEl.textContent = nodeData.description;

        const prereqIds = getPrerequisiteIds(nodesById[nodeId] || {});
        const dependentIds = dependentsMap[nodeId] || [];
        techPrerequisitesEl.textContent = `${prereqIds.length} direct prerequisite${prereqIds.length === 1 ? '' : 's'} · ${dependentIds.length} direct unlock${dependentIds.length === 1 ? '' : 's'}`;
        renderTechMetadata(nodesById[nodeId]);
        renderRelationshipList(prereqListEl, prereqIds);
        renderRelationshipList(unlocksListEl, dependentIds);
        if (relationshipsEl) relationshipsEl.hidden = false;
        if (techEmptyStateEl) techEmptyStateEl.hidden = true;
        if (techDetailContentEl) techDetailContentEl.hidden = false;
        syncContextLinks(nodeId);

        editBtn.disabled = false;
        deleteBtn.disabled = false;
    }

    function updateGraphSummary(visibleCount, totalCount, matchCount) {
        if (!graphContextSummaryEl) return;
        const parts = [introMode && isUnseededFocusedView()
            ? `Starter map · ${visibleCount} of ${totalCount} visible`
            : `${visibleCount} of ${totalCount} visible`];
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
        let compactSeedIds = null;

        if (introMode && isUnseededFocusedView()) {
            compactIds = getStarterContext(starterTargetIds);
            compactSeedIds = starterTargetIds;
        } else if (focusRelevant && selectedNodeId) {
            compactIds = getOneHopContext([selectedNodeId]);
            compactSeedIds = [selectedNodeId];
        } else if (focusRelevant && currentSearchQuery) {
            compactIds = getOneHopContext(filteredMatchIds);
            compactSeedIds = [...filteredMatchIds];
        } else if (focusRelevant && currentFieldFilter !== 'all') {
            compactIds = fieldIds;
            compactSeedIds = [...fieldIds];
        }
        const compactPositions = compactIds
            ? createCompactPositions(compactSeedIds || [], compactIds)
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
        updateIntroVisibility();
        if (resetFiltersBtn) {
            resetFiltersBtn.disabled = !currentSearchQuery
                && currentEraFilter === 'all'
                && currentFieldFilter === 'all';
        }

        if ((focusSelected || fit) && visible.size > 0) {
            network.fit({
                nodes: Array.from(visible),
                animation: focusSelected && !reducedMotionQuery.matches
                    ? { duration: 250, easingFunction: 'easeInOutQuad' }
                    : false
            });
        } else if (fit) {
            network.fit({ animation: false });
        }
    }

    function resetHighlight() {
        window.clearTimeout(searchTimer);
        currentSearchQuery = '';
        currentEraFilter = 'all';
        currentFieldFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (eraFilter) eraFilter.value = 'all';
        if (fieldFilter) fieldFilter.value = 'all';
        if (!selectedNodeId && (focusRelevantInput?.checked ?? true)) introMode = true;
        updateGraphView({ fit: true });
        setStatus(appStatusEl, 'Filters cleared.');
    }

    function applySearch(query) {
        currentSearchQuery = query.trim();
        if (currentSearchQuery) introMode = false;
        else if (isUnseededFocusedView()) introMode = true;
        updateGraphView({ fit: true });
    }

    function applyEraFilter(era) {
        currentEraFilter = era || 'all';
        if (currentEraFilter !== 'all') introMode = false;
        else if (isUnseededFocusedView()) introMode = true;
        updateGraphView({ fit: true });
    }

    function applyFieldFilter(field) {
        currentFieldFilter = field || 'all';
        if (currentFieldFilter !== 'all') introMode = false;
        if (selectedNodeId && currentFieldFilter !== 'all' && !getFieldMatches(currentFieldFilter).has(selectedNodeId)) {
            selectedNodeId = null;
            network.unselectAll();
            updateInfoPanel(null);
        }
        if (currentFieldFilter === 'all' && isUnseededFocusedView()) introMode = true;
        updateGraphView({ fit: true });
    }

    function showStarterView() {
        window.clearTimeout(searchTimer);
        selectedNodeId = null;
        currentSearchQuery = '';
        currentEraFilter = 'all';
        currentFieldFilter = 'all';
        introMode = true;
        network.unselectAll();
        if (searchInput) searchInput.value = '';
        if (eraFilter) eraFilter.value = 'all';
        if (fieldFilter) fieldFilter.value = 'all';
        if (focusRelevantInput) focusRelevantInput.checked = true;
        const url = new URL(window.location.href);
        url.searchParams.delete('target');
        window.history.replaceState(null, '', url);
        updateInfoPanel(null);
        updateGraphView({ fit: true });
        setStatus(appStatusEl, 'Starter map restored.');
    }

    function showAllTechnologies() {
        introMode = false;
        if (focusRelevantInput) focusRelevantInput.checked = false;
        updateGraphView({ fit: true });
        setStatus(appStatusEl, `Showing all ${dynamicData.length.toLocaleString()} technologies.`);
    }

    function selectQuickStart(nodeId) {
        currentSearchQuery = '';
        currentEraFilter = 'all';
        currentFieldFilter = 'all';
        if (searchInput) searchInput.value = '';
        if (eraFilter) eraFilter.value = 'all';
        if (fieldFilter) fieldFilter.value = 'all';
        if (focusRelevantInput) focusRelevantInput.checked = true;
        selectTechnology(nodeId);
    }

    function selectFirstSearchMatch() {
        const query = searchInput?.value.trim() || '';
        if (!query) {
            setStatus(appStatusEl, 'Enter a technology name or identifier to select it.');
            return;
        }
        const normalized = query.toLowerCase();
        const candidates = getSelectableSearchIds(query);
        const exact = candidates.find(id => {
            const item = nodesById[id];
            return id.toLowerCase() === normalized || item?.name.toLowerCase() === normalized;
        });
        const targetId = exact || candidates[0];
        if (!targetId) {
            setStatus(appStatusEl, 'No selectable technology matches the current search and filters.', 'error');
            return;
        }
        selectTechnology(targetId);
    }

    function selectTechnology(nodeId, syncSelection = true) {
        if (!nodes.get(nodeId)) return;
        introMode = false;
        selectedNodeId = nodeId;
        if (syncSelection) network.selectNodes([nodeId]);
        const url = new URL(window.location.href);
        url.searchParams.set('target', nodeId);
        window.history.replaceState(null, '', url);
        updateInfoPanel(nodeId);
        updateGraphView({ focusSelected: true });
        setStatus(appStatusEl, `Selected ${formatTechLabel(nodeId)}.`);
    }

    network.on("selectNode", function (params) {
        if (params.nodes.length > 0) {
            selectTechnology(params.nodes[0], false);
        }
    });

    network.on("deselectNode", function () {
        selectedNodeId = null;
        if (isUnseededFocusedView()) introMode = true;
        const url = new URL(window.location.href);
        url.searchParams.delete('target');
        window.history.replaceState(null, '', url);
        updateInfoPanel(null);
        updateGraphView({ fit: true });
        setStatus(appStatusEl, 'Selection cleared.');
    });

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(() => applySearch(searchInput.value), 100);
        });
        searchInput.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                window.clearTimeout(searchTimer);
                searchInput.value = '';
                applySearch('');
                setStatus(appStatusEl, 'Search cleared.');
                return;
            }
            if (event.key === 'Enter') {
                event.preventDefault();
                window.clearTimeout(searchTimer);
                applySearch(searchInput.value);
                selectFirstSearchMatch();
            }
        });
    }

    if (eraFilter) {
        eraFilter.addEventListener('change', () => applyEraFilter(eraFilter.value));
    }

    if (fieldFilter) {
        fieldFilter.addEventListener('change', () => applyFieldFilter(fieldFilter.value));
    }

    if (focusRelevantInput) {
        focusRelevantInput.addEventListener('change', () => {
            introMode = focusRelevantInput.checked && isUnseededFocusedView();
            updateGraphView({ fit: true, focusSelected: true });
        });
    }

    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', resetHighlight);
    }

    document.querySelectorAll('[data-graph-target]').forEach(button => {
        button.addEventListener('click', () => selectQuickStart(button.dataset.graphTarget));
    });
    document.querySelectorAll('[data-graph-starter]').forEach(button => {
        button.addEventListener('click', showStarterView);
    });
    document.querySelectorAll('[data-graph-show-all]').forEach(button => {
        button.addEventListener('click', showAllTechnologies);
    });

    updateInfoPanel(null);
    updateGraphView();
    container.setAttribute('aria-busy', 'false');
    mainEl?.setAttribute('aria-busy', 'false');

    const validEras = new Set(Object.keys(eraDefaultDates));
    let isSaving = false;
    let editingNodeId = null;

    function cloneData() {
        return JSON.parse(JSON.stringify(dynamicData));
    }

    function parsePrerequisites(value) {
        return value
            .split(',')
            .map(prerequisite => prerequisite.trim())
            .filter(Boolean);
    }

    function readEditorValues() {
        return {
            id: newTechIdInput.value.trim(),
            name: newTechNameInput.value.trim(),
            era: newTechEraInput.value,
            description: newTechDescriptionInput.value.trim(),
            prerequisites: parsePrerequisites(newTechPrereqInput.value)
        };
    }

    function validateEditorValues(values, editingId = null) {
        if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(values.id)) {
            return 'Identifier must use lowercase letters, numbers, underscores, or hyphens.';
        }
        if (values.id.length > 160) return 'Identifier must be 160 characters or fewer.';
        if (!values.name) return 'Name is required.';
        if (values.name.length > 200) return 'Name must be 200 characters or fewer.';
        if (!values.description) return 'Description is required.';
        if (values.description.length > 5000) return 'Description must be 5,000 characters or fewer.';
        if (!validEras.has(values.era)) return 'Select a valid era.';
        if (!editingId && nodesById[values.id]) return 'A technology with this identifier already exists.';
        if (new Set(values.prerequisites).size !== values.prerequisites.length) {
            return 'Prerequisites must not contain duplicate identifiers.';
        }
        if (values.prerequisites.includes(values.id)) return 'A technology cannot require itself.';
        const missing = values.prerequisites.filter(prerequisite => !nodesById[prerequisite]);
        if (missing.length) return `Unknown prerequisite: ${missing[0]}.`;
        return '';
    }

    const editorInputs = [
        newTechIdInput,
        newTechNameInput,
        newTechEraInput,
        newTechDescriptionInput,
        newTechPrereqInput
    ].filter(Boolean);

    function clearEditorInvalidStates() {
        editorInputs.forEach(input => input.setAttribute('aria-invalid', 'false'));
    }

    function showEditorValidationError(message) {
        clearEditorInvalidStates();
        let input = newTechPrereqInput;
        if (message.startsWith('Identifier') || message.startsWith('A technology with')) input = newTechIdInput;
        else if (message.startsWith('Name')) input = newTechNameInput;
        else if (message.startsWith('Description')) input = newTechDescriptionInput;
        else if (message.startsWith('Select a valid era')) input = newTechEraInput;
        input?.setAttribute('aria-invalid', 'true');
        setStatus(editorStatusEl, message, 'error');
        input?.focus();
    }

    function preserveDependencyEdges(tech, prerequisites) {
        const existingEdges = new Map(getDependencyEdges(tech).map(edge => [edge.prerequisite, edge]));
        return prerequisites.map(prerequisite => existingEdges.get(prerequisite) || createDefaultDependencyEdge(prerequisite));
    }

    function setMutationControlsDisabled(disabled) {
        isSaving = disabled;
        addPanel?.setAttribute('aria-busy', String(disabled));
        if (addBtn) addBtn.disabled = disabled;
        if (updateBtn) updateBtn.disabled = disabled;
        if (cancelEditBtn) cancelEditBtn.disabled = disabled;
        if (editBtn) editBtn.disabled = disabled || !selectedNodeId;
        if (deleteBtn) deleteBtn.disabled = disabled || !selectedNodeId;
    }

    async function apiErrorMessage(response) {
        try {
            const payload = await response.json();
            const message = payload.error?.message || `Save failed (${response.status}).`;
            const details = Array.isArray(payload.error?.details) ? payload.error.details.slice(0, 3) : [];
            return details.length ? `${message} ${details.join(' ')}` : message;
        } catch (error) {
            return `Save failed (${response.status}).`;
        }
    }

    async function persistCandidate(candidate, successMessage) {
        if (isSaving) return false;
        setMutationControlsDisabled(true);
        setStatus(editorStatusEl, 'Saving...');
        setStatus(appStatusEl, '');

        try {
            const response = await fetch('api/tech-tree', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'If-Match': datasetEtag
                },
                body: JSON.stringify(candidate)
            });
            if (!response.ok) throw new Error(await apiErrorMessage(response));

            setStatus(editorStatusEl, successMessage, 'success');
            window.location.reload();
            return true;
        } catch (error) {
            console.error('Failed to save tech tree:', error);
            setStatus(editorStatusEl, error.message || 'The technology graph could not be saved.', 'error');
            setMutationControlsDisabled(false);
            return false;
        }
    }

    function clearForm() {
        const wasEditing = Boolean(editingNodeId);
        newTechIdInput.value = '';
        newTechNameInput.value = '';
        newTechEraInput.value = 'Modern';
        newTechDescriptionInput.value = '';
        newTechPrereqInput.value = '';
        newTechIdInput.disabled = false;
        newTechEraInput.disabled = false;
        editingNodeId = null;
        if (editorTitleEl) editorTitleEl.textContent = 'Add Technology';
        if (updateBtn) updateBtn.hidden = true;
        if (cancelEditBtn) cancelEditBtn.hidden = true;
        if (addBtn) addBtn.hidden = false;
        clearEditorInvalidStates();
        setStatus(editorStatusEl, '');
        if (wasEditing && addPanel instanceof HTMLDetailsElement) addPanel.open = false;
    }

    editorInputs.forEach(input => {
        input.addEventListener('input', () => input.setAttribute('aria-invalid', 'false'));
        input.addEventListener('change', () => input.setAttribute('aria-invalid', 'false'));
    });

    if (addBtn) {
        addBtn.addEventListener('click', async () => {
            if (appConfig.readOnly || isSaving) return;
            const values = readEditorValues();
            const validationError = validateEditorValues(values);
            if (validationError) {
                showEditorValidationError(validationError);
                return;
            }

            const candidate = cloneData();
            candidate.push(applyDefaultMetadata({ ...values }));
            await persistCandidate(candidate, 'Technology added. Reloading the graph...');
        });
    }

    if (editBtn) {
        editBtn.addEventListener('click', () => {
            if (appConfig.readOnly || isSaving || !selectedNodeId) return;
            const tech = dynamicData.find(item => item.id === selectedNodeId);
            if (!tech) return;

            newTechIdInput.value = tech.id;
            newTechNameInput.value = tech.name;
            newTechEraInput.value = tech.era;
            newTechDescriptionInput.value = tech.description;
            newTechPrereqInput.value = getPrerequisiteIds(tech).join(', ');
            newTechIdInput.disabled = true;
            newTechEraInput.disabled = true;
            editingNodeId = tech.id;
            if (editorTitleEl) editorTitleEl.textContent = 'Edit Technology';
            if (addBtn) addBtn.hidden = true;
            if (updateBtn) updateBtn.hidden = false;
            if (cancelEditBtn) cancelEditBtn.hidden = false;
            clearEditorInvalidStates();
            setStatus(editorStatusEl, '');
            if (addPanel instanceof HTMLDetailsElement) addPanel.open = true;
            newTechNameInput.focus();
        });
    }

    if (cancelEditBtn) cancelEditBtn.addEventListener('click', clearForm);

    if (updateBtn) {
        updateBtn.addEventListener('click', async () => {
            if (appConfig.readOnly || isSaving || !editingNodeId) return;
            const values = readEditorValues();
            const validationError = validateEditorValues(values, editingNodeId);
            if (validationError) {
                showEditorValidationError(validationError);
                return;
            }

            const candidate = cloneData();
            const techIndex = candidate.findIndex(item => item.id === editingNodeId);
            if (techIndex === -1) return;
            const current = candidate[techIndex];
            candidate[techIndex] = {
                ...current,
                name: values.name,
                description: values.description,
                prerequisites: values.prerequisites,
                dependencyEdges: preserveDependencyEdges(current, values.prerequisites)
            };
            await persistCandidate(candidate, 'Technology updated. Reloading the graph...');
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener('click', async () => {
            if (appConfig.readOnly || isSaving || !selectedNodeId) return;
            const tech = dynamicData.find(item => item.id === selectedNodeId);
            if (!tech) return;
            const dependentCount = dependentsMap[selectedNodeId]?.length || 0;
            const dependencyNotice = dependentCount
                ? ` This will also remove it from ${dependentCount} dependent ${dependentCount === 1 ? 'node' : 'nodes'}.`
                : '';
            if (!window.confirm(`Delete "${tech.name}"?${dependencyNotice}`)) return;

            const candidate = cloneData()
                .filter(item => item.id !== selectedNodeId)
                .map(item => ({
                    ...item,
                    prerequisites: item.prerequisites.filter(prerequisite => prerequisite !== selectedNodeId),
                    dependencyEdges: item.dependencyEdges.filter(edge => edge.prerequisite !== selectedNodeId)
                }));
            await persistCandidate(candidate, 'Technology deleted. Reloading the graph...');
        });
    }

    window.addEventListener('beforeunload', () => {
        window.clearTimeout(searchTimer);
        window.clearTimeout(resizeTimer);
    });
});

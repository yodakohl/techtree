document.addEventListener('DOMContentLoaded', async () => {
    const fieldSelect = document.getElementById('demo-field');
    const searchInput = document.getElementById('demo-search');
    const targetInput = document.getElementById('demo-target');
    const targetOptionsEl = document.getElementById('demo-target-options');
    const trustFilterSelect = document.getElementById('demo-trust-filter');
    const clearTargetBtn = document.getElementById('demo-clear-target');
    const statusEl = document.getElementById('demo-status');
    const fieldTitleEl = document.getElementById('demo-field-title');
    const metricsEl = document.getElementById('demo-metrics');
    const qualitySnapshotEl = document.getElementById('demo-quality-snapshot');
    const trustLegendEl = document.getElementById('demo-trust-legend');
    const nextListEl = document.getElementById('demo-next-list');
    const lanesEl = document.getElementById('demo-lanes');
    const detailEl = document.getElementById('demo-detail');
    const heroTitleEl = document.getElementById('demo-hero-title');
    const heroSummaryEl = document.getElementById('demo-hero-summary');
    const heroStatsEl = document.getElementById('demo-hero-stats');
    const heroFieldEl = document.getElementById('demo-hero-field');
    const heroTargetEl = document.getElementById('demo-hero-target');
    const storyStageEl = document.getElementById('demo-story-stage');
    const storyCanvasEl = document.getElementById('demo-story-canvas');
    const heroChainEl = document.getElementById('demo-hero-chain');
    const heroEdgesEl = document.getElementById('demo-hero-edges');
    const heroUnlocksEl = document.getElementById('demo-hero-unlocks');
    const trustModel = window.TechTreeTrust;

    const eraOrder = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const storyEraColors = {
        Ancient: '#d98845',
        Classical: '#5ba7d9',
        Medieval: '#c5a75e',
        Renaissance: '#63bd8d',
        Industrial: '#f0a94a',
        Modern: '#7fd4ca',
        Future: '#d78df0',
        Unknown: '#8aa0ad'
    };

    const fieldOrder = [
        'Genome Editing / CRISPR-Cas',
        'Semiconductors & Integrated Circuits',
        'Artificial Intelligence & Machine Learning',
        'Energy Systems & Grid',
        'Mechanical Engineering',
        'Civil Engineering & Built Environment',
        'Finance & Markets',
        'Pharmaceuticals & Drug Development',
        'Water & Sanitation Systems',
        'Telecommunications & Networking',
        'Medical Imaging & Diagnostics',
        'Cybersecurity & Cryptography',
        'Robotics & Autonomous Systems',
        'Transportation & Logistics',
        'Materials Science & Manufacturing',
        'Agriculture & Food Systems',
        'Climate & Environmental Systems',
        'Spaceflight & Satellites'
    ];

    const laneOrder = {
        'Genome Editing / CRISPR-Cas': ['Foundations', 'Editing Platforms', 'Delivery', 'Assays & Safety', 'Therapeutics', 'Applications', 'Roadmap'],
        'Semiconductors & Integrated Circuits': ['Materials & Devices', 'Fabrication & Lithography', 'Circuit Integration', 'Design Automation', 'Processors & Architectures', 'Memory & Storage', 'Packaging & Interconnect', 'Roadmap'],
        'Artificial Intelligence & Machine Learning': ['Foundations', 'Classical ML', 'Neural Networks', 'Foundation Models', 'Data & Evaluation', 'Deployment & MLOps', 'Safety & Governance', 'Applications', 'Roadmap'],
        'Energy Systems & Grid': ['Foundations', 'Generation', 'Grid & Transmission', 'Storage', 'Renewables', 'Nuclear & Fusion', 'Control & Markets', 'Roadmap'],
        'Mechanical Engineering': ['Foundations & Measurement', 'Materials & Fabrication', 'Mechanisms & Machines', 'Power & Thermal Systems', 'Vehicles & Infrastructure', 'Automation & Systems'],
        'Civil Engineering & Built Environment': ['Foundations & Surveying', 'Construction Materials', 'Structural Systems', 'Transport Infrastructure', 'Water & Sanitation Infrastructure', 'Buildings & Urban Systems', 'Construction Automation & Roadmap'],
        'Finance & Markets': ['Money & Accounting', 'Banking & Credit', 'Markets & Commerce', 'Risk & Insurance', 'Institutions & Law', 'Financial Computing', 'Roadmap'],
        'Pharmaceuticals & Drug Development': ['Materia Medica & Pharmacy', 'Experimental Pharmacology', 'Industrial Drug Manufacturing', 'Small-Molecule Drugs', 'Biologics & Vaccines', 'Drug Delivery & Formulation', 'Clinical Development & Regulation', 'Pharmacovigilance & Real-World Evidence', 'Computational & AI Drug Discovery', 'Roadmap'],
        'Water & Sanitation Systems': ['Supply & Storage', 'Conveyance & Distribution', 'Sanitation & Sewerage', 'Drinking Water Treatment', 'Wastewater & Reuse', 'Desalination & Advanced Treatment', 'Monitoring & Utility Operations', 'Roadmap'],
        'Telecommunications & Networking': ['Foundations & Switching', 'Transmission Media', 'Protocols & Routing', 'Services & Applications', 'Access Networks', 'Operations & Scaling', 'Roadmap'],
        'Medical Imaging & Diagnostics': ['Foundations', 'Imaging Modalities', 'Laboratory Diagnostics', 'Molecular Diagnostics', 'Monitoring', 'Digital Health', 'Screening', 'Roadmap'],
        'Cybersecurity & Cryptography': ['Cryptographic Foundations', 'Identity & Trust', 'Network Security', 'Detection & Response', 'Secure Software', 'Cloud & Platform Security', 'Governance & Risk', 'Roadmap'],
        'Robotics & Autonomous Systems': ['Foundations', 'Manipulation', 'Mobility & Navigation', 'Perception', 'Industrial Automation', 'Medical & Service Robots', 'Autonomy & AI', 'Safety', 'Roadmap'],
        'Transportation & Logistics': ['Road & Rail', 'Maritime & Ports', 'Aviation', 'Intermodal Freight', 'Warehousing', 'Cold Chain', 'Digital Logistics', 'Electrification', 'Roadmap'],
        'Materials Science & Manufacturing': ['Foundations', 'Metals & Alloys', 'Polymers', 'Ceramics & Glass', 'Composites', 'Semiconductor Materials', 'Advanced Manufacturing', 'Materials Discovery', 'Roadmap'],
        'Agriculture & Food Systems': ['Foundations', 'Mechanization', 'Inputs', 'Crop Science', 'Irrigation', 'Controlled Environments', 'Supply Chains', 'Digital Agriculture', 'Roadmap'],
        'Climate & Environmental Systems': ['Measurement', 'Pollution Control', 'Water & Waste', 'Climate Modeling', 'Mitigation', 'Adaptation', 'Ecosystem Monitoring', 'Roadmap'],
        'Spaceflight & Satellites': ['Launch', 'Spacecraft Systems', 'Satellites', 'Navigation & Timing', 'Space Science', 'Human Spaceflight', 'Operations', 'Roadmap']
    };

    const defaultFocus = {
        'Genome Editing / CRISPR-Cas': 'crispr_gene_editing',
        'Semiconductors & Integrated Circuits': 'high_na_euv_lithography',
        'Artificial Intelligence & Machine Learning': 'retrieval_augmented_generation',
        'Energy Systems & Grid': 'long_duration_energy_storage',
        'Mechanical Engineering': 'assembly_line',
        'Civil Engineering & Built Environment': 'skyscrapers_steel_frame',
        'Finance & Markets': 'central_bank_digital_currency_pilots',
        'Pharmaceuticals & Drug Development': 'ai_driven_drug_discovery',
        'Water & Sanitation Systems': 'low_energy_desalination_membranes',
        'Telecommunications & Networking': 'quantum_internet',
        'Medical Imaging & Diagnostics': 'ai_diagnostic_decision_support',
        'Cybersecurity & Cryptography': 'post_quantum_security_migration',
        'Robotics & Autonomous Systems': 'humanoid_general_purpose_robots',
        'Transportation & Logistics': 'autonomous_freight_corridors',
        'Materials Science & Manufacturing': 'materials_informatics',
        'Agriculture & Food Systems': 'precision_agriculture',
        'Climate & Environmental Systems': 'direct_air_capture',
        'Spaceflight & Satellites': 'on_orbit_servicing'
    };

    let techData = [];
    let graph = null;
    let currentField = 'Genome Editing / CRISPR-Cas';
    let selectedId = null;
    let targetId = null;
    let currentTrustFilter = 'all';
    let traceExpanded = false;
    let storyTimerId = null;
    let storyCanvasAnimationId = null;

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text;
    }

    function initStoryCanvas() {
        if (!storyCanvasEl) return;
        const context = storyCanvasEl.getContext('2d');
        if (!context) return;

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const threads = Array.from({ length: 44 }, (_, index) => {
            const column = index % 11;
            const row = Math.floor(index / 11);
            return {
                x: (column + 0.35 + ((index * 17) % 9) / 20) / 11,
                y: (row + 0.42 + ((index * 23) % 7) / 18) / 4.4,
                phase: index * 0.47,
                speed: 0.00008 + (index % 5) * 0.000014
            };
        });

        function resizeCanvas() {
            const rect = storyCanvasEl.getBoundingClientRect();
            const ratio = Math.min(window.devicePixelRatio || 1, 2);
            storyCanvasEl.width = Math.max(1, Math.floor(rect.width * ratio));
            storyCanvasEl.height = Math.max(1, Math.floor(rect.height * ratio));
            context.setTransform(ratio, 0, 0, ratio, 0, 0);
        }

        function draw(time = 0) {
            const width = storyCanvasEl.clientWidth;
            const height = storyCanvasEl.clientHeight;
            if (!width || !height) return;
            context.clearRect(0, 0, width, height);
            context.lineWidth = 1;

            for (let index = 0; index < threads.length - 1; index += 1) {
                const point = threads[index];
                const next = threads[index + 1];
                if (index % 4 === 3) continue;
                const drift = Math.sin(time * point.speed + point.phase) * 10;
                const nextDrift = Math.cos(time * next.speed + next.phase) * 8;
                const x1 = point.x * width + drift;
                const y1 = point.y * height;
                const x2 = next.x * width + nextDrift;
                const y2 = next.y * height;
                const alpha = 0.06 + ((index % 5) * 0.018);
                context.strokeStyle = `rgba(196, 224, 232, ${alpha})`;
                context.beginPath();
                context.moveTo(x1, y1);
                context.lineTo(x2, y2);
                context.stroke();
            }

            for (const [index, point] of threads.entries()) {
                const pulse = reduceMotion ? 0.55 : 0.45 + Math.sin(time * point.speed * 8 + point.phase) * 0.22;
                const x = point.x * width + Math.sin(time * point.speed + point.phase) * 10;
                const y = point.y * height + Math.cos(time * point.speed + point.phase) * 7;
                const size = index % 9 === 0 ? 2.8 : 1.7;
                context.fillStyle = index % 6 === 0
                    ? `rgba(240, 188, 104, ${0.3 + pulse * 0.28})`
                    : `rgba(133, 216, 205, ${0.22 + pulse * 0.3})`;
                context.beginPath();
                context.arc(x, y, size, 0, Math.PI * 2);
                context.fill();
            }

            if (!reduceMotion) {
                storyCanvasAnimationId = window.requestAnimationFrame(draw);
            }
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        if (storyCanvasAnimationId) window.cancelAnimationFrame(storyCanvasAnimationId);
        draw(0);
        if (!reduceMotion) storyCanvasAnimationId = window.requestAnimationFrame(draw);
    }

    function hasField(item, field) {
        return Array.isArray(item.fields) && item.fields.includes(field);
    }

    function getLane(item, field) {
        return item.fieldLanes?.[field] || 'General';
    }

    function getDependencyEdges(item) {
        if (Array.isArray(item?.dependencyEdges) && item.dependencyEdges.length) {
            return item.dependencyEdges;
        }
        return (item?.prerequisites || []).map(prerequisite => ({
            prerequisite,
            type: 'required',
            confidence: 0.5,
            evidence_level: 'weak_inference',
            note: 'Legacy prerequisite without edge-level metadata.',
            reviewStatus: 'generated'
        }));
    }

    function getPrerequisiteIds(item) {
        const ids = new Set(item?.prerequisites || []);
        for (const edge of getDependencyEdges(item)) {
            if (edge.prerequisite) ids.add(edge.prerequisite);
        }
        return [...ids];
    }

    function buildGraph(data) {
        const byId = new Map(data.map(item => [item.id, item]));
        const dependents = new Map();
        for (const item of data) {
            if (!dependents.has(item.id)) dependents.set(item.id, []);
            for (const prereq of getPrerequisiteIds(item)) {
                if (!byId.has(prereq)) continue;
                if (!dependents.has(prereq)) dependents.set(prereq, []);
                dependents.get(prereq).push(item.id);
            }
        }
        return { byId, dependents };
    }

    function formatStatus(value) {
        return String(value || '').replaceAll('_', ' ');
    }

    function formatDate(value) {
        if (typeof value !== 'number') return 'unknown';
        if (value < 0) return `${Math.abs(value).toLocaleString()} BCE`;
        return String(value);
    }

    function formatConfidence(value) {
        return typeof value === 'number' ? `${Math.round(value * 100)}%` : 'unknown';
    }

    function compareDate(a, b) {
        const dateDiff = (a.firstKnownDate ?? 99999) - (b.firstKnownDate ?? 99999);
        if (dateDiff !== 0) return dateDiff;
        const eraDiff = (eraOrder[a.era] ?? 99) - (eraOrder[b.era] ?? 99);
        if (eraDiff !== 0) return eraDiff;
        return a.name.localeCompare(b.name);
    }

    function getFieldItems(field) {
        return techData.filter(item => hasField(item, field)).sort(compareDate);
    }

    function getRoadmapItems(items) {
        const roadmap = items
            .filter(item => item.roadmap || item.maturity === 'forecast' || item.era === 'Future')
            .sort(compareDate);
        if (roadmap.length) return roadmap;
        return items
            .filter(item => item.maturity === 'emerging')
            .sort(compareDate)
            .slice(-6);
    }

    function getFieldFromUrl() {
        const field = new URLSearchParams(window.location.search).get('field');
        return field && fieldOrder.includes(field) ? field : currentField;
    }

    function getTrustFilterFromUrl() {
        const value = new URLSearchParams(window.location.search).get('trust');
        return ['all', 'high', 'no-future', 'no-weak-edges'].includes(value) ? value : 'all';
    }

    function getHashTechId() {
        const raw = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (!raw) return null;
        return raw.startsWith('tech-') ? raw.slice(5) : raw;
    }

    function getTargetFromUrl() {
        const id = new URLSearchParams(window.location.search).get('target');
        return id && graph?.byId.has(id) ? id : null;
    }

    function updateUrl() {
        const params = new URLSearchParams();
        params.set('field', currentField);
        if (targetId) params.set('target', targetId);
        if (currentTrustFilter !== 'all') params.set('trust', currentTrustFilter);
        const hash = selectedId ? `#tech-${encodeURIComponent(selectedId)}` : '';
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${hash}`);
    }

    function setSelected(id, options = {}) {
        if (!id || !graph.byId.has(id)) return;
        selectedId = id;
        if (options.updateUrl !== false) updateUrl();
        renderDetail();
        document.querySelectorAll('.demo-tech-chip.is-selected, .demo-next-card.is-selected, .demo-target-chip.is-selected, .demo-longest-chip.is-selected, .demo-target-edge-button.is-selected, .demo-hero-step.is-selected, .demo-hero-edge-button.is-selected, .demo-hero-unlock-button.is-selected, .demo-story-node-button.is-selected, .demo-story-unlock-node.is-selected')
            .forEach(el => el.classList.remove('is-selected'));
        document.querySelectorAll(`[data-tech-id="${CSS.escape(id)}"]`)
            .forEach(el => el.classList.add('is-selected'));
    }

    function setTarget(id, options = {}) {
        targetId = id && graph.byId.has(id) ? id : null;
        traceExpanded = false;
        setStatus('');
        if (targetId) {
            const item = graph.byId.get(targetId);
            const preferredField = (item.fields || []).find(field => fieldOrder.includes(field));
            if (preferredField && currentField !== preferredField && options.preserveField !== true) {
                currentField = preferredField;
                fieldSelect.value = currentField;
            }
            selectedId = targetId;
        }
        syncTargetInput();
        if (options.updateUrl !== false) updateUrl();
        renderField();
        if (options.revealDetail && detailEl && window.matchMedia('(max-width: 900px)').matches) {
            detailEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    function syncTargetInput() {
        if (!targetInput) return;
        if (!targetId) {
            targetInput.value = '';
            if (clearTargetBtn) clearTargetBtn.hidden = true;
            return;
        }
        const item = graph.byId.get(targetId);
        targetInput.value = `${item.name} [${item.id}]`;
        if (clearTargetBtn) clearTargetBtn.hidden = false;
    }

    function createTechButton(item, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.techId = item.id;
        button.dataset.nodeTrust = nodeTrust(item).level;
        button.addEventListener('click', () => setSelected(item.id));
        return button;
    }

    function edgeRank(type) {
        return {
            required: 0,
            enabling: 1,
            commercial_or_scaling_dependency: 2,
            accelerates: 3,
            historical_predecessor: 4,
            common_dependency: 5,
            speculative: 6
        }[type] ?? 7;
    }

    function edgeKind(edge) {
        return {
            required: 'Hard prerequisite',
            enabling: 'Enabler',
            accelerates: 'Accelerator',
            historical_predecessor: 'Historical predecessor',
            common_dependency: 'Shared dependency',
            commercial_or_scaling_dependency: 'Scaling dependency',
            speculative: 'Speculative'
        }[edge?.type] || 'Dependency';
    }

    function hasEdgeSource(edge) {
        return Array.isArray(edge?.sources) && edge.sources.some(source => Array.isArray(source.supports) && source.supports.includes('edge'));
    }

    function nodeTrust(item) {
        return trustModel.deriveNodeTrust(item);
    }

    function edgeTrust(edge) {
        return trustModel.deriveEdgeTrust(edge);
    }

    function createTrustBadge(kind, info, options = {}) {
        const badge = document.createElement('span');
        badge.className = [
            'trust-badge',
            `trust-badge-${kind}`,
            `trust-badge-${info.level}`,
            options.compact ? 'trust-badge-compact' : ''
        ].filter(Boolean).join(' ');
        badge.textContent = options.compact ? info.shortLabel : info.label;
        badge.title = info.description;
        return badge;
    }

    function appendNodeTrustBadge(parent, item, options = {}) {
        parent.appendChild(createTrustBadge('node', nodeTrust(item), options));
    }

    function appendEdgeTrustBadge(parent, edge, options = {}) {
        parent.appendChild(createTrustBadge('edge', edgeTrust(edge), options));
    }

    function isNodeVisibleByTrust(item) {
        if (!item) return false;
        const level = nodeTrust(item).level;
        if (currentTrustFilter === 'high') return level === 'high';
        if (currentTrustFilter === 'no-future') return level !== 'future';
        return true;
    }

    function isEdgeVisibleByTrust(edge, dependent, prerequisite) {
        if (!edge) return currentTrustFilter !== 'high' && currentTrustFilter !== 'no-weak-edges';
        const level = edgeTrust(edge).level;
        if (currentTrustFilter === 'high') {
            return level === 'strong'
                && isNodeVisibleByTrust(dependent)
                && isNodeVisibleByTrust(prerequisite);
        }
        if (currentTrustFilter === 'no-weak-edges') return level !== 'weak';
        if (currentTrustFilter === 'no-future') {
            return isNodeVisibleByTrust(dependent) && isNodeVisibleByTrust(prerequisite);
        }
        return true;
    }

    function getVisibleFieldItems(field) {
        return getFieldItems(field).filter(isNodeVisibleByTrust);
    }

    function applyTrustFilterToTrace(trace) {
        if (!trace) return null;
        if (!isNodeVisibleByTrust(trace.target)) return null;
        const visibleIds = trace.ids.filter(id => isNodeVisibleByTrust(graph.byId.get(id)));
        const visibleIdSet = new Set(visibleIds);
        const edges = trace.edges.filter(entry => {
            const dependent = graph.byId.get(entry.to);
            const prerequisite = graph.byId.get(entry.from);
            return visibleIdSet.has(entry.from)
                && visibleIdSet.has(entry.to)
                && isEdgeVisibleByTrust(entry.edge, dependent, prerequisite);
        });
        const directEdges = trace.directEdges.filter(entry => {
            const dependent = graph.byId.get(entry.to);
            const prerequisite = graph.byId.get(entry.from);
            return visibleIdSet.has(entry.from)
                && visibleIdSet.has(entry.to)
                && isEdgeVisibleByTrust(entry.edge, dependent, prerequisite);
        });
        const connected = new Set([trace.target.id]);
        for (const entry of edges) {
            connected.add(entry.from);
            connected.add(entry.to);
        }
        for (const entry of directEdges) {
            connected.add(entry.from);
            connected.add(entry.to);
        }
        const distance = new Map([...trace.distance.entries()].filter(([id]) => connected.has(id)));
        const outgoing = new Map();
        for (const entry of edges) {
            if (!outgoing.has(entry.from)) outgoing.set(entry.from, []);
            outgoing.get(entry.from).push(entry);
        }
        return {
            ...trace,
            ids: [...connected],
            distance,
            edges,
            directEdges,
            outgoing,
            depth: distance.size ? Math.max(...distance.values()) : 0,
            hiddenNodeCount: trace.ids.length - connected.size,
            hiddenEdgeCount: trace.edges.length - edges.length
        };
    }

    function renderTrustLegend() {
        if (!trustLegendEl) return;
        trustLegendEl.replaceChildren();
        const groups = [
            ['Nodes', Object.values(trustModel.NODE_TRUST)],
            ['Edges', Object.values(trustModel.EDGE_TRUST)]
        ];
        for (const [label, entries] of groups) {
            const group = document.createElement('div');
            group.className = 'demo-trust-legend-group';
            const heading = document.createElement('strong');
            heading.textContent = label;
            group.appendChild(heading);
            for (const entry of entries) {
                const row = document.createElement('span');
                row.className = 'demo-trust-legend-row';
                row.appendChild(createTrustBadge(label === 'Nodes' ? 'node' : 'edge', entry, { compact: true }));
                const text = document.createElement('span');
                text.textContent = entry.description;
                row.appendChild(text);
                group.appendChild(row);
            }
            trustLegendEl.appendChild(group);
        }
    }

    function bestEdgeForNode(edges) {
        return edges
            .slice()
            .sort((a, b) => {
                const rankDiff = edgeRank(a.edge?.type) - edgeRank(b.edge?.type);
                if (rankDiff !== 0) return rankDiff;
                return (b.edge?.confidence ?? 0) - (a.edge?.confidence ?? 0);
            })[0];
    }

    function buildTargetTrace(id) {
        const target = graph.byId.get(id);
        if (!target) return null;

        const distance = new Map([[id, 0]]);
        const edgeEntries = [];
        const edgeKeySet = new Set();
        const queue = [id];

        for (let index = 0; index < queue.length; index += 1) {
            const currentId = queue[index];
            const current = graph.byId.get(currentId);
            const currentDistance = distance.get(currentId) || 0;
            for (const edge of getDependencyEdges(current)) {
                const prereqId = edge.prerequisite;
                if (!graph.byId.has(prereqId)) continue;
                const key = `${prereqId}->${currentId}`;
                if (!edgeKeySet.has(key)) {
                    edgeKeySet.add(key);
                    edgeEntries.push({ from: prereqId, to: currentId, edge });
                }
                const nextDistance = currentDistance + 1;
                if (!distance.has(prereqId) || nextDistance < distance.get(prereqId)) {
                    distance.set(prereqId, nextDistance);
                    queue.push(prereqId);
                }
            }
        }

        const ids = [...distance.keys()];
        const directEdges = getDependencyEdges(target)
            .filter(edge => graph.byId.has(edge.prerequisite))
            .map(edge => ({ from: edge.prerequisite, to: id, edge }))
            .sort((a, b) => {
                const rankDiff = edgeRank(a.edge?.type) - edgeRank(b.edge?.type);
                if (rankDiff !== 0) return rankDiff;
                return graph.byId.get(a.from).name.localeCompare(graph.byId.get(b.from).name);
            });

        const outgoing = new Map();
        for (const entry of edgeEntries) {
            if (!outgoing.has(entry.from)) outgoing.set(entry.from, []);
            outgoing.get(entry.from).push(entry);
        }

        return {
            target,
            ids,
            distance,
            edges: edgeEntries,
            directEdges,
            outgoing,
            depth: Math.max(...distance.values())
        };
    }

    function longestDependencyChain(trace) {
        const incoming = new Map();
        for (const entry of trace.edges) {
            if (!incoming.has(entry.to)) incoming.set(entry.to, []);
            incoming.get(entry.to).push(entry);
        }
        const memo = new Map();
        function walk(id, seen = new Set()) {
            if (memo.has(id)) return memo.get(id);
            if (seen.has(id)) return [id];
            const nextSeen = new Set(seen);
            nextSeen.add(id);
            const choices = (incoming.get(id) || []).map(entry => [...walk(entry.from, nextSeen), id]);
            const best = choices.sort((a, b) => b.length - a.length)[0] || [id];
            memo.set(id, best);
            return best;
        }
        return walk(trace.target.id);
    }

    function compactTraceIds(trace, limit = 42) {
        if (trace.ids.length <= limit) return trace.ids;
        const required = new Set([trace.target.id]);
        for (const entry of trace.directEdges) required.add(entry.from);
        for (const id of longestDependencyChain(trace)) required.add(id);

        const remaining = trace.ids
            .filter(id => !required.has(id))
            .sort((a, b) => {
                const distanceDiff = (trace.distance.get(a) || 0) - (trace.distance.get(b) || 0);
                if (distanceDiff !== 0) return distanceDiff;
                const edgeA = bestEdgeForNode(trace.outgoing.get(a) || [])?.edge;
                const edgeB = bestEdgeForNode(trace.outgoing.get(b) || [])?.edge;
                const rankDiff = edgeRank(edgeA?.type) - edgeRank(edgeB?.type);
                if (rankDiff !== 0) return rankDiff;
                const itemA = graph.byId.get(a);
                const itemB = graph.byId.get(b);
                const dateDiff = (itemA.firstKnownDate ?? 99999) - (itemB.firstKnownDate ?? 99999);
                if (dateDiff !== 0) return dateDiff;
                return itemA.name.localeCompare(itemB.name);
            });
        return [...required, ...remaining.slice(0, Math.max(0, limit - required.size))];
    }

    function parseTargetValue(value) {
        const trimmed = value.trim();
        if (!trimmed) return null;
        const bracketMatch = trimmed.match(/\[([a-z0-9_]+)\]$/);
        if (bracketMatch && graph.byId.has(bracketMatch[1])) return bracketMatch[1];
        if (graph.byId.has(trimmed)) return trimmed;
        const normalized = trimmed.toLowerCase();
        const exactName = techData.find(item => item.name.toLowerCase() === normalized);
        if (exactName) return exactName.id;
        const partial = techData.find(item => item.name.toLowerCase().includes(normalized) || item.id.includes(normalized.replace(/\s+/g, '_')));
        return partial?.id || null;
    }

    function renderMetrics(items) {
        metricsEl.replaceChildren();
        const sourceChecked = items.filter(item => item.reviewStatus === 'source_checked').length;
        const highTrust = items.filter(item => nodeTrust(item).level === 'high').length;
        const futureTrust = items.filter(item => nodeTrust(item).level === 'future').length;
        const roadmapCount = getRoadmapItems(items).length;
        const edgeCount = items.reduce((sum, item) => sum + getDependencyEdges(item).length, 0);
        const metrics = [
            ['Nodes', items.length],
            ['High Trust', highTrust],
            ['Source Checked', sourceChecked],
            ['Future', futureTrust || roadmapCount],
            ['Edges', edgeCount]
        ];
        for (const [label, value] of metrics) {
            const metric = document.createElement('div');
            metric.className = 'demo-metric';
            const number = document.createElement('strong');
            number.textContent = value.toLocaleString();
            const caption = document.createElement('span');
            caption.textContent = label;
            metric.append(number, caption);
            metricsEl.appendChild(metric);
        }
    }

    function renderQualitySnapshot(snapshot) {
        if (!qualitySnapshotEl) return;
        qualitySnapshotEl.replaceChildren();

        const metrics = Array.isArray(snapshot?.metrics) ? snapshot.metrics : [];
        if (!metrics.length) {
            const row = document.createElement('div');
            const caption = document.createElement('span');
            caption.textContent = 'Snapshot';
            const value = document.createElement('strong');
            value.textContent = 'Unavailable';
            row.append(caption, value);
            qualitySnapshotEl.appendChild(row);
            return;
        }

        for (const metric of metrics) {
            const row = document.createElement('div');
            const caption = document.createElement('span');
            caption.textContent = metric.label;
            const number = document.createElement('strong');
            number.textContent = metric.formatted;
            row.append(caption, number);
            qualitySnapshotEl.appendChild(row);
        }
    }

    function appendHeroStat(parent, label, value) {
        const stat = document.createElement('div');
        const number = document.createElement('strong');
        number.textContent = value;
        const caption = document.createElement('span');
        caption.textContent = label;
        stat.append(number, caption);
        parent.appendChild(stat);
    }

    function compactHeroChain(chain, limit = 6) {
        if (chain.length <= limit) return chain;
        const picks = [
            chain[0],
            chain[1],
            chain[Math.floor(chain.length * 0.45)],
            ...chain.slice(-3)
        ];
        return [...new Set(picks)].filter(Boolean).slice(0, limit);
    }

    function createSvgElement(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }

    function getStoryPrerequisiteLimit() {
        const width = window.innerWidth || 1200;
        if (width < 560) return 2;
        if (width < 900) return 3;
        return 4;
    }

    function getStoryXBounds() {
        const width = window.innerWidth || 1200;
        if (width < 560) return { start: 170, span: 640 };
        if (width < 900) return { start: 150, span: 700 };
        return { start: 145, span: 710 };
    }

    function getStoryUnlockLimit() {
        const width = window.innerWidth || 1200;
        if (width < 560) return 1;
        if (width < 900) return 2;
        return 3;
    }

    function shortenStoryLabel(label, limit = 22) {
        if (!label || label.length <= limit) return label || '';
        const trimmed = label.slice(0, limit - 3).trimEnd();
        return `${trimmed}...`;
    }

    function shortenStoryText(text, limit = 132) {
        const normalized = String(text || '').replace(/\s+/g, ' ').trim();
        if (!normalized || normalized.length <= limit) return normalized;
        return `${normalized.slice(0, limit - 3).trimEnd()}...`;
    }

    function sourceCountLabel(edge) {
        const count = Array.isArray(edge?.sources)
            ? edge.sources.filter(source => Array.isArray(source.supports) && source.supports.includes('edge')).length
            : 0;
        return count ? `${count} edge source${count === 1 ? '' : 's'}` : 'no edge source';
    }

    function storySummaryForTrace(trace, eras, requiredEdges, contextualEdges, hiddenNote) {
        const storyIds = getStoryPointIds(trace);
        const first = graph.byId.get(storyIds[0]);
        const middle = storyIds.length > 3 ? graph.byId.get(storyIds[Math.floor(storyIds.length / 2)]) : null;
        const startLabel = first && first.id !== trace.target.id ? first.name : 'foundational tools';
        const middlePhrase = middle && middle.id !== trace.target.id
            ? ` through ${middle.name}`
            : '';
        const edgePhrase = requiredEdges && contextualEdges
            ? `${requiredEdges} hard prerequisites and ${contextualEdges} contextual enablers`
            : requiredEdges
                ? `${requiredEdges} hard prerequisites`
                : `${contextualEdges} contextual enablers`;
        return `Watch ${startLabel}${middlePhrase} become ${trace.target.name}. The visible stack compresses ${Math.max(0, trace.ids.length - 1)} prerequisite technologies across ${eras} eras, with ${edgePhrase}. ${hiddenNote}`.trim();
    }

    function storyBeatText(point, trace, edge) {
        if (point.target) {
            const sourcedEdges = trace.edges.filter(entry => hasEdgeSource(entry.edge)).length;
            return `${trace.target.name} is the payoff: ${Math.max(0, trace.ids.length - 1)} visible prerequisites converge, and ${sourcedEdges}/${trace.edges.length} dependency edges in this trace have receipts.`;
        }
        if (edge?.note) {
            return `Why it matters: ${shortenStoryText(edge.note, 170)}`;
        }
        if (point.item.description) {
            return shortenStoryText(point.item.description, 170);
        }
        return 'A selected milestone in the build path for this target.';
    }

    function scoreStoryCandidate(id, trace, directEdgeById, chainSet) {
        const item = graph.byId.get(id);
        if (!item) return -Infinity;
        const sameField = hasField(item, currentField);
        let score = sameField ? 110 : -90;
        const directEdge = directEdgeById.get(id);
        if (directEdge) {
            score += 84 - edgeRank(directEdge.type) * 5;
            score += Math.round((directEdge.confidence || 0) * 20);
        }
        if (chainSet.has(id)) score += 36;
        if (getLane(item, currentField) && getLane(item, currentField) !== 'General') score += 14;
        if (item.reviewStatus === 'source_checked') score += 8;
        if (Array.isArray(item.sources) && item.sources.length) score += 5;
        const targetDate = trace.target.firstKnownDate;
        if (typeof targetDate === 'number' && typeof item.firstKnownDate === 'number') {
            const gap = targetDate - item.firstKnownDate;
            if (gap >= 0 && gap <= 120) score += 16;
            if (gap > 1200) score -= 54;
            if (gap < 0) score -= 80;
        }
        return score;
    }

    function rankedStoryCandidates(ids, trace, directEdgeById, chainSet) {
        return [...new Set(ids)]
            .filter(id => id !== trace.target.id && graph.byId.has(id))
            .map(id => ({ id, score: scoreStoryCandidate(id, trace, directEdgeById, chainSet) }))
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return compareDate(graph.byId.get(a.id), graph.byId.get(b.id));
            })
            .map(entry => entry.id);
    }

    function compactStorySelection(selected, limit) {
        const unique = [...new Set(selected)].filter(Boolean);
        if (unique.length <= limit) return unique;
        if (limit <= 1) return unique.slice(-1);
        if (limit === 2) return [...new Set([unique[1] || unique[0], unique[unique.length - 1]])].slice(0, limit);
        return [...new Set([unique[0], unique[1], ...unique.slice(-(limit - 2))])].slice(0, limit);
    }

    function getStoryPointIds(trace) {
        const targetId = trace.target.id;
        const prerequisiteLimit = getStoryPrerequisiteLimit();
        const directEdgeById = new Map(trace.directEdges.map(entry => [entry.from, entry.edge]));
        const chainIds = longestDependencyChain(trace).filter(id => id !== targetId);
        const chainSet = new Set(chainIds);
        const fieldIds = trace.ids.filter(id => id !== targetId && hasField(graph.byId.get(id), currentField));
        const candidatePool = fieldIds.length >= 2 ? fieldIds : trace.ids.filter(id => id !== targetId);
        const selected = [];

        function addCandidate(id) {
            if (!id || id === targetId || selected.includes(id) || !graph.byId.has(id)) return;
            selected.push(id);
        }

        const fieldByDate = fieldIds
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)));
        addCandidate(fieldByDate[0]);

        const rankedChain = rankedStoryCandidates(chainIds, trace, directEdgeById, chainSet);
        const rankedNonDirectChain = rankedStoryCandidates(
            chainIds.filter(id => !directEdgeById.has(id)),
            trace,
            directEdgeById,
            chainSet
        );
        addCandidate(rankedNonDirectChain[0] || rankedChain[0]);

        const rankedDirect = rankedStoryCandidates(
            trace.directEdges.map(entry => entry.from),
            trace,
            directEdgeById,
            chainSet
        );
        for (const id of rankedDirect.slice(0, 2)) addCandidate(id);

        const rankedPool = rankedStoryCandidates(candidatePool, trace, directEdgeById, chainSet);
        for (const id of rankedPool) {
            if (selected.length >= prerequisiteLimit) break;
            addCandidate(id);
        }

        const prereqs = compactStorySelection(selected, prerequisiteLimit)
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)));
        return [...prereqs, targetId];
    }

    function buildStoryPoints(trace) {
        const ids = getStoryPointIds(trace);
        const span = Math.max(1, ids.length - 1);
        const xBounds = getStoryXBounds();
        return ids.map((id, index) => {
            const item = graph.byId.get(id);
            const eraIndex = eraOrder[item.era] ?? 5;
            const baseY = 82 + Math.min(6, eraIndex) * 22;
            const wave = index % 2 === 0 ? -8 : 8;
            const target = id === trace.target.id;
            return {
                id,
                item,
                target,
                x: ids.length === 1 ? 500 : xBounds.start + (index * xBounds.span) / span,
                y: target ? 176 : Math.max(68, Math.min(226, baseY + wave)),
                color: storyEraColors[item.era] || storyEraColors.Unknown
            };
        });
    }

    function buildStoryPath(points) {
        return points.map((point, index) => {
            if (index === 0) return `M ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
            const previous = points[index - 1];
            const midX = (previous.x + point.x) / 2;
            return `C ${midX.toFixed(1)} ${previous.y.toFixed(1)} ${midX.toFixed(1)} ${point.y.toFixed(1)} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`;
        }).join(' ');
    }

    function buildStoryUnlockPoints(trace, points) {
        const limit = getStoryUnlockLimit();
        if (!limit) return [];
        const targetPoint = points.find(point => point.target) || points[points.length - 1];
        const unlocks = getUnlockEntries(trace).slice(0, limit);
        const mobile = (window.innerWidth || 1200) < 560;
        const tablet = (window.innerWidth || 1200) < 900;
        const layouts = mobile
            ? [{ x: 492, y: 70 }]
            : tablet
                ? [{ x: 650, y: 62 }, { x: 820, y: 92 }]
                : [{ x: 670, y: 62 }, { x: 810, y: 78 }, { x: 925, y: 112 }];
        return unlocks.map((entry, index) => ({
            ...entry,
            targetPoint,
            x: layouts[index]?.x ?? 830,
            y: layouts[index]?.y ?? 82,
            color: storyEraColors[entry.item.era] || storyEraColors.Future
        }));
    }

    function getStoryBeatEdge(point, trace, directEdgeById) {
        if (point.target) return null;
        const directEdge = directEdgeById.get(point.id);
        if (directEdge) return directEdge;
        const outgoing = trace.outgoing.get(point.id) || [];
        return bestEdgeForNode(outgoing)?.edge || null;
    }

    function appendStorySvg(parent, points, unlockPoints = []) {
        const svg = createSvgElement('svg');
        svg.classList.add('demo-story-svg');
        svg.setAttribute('viewBox', '0 0 1000 360');
        svg.setAttribute('preserveAspectRatio', 'none');
        svg.setAttribute('aria-hidden', 'true');

        const defs = createSvgElement('defs');
        const gradient = createSvgElement('linearGradient');
        gradient.setAttribute('id', 'demo-story-gradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('x2', '100%');
        [
            ['0%', '#7fd4ca'],
            ['42%', '#f0a94a'],
            ['72%', '#5ba7d9'],
            ['100%', '#d78df0']
        ].forEach(([offset, color]) => {
            const stop = createSvgElement('stop');
            stop.setAttribute('offset', offset);
            stop.setAttribute('stop-color', color);
            gradient.appendChild(stop);
        });
        defs.appendChild(gradient);
        svg.appendChild(defs);

        const usedEras = [...new Set(points.map(point => point.item.era || 'Unknown'))]
            .sort((a, b) => (eraOrder[a] ?? 99) - (eraOrder[b] ?? 99));
        for (const era of usedEras) {
            const eraIndex = eraOrder[era] ?? 5;
            const y = 82 + Math.min(6, eraIndex) * 22;
            const line = createSvgElement('line');
            line.classList.add('demo-story-era-track');
            line.setAttribute('x1', '44');
            line.setAttribute('x2', '956');
            line.setAttribute('y1', String(y));
            line.setAttribute('y2', String(y));
            svg.appendChild(line);

            const label = createSvgElement('text');
            label.classList.add('demo-story-era-label');
            label.setAttribute('x', '46');
            label.setAttribute('y', String(y - 7));
            label.textContent = era;
            svg.appendChild(label);
        }

        const pathData = buildStoryPath(points);
        const shadow = createSvgElement('path');
        shadow.classList.add('demo-story-path-back');
        shadow.setAttribute('d', pathData);
        svg.appendChild(shadow);

        const path = createSvgElement('path');
        path.id = 'demo-story-motion-path';
        path.classList.add('demo-story-path');
        path.setAttribute('d', pathData);
        svg.appendChild(path);

        for (const unlock of unlockPoints) {
            const link = createSvgElement('path');
            link.classList.add('demo-story-unlock-link');
            const start = unlock.targetPoint;
            const midX = (start.x + unlock.x) / 2;
            link.setAttribute('d', `M ${start.x.toFixed(1)} ${start.y.toFixed(1)} C ${midX.toFixed(1)} ${start.y.toFixed(1)} ${midX.toFixed(1)} ${unlock.y.toFixed(1)} ${unlock.x.toFixed(1)} ${unlock.y.toFixed(1)}`);
            svg.appendChild(link);
        }

        for (let index = 0; index < 3; index += 1) {
            const pulse = createSvgElement('circle');
            pulse.classList.add('demo-story-pulse');
            pulse.setAttribute('r', String(index === 0 ? 7 : 5));
            const motion = createSvgElement('animateMotion');
            motion.setAttribute('dur', '6.2s');
            motion.setAttribute('begin', `${index * 1.6}s`);
            motion.setAttribute('repeatCount', 'indefinite');
            const mpath = createSvgElement('mpath');
            mpath.setAttribute('href', '#demo-story-motion-path');
            mpath.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#demo-story-motion-path');
            motion.appendChild(mpath);
            pulse.appendChild(motion);
            svg.appendChild(pulse);
        }

        parent.appendChild(svg);
    }

    function renderStoryStage(trace) {
        if (!storyStageEl) return;
        if (storyTimerId) {
            window.clearInterval(storyTimerId);
            storyTimerId = null;
        }
        storyStageEl.replaceChildren();
        const points = buildStoryPoints(trace);
        if (!points.length) return;
        const directEdgeById = new Map(trace.directEdges.map(entry => [entry.from, entry.edge]));
        const unlockPoints = buildStoryUnlockPoints(trace, points);

        appendStorySvg(storyStageEl, points, unlockPoints);

        const nodeLayer = document.createElement('div');
        nodeLayer.className = 'demo-story-node-layer';
        const nodeButtons = [];
        points.forEach((point, index) => {
            const button = createTechButton(point.item, 'demo-story-node-button');
            if (point.target) button.classList.add('is-target');
            button.style.left = `${point.x / 10}%`;
            button.style.top = `${point.y / 3.6}%`;
            button.style.setProperty('--story-color', point.color);
            button.style.setProperty('--story-index', String(index));

            const date = document.createElement('span');
            date.className = 'demo-story-node-date';
            date.textContent = formatDate(point.item.firstKnownDate);
            const name = document.createElement('strong');
            name.textContent = shortenStoryLabel(point.item.name, point.target ? 26 : 20);
            const era = document.createElement('span');
            era.className = 'demo-story-node-era';
            era.textContent = point.item.era || 'Unknown';
            button.append(date, name, era);
            appendNodeTrustBadge(button, point.item, { compact: true });
            button.addEventListener('mouseenter', () => setActiveStoryBeat(index));
            nodeButtons.push(button);
            nodeLayer.appendChild(button);
        });
        storyStageEl.appendChild(nodeLayer);

        if (unlockPoints.length) {
            const unlockLayer = document.createElement('div');
            unlockLayer.className = 'demo-story-unlock-layer';
            for (const unlock of unlockPoints) {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'demo-story-unlock-node';
                button.dataset.techId = unlock.item.id;
                button.style.left = `${unlock.x / 10}%`;
                button.style.top = `${unlock.y / 3.6}%`;
                button.style.setProperty('--story-color', unlock.color);
                button.addEventListener('click', () => setTarget(unlock.item.id));

                const meta = document.createElement('span');
                meta.textContent = `${formatDate(unlock.item.firstKnownDate)} unlock`;
                const title = document.createElement('strong');
                title.textContent = shortenStoryLabel(unlock.item.name, 18);
                button.append(meta, title);
                unlockLayer.appendChild(button);
            }
            storyStageEl.appendChild(unlockLayer);
        }

        const beat = document.createElement('div');
        beat.className = 'demo-story-beat';
        const beatMeta = document.createElement('span');
        const beatTitle = document.createElement('strong');
        const beatText = document.createElement('p');
        const beatTrust = document.createElement('div');
        beatTrust.className = 'demo-story-trust';
        const beatProgress = document.createElement('div');
        beatProgress.className = 'demo-story-progress';
        const progressSteps = points.map((point, index) => {
            const step = document.createElement('button');
            step.type = 'button';
            step.style.setProperty('--story-color', point.color);
            step.setAttribute('aria-label', `Show story beat ${index + 1}: ${point.item.name}`);
            step.addEventListener('click', () => setActiveStoryBeat(index));
            beatProgress.appendChild(step);
            return step;
        });
        beat.append(beatMeta, beatTitle, beatText, beatTrust, beatProgress);
        storyStageEl.appendChild(beat);

        let activeStoryIndex = 0;
        function setActiveStoryBeat(index) {
            activeStoryIndex = index;
            const point = points[index];
            const directEdge = directEdgeById.get(point.id);
            const beatEdge = getStoryBeatEdge(point, trace, directEdgeById);
            const role = point.target
                ? 'Target'
                : directEdge
                    ? edgeKind(directEdge)
                    : getLane(point.item, currentField);
            beatMeta.textContent = `Scene ${index + 1}/${points.length} · ${role} · ${formatDate(point.item.firstKnownDate)}`;
            beatTitle.textContent = point.item.name;
            beatText.textContent = storyBeatText(point, trace, beatEdge);
            beatTrust.replaceChildren();
            const trustItems = point.target
                ? [
                    ['Node', nodeTrust(point.item).label],
                    ['Sources', `${point.item.sources?.length || 0} node source${point.item.sources?.length === 1 ? '' : 's'}`],
                    ['Edge Sources', `${trace.edges.filter(entry => hasEdgeSource(entry.edge)).length}/${trace.edges.length}`]
                ]
                : [
                    ['Edge', beatEdge ? edgeTrust(beatEdge).label : 'Context'],
                    ['Confidence', beatEdge ? formatConfidence(beatEdge.confidence) : 'n/a'],
                    ['Evidence', beatEdge?.evidence_level ? formatStatus(beatEdge.evidence_level) : 'not specified'],
                    ['Sources', sourceCountLabel(beatEdge)]
                ];
            for (const [label, value] of trustItems) {
                const pill = document.createElement('span');
                pill.textContent = `${label}: ${value}`;
                beatTrust.appendChild(pill);
            }
            nodeButtons.forEach((button, buttonIndex) => button.classList.toggle('is-active-story', buttonIndex === index));
            progressSteps.forEach((step, stepIndex) => step.classList.toggle('is-active-story', stepIndex === index));
        }

        setActiveStoryBeat(0);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!reduceMotion && points.length > 1) {
            storyTimerId = window.setInterval(() => {
                setActiveStoryBeat((activeStoryIndex + 1) % points.length);
            }, 2600);
        }
    }

    function createHeroStep(id, trace) {
        const item = graph.byId.get(id);
        const button = createTechButton(item, 'demo-hero-step');
        if (id === trace.target.id) button.classList.add('is-target');
        const meta = document.createElement('span');
        meta.className = 'demo-hero-step-meta';
        meta.textContent = [formatDate(item.firstKnownDate), item.era].filter(Boolean).join(' · ');
        const name = document.createElement('strong');
        name.textContent = item.name;
        const lane = document.createElement('span');
        lane.className = 'demo-hero-step-lane';
        lane.textContent = getLane(item, currentField);
        button.append(meta, name, lane);
        appendNodeTrustBadge(button, item, { compact: true });
        return button;
    }

    function renderHeroChain(trace) {
        if (!heroChainEl) return;
        heroChainEl.replaceChildren();
        const chain = compactHeroChain(getStoryPointIds(trace));
        chain.forEach((id, index) => {
            if (index > 0) {
                const connector = document.createElement('span');
                connector.className = 'demo-hero-chain-link';
                connector.setAttribute('aria-hidden', 'true');
                heroChainEl.appendChild(connector);
            }
            heroChainEl.appendChild(createHeroStep(id, trace));
        });
    }

    function renderHeroEdges(trace) {
        if (!heroEdgesEl) return;
        heroEdgesEl.replaceChildren();
        if (!trace.directEdges.length) {
            const empty = document.createElement('span');
            empty.className = 'demo-hero-empty';
            empty.textContent = trace.hiddenEdgeCount ? 'Hidden by trust filter' : 'No direct dependencies';
            heroEdgesEl.appendChild(empty);
            return;
        }

        const visibleDirectEdges = trace.directEdges.filter(entry => {
            const dependent = graph.byId.get(entry.to);
            const prerequisite = graph.byId.get(entry.from);
            return isEdgeVisibleByTrust(entry.edge, dependent, prerequisite);
        });
        if (!visibleDirectEdges.length) {
            const empty = document.createElement('span');
            empty.className = 'demo-hero-empty';
            empty.textContent = 'Hidden by trust filter';
            heroEdgesEl.appendChild(empty);
            return;
        }

        for (const entry of visibleDirectEdges.slice(0, 4)) {
            const prereq = graph.byId.get(entry.from);
            const button = createTechButton(prereq, 'demo-hero-edge-button');
            button.dataset.edgeType = entry.edge.type || 'enabling';
            button.dataset.edgeTrust = edgeTrust(entry.edge).level;
            const title = document.createElement('strong');
            title.textContent = prereq.name;
            const meta = document.createElement('span');
            meta.textContent = [
                edgeKind(entry.edge),
                formatConfidence(entry.edge.confidence),
                entry.edge.evidence_level && formatStatus(entry.edge.evidence_level)
            ].filter(Boolean).join(' · ');
            button.append(title, meta);
            appendEdgeTrustBadge(button, entry.edge, { compact: true });
            heroEdgesEl.appendChild(button);
        }

        if (visibleDirectEdges.length > 4) {
            const more = document.createElement('span');
            more.className = 'demo-hero-more';
            more.textContent = `+${visibleDirectEdges.length - 4} more`;
            heroEdgesEl.appendChild(more);
        }
    }

    function getUnlockEntries(trace) {
        return (graph.dependents.get(trace.target.id) || [])
            .map(id => {
                const item = graph.byId.get(id);
                const edge = item && getDependencyEdges(item).find(entry => entry.prerequisite === trace.target.id);
                return item && edge ? { item, edge } : null;
            })
            .filter(Boolean)
            .filter(entry => isNodeVisibleByTrust(entry.item)
                && isEdgeVisibleByTrust(entry.edge, entry.item, trace.target))
            .sort((a, b) => {
                const fieldDiff = Number(!hasField(a.item, currentField)) - Number(!hasField(b.item, currentField));
                if (fieldDiff !== 0) return fieldDiff;
                const typeDiff = edgeRank(a.edge.type) - edgeRank(b.edge.type);
                if (typeDiff !== 0) return typeDiff;
                const confidenceDiff = (b.edge.confidence || 0) - (a.edge.confidence || 0);
                if (confidenceDiff !== 0) return confidenceDiff;
                const dateDiff = (a.item.firstKnownDate ?? 99999) - (b.item.firstKnownDate ?? 99999);
                if (dateDiff !== 0) return dateDiff;
                return a.item.name.localeCompare(b.item.name);
            });
    }

    function renderHeroUnlocks(trace) {
        if (!heroUnlocksEl) return;
        heroUnlocksEl.replaceChildren();
        const unlocks = getUnlockEntries(trace);
        if (!unlocks.length) {
            const empty = document.createElement('span');
            empty.className = 'demo-hero-empty';
            empty.textContent = 'No downstream technologies recorded';
            heroUnlocksEl.appendChild(empty);
            return;
        }

        for (const entry of unlocks.slice(0, 4)) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'demo-hero-unlock-button';
            button.dataset.techId = entry.item.id;
            button.dataset.edgeType = entry.edge.type || 'enabling';
            button.dataset.edgeTrust = edgeTrust(entry.edge).level;
            button.addEventListener('click', () => setTarget(entry.item.id));

            const title = document.createElement('strong');
            title.textContent = entry.item.name;
            const meta = document.createElement('span');
            meta.textContent = [
                formatDate(entry.item.firstKnownDate),
                getLane(entry.item, currentField),
                edgeKind(entry.edge)
            ].filter(Boolean).join(' · ');
            button.append(title, meta);
            appendEdgeTrustBadge(button, entry.edge, { compact: true });
            heroUnlocksEl.appendChild(button);
        }

        if (unlocks.length > 4) {
            const more = document.createElement('span');
            more.className = 'demo-hero-more';
            more.textContent = `+${unlocks.length - 4} more`;
            heroUnlocksEl.appendChild(more);
        }
    }

    function renderHero(items = getFieldItems(currentField)) {
        if (!heroTitleEl || !graph) return;
        const focusId = targetId || selectedId || defaultFocus[currentField] || pickDefaultSelection(items);
        const rawTrace = focusId && graph.byId.has(focusId) ? buildTargetTrace(focusId) : null;
        const trace = applyTrustFilterToTrace(rawTrace);
        if (!rawTrace) return;
        if (!trace) {
            heroTitleEl.textContent = `Trust filter hides ${rawTrace.target.name}`;
            heroSummaryEl.textContent = 'Switch to All trust levels to inspect this target.';
            heroTargetEl.textContent = rawTrace.target.name;
            heroStatsEl.replaceChildren();
            storyStageEl?.replaceChildren();
            heroChainEl?.replaceChildren();
            heroEdgesEl?.replaceChildren();
            heroUnlocksEl?.replaceChildren();
            return;
        }

        const eras = new Set(trace.ids.map(id => graph.byId.get(id)?.era).filter(Boolean)).size;
        const sourcedEdges = trace.edges.filter(entry => hasEdgeSource(entry.edge)).length;
        const requiredEdges = trace.edges.filter(entry => entry.edge.type === 'required').length;
        const contextualEdges = trace.edges.length - requiredEdges;
        const region = trace.target.region || 'region unknown';

        const hiddenNote = trace.hiddenNodeCount || trace.hiddenEdgeCount
            ? `Filter hides ${trace.hiddenNodeCount} nodes and ${trace.hiddenEdgeCount} edges.`
            : '';
        heroTitleEl.textContent = `${trace.target.name}: the inventions underneath`;
        heroSummaryEl.textContent = storySummaryForTrace(trace, eras, requiredEdges, contextualEdges, hiddenNote);
        heroFieldEl.textContent = currentField;
        heroTargetEl.textContent = `${formatDate(trace.target.firstKnownDate)} · ${region}`;

        heroStatsEl.replaceChildren();
        appendHeroStat(heroStatsEl, 'Prerequisites', Math.max(0, trace.ids.length - 1).toLocaleString());
        appendHeroStat(heroStatsEl, 'Max Depth', trace.depth.toLocaleString());
        appendHeroStat(heroStatsEl, 'Edge Sources', `${sourcedEdges}/${trace.edges.length}`);
        appendHeroStat(heroStatsEl, 'Direct Edges', trace.directEdges.length.toLocaleString());

        renderStoryStage(trace);
        renderHeroChain(trace);
        renderHeroEdges(trace);
        renderHeroUnlocks(trace);
    }

    function renderNextCandidates(items) {
        nextListEl.replaceChildren();
        const candidates = getRoadmapItems(items).filter(isNodeVisibleByTrust).slice(0, 6);
        if (!candidates.length) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = currentTrustFilter === 'no-future'
                ? 'Roadmap nodes hidden by trust filter'
                : 'No roadmap nodes';
            nextListEl.appendChild(empty);
            return;
        }
        for (const item of candidates) {
            const card = createTechButton(item, 'demo-next-card');
            const title = document.createElement('strong');
            title.textContent = item.name;
            const meta = document.createElement('span');
            meta.textContent = [
                formatDate(item.firstKnownDate),
                item.roadmap?.timeframe || item.maturity || item.era
            ].filter(Boolean).join(' · ');
            card.append(title, meta);
            appendNodeTrustBadge(card, item, { compact: true });
            if (item.roadmap?.rationale) {
                const rationale = document.createElement('p');
                rationale.textContent = item.roadmap.rationale;
                card.appendChild(rationale);
            }
            nextListEl.appendChild(card);
        }
    }

    function renderLanes(items) {
        lanesEl.replaceChildren();
        const query = (searchInput?.value || '').trim().toLowerCase();
        const filtered = query
            ? items.filter(item => `${item.name} ${item.id} ${item.description || ''}`.toLowerCase().includes(query))
            : items;
        const groups = new Map();
        for (const item of filtered) {
            const lane = getLane(item, currentField);
            if (!groups.has(lane)) groups.set(lane, []);
            groups.get(lane).push(item);
        }
        const orderedLanes = [
            ...(laneOrder[currentField] || []),
            ...[...groups.keys()].filter(lane => !(laneOrder[currentField] || []).includes(lane)).sort()
        ].filter(lane => groups.has(lane));

        if (!orderedLanes.length) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = currentTrustFilter === 'all'
                ? 'No matching technologies'
                : 'No matching technologies at this trust level';
            lanesEl.appendChild(empty);
            return;
        }

        for (const lane of orderedLanes) {
            const laneEl = document.createElement('section');
            laneEl.className = 'demo-lane';
            const heading = document.createElement('h3');
            heading.textContent = `${lane} (${groups.get(lane).length})`;
            laneEl.appendChild(heading);

            const list = document.createElement('div');
            list.className = 'demo-chip-list';
            for (const item of groups.get(lane).sort(compareDate)) {
                const chip = createTechButton(item, 'demo-tech-chip');
                if (item.maturity) chip.dataset.maturity = item.maturity;
                const date = document.createElement('span');
                date.className = 'demo-chip-date';
                date.textContent = formatDate(item.firstKnownDate);
                const name = document.createElement('strong');
                name.textContent = item.name;
                chip.append(date, name);
                appendNodeTrustBadge(chip, item, { compact: true });
                list.appendChild(chip);
            }
            laneEl.appendChild(list);
            lanesEl.appendChild(laneEl);
        }
    }

    function appendTraceStat(parent, label, value) {
        const item = document.createElement('div');
        item.className = 'demo-trace-stat';
        const number = document.createElement('strong');
        number.textContent = value;
        const caption = document.createElement('span');
        caption.textContent = label;
        item.append(number, caption);
        parent.appendChild(item);
    }

    function createTraceChip(id, trace, className = 'demo-target-chip') {
        const item = graph.byId.get(id);
        const button = createTechButton(item, className);
        const relatedEdge = bestEdgeForNode(trace.outgoing.get(id) || []);
        if (relatedEdge?.edge?.type) button.dataset.edgeType = relatedEdge.edge.type;
        if (id === trace.target.id) button.classList.add('is-target');

        const date = document.createElement('span');
        date.className = 'demo-chip-date';
        date.textContent = formatDate(item.firstKnownDate);
        const name = document.createElement('strong');
        name.textContent = item.name;
        const meta = document.createElement('span');
        meta.className = 'demo-target-chip-meta';
        const distance = trace.distance.get(id) || 0;
        meta.textContent = id === trace.target.id
            ? 'Target'
            : `${distance} ${distance === 1 ? 'step' : 'steps'} before target`;
        button.append(date, name, meta);
        appendNodeTrustBadge(button, item, { compact: true });
        return button;
    }

    function renderDirectEdges(parent, trace) {
        const visibleEdges = trace.directEdges.slice(0, 10);
        const section = document.createElement('section');
        section.className = 'demo-target-section';
        const heading = document.createElement('h3');
        heading.textContent = `Direct prerequisites (${trace.directEdges.length})`;
        section.appendChild(heading);

        if (!trace.directEdges.length) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = trace.hiddenEdgeCount ? 'Hidden by trust filter' : 'None';
            section.appendChild(empty);
            parent.appendChild(section);
            return;
        }

        const list = document.createElement('div');
        list.className = 'demo-target-edge-list';
        for (const entry of visibleEdges) {
            const prereq = graph.byId.get(entry.from);
            const row = document.createElement('div');
            row.className = 'demo-target-edge';
            row.dataset.edgeType = entry.edge.type || 'enabling';
            row.dataset.edgeTrust = edgeTrust(entry.edge).level;

            const button = createTechButton(prereq, 'demo-target-edge-button');
            button.textContent = prereq.name;
            row.appendChild(button);

            const meta = document.createElement('span');
            meta.className = 'demo-inline-meta';
            meta.textContent = [
                edgeKind(entry.edge),
                formatConfidence(entry.edge.confidence),
                entry.edge.evidence_level && formatStatus(entry.edge.evidence_level)
            ].filter(Boolean).join(' · ');
            appendEdgeTrustBadge(meta, entry.edge, { compact: true });
            row.appendChild(meta);

            if (entry.edge.note) {
                const note = document.createElement('p');
                note.textContent = entry.edge.note;
                row.appendChild(note);
            }
            list.appendChild(row);
        }
        section.appendChild(list);
        if (visibleEdges.length < trace.directEdges.length) {
            const note = document.createElement('p');
            note.className = 'demo-target-compact-note';
            note.textContent = `Showing the ${visibleEdges.length} strongest direct edges first. Use the selected node panel for full local relationships.`;
            section.appendChild(note);
        }
        parent.appendChild(section);
    }

    function renderLongestChain(parent, trace) {
        const chain = longestDependencyChain(trace);
        if (chain.length <= 1) return;
        const section = document.createElement('section');
        section.className = 'demo-target-section';
        const heading = document.createElement('h3');
        heading.textContent = `Longest chain (${chain.length - 1} edges)`;
        section.appendChild(heading);

        const list = document.createElement('div');
        list.className = 'demo-longest-chain';
        chain.forEach((id, index) => {
            if (index > 0) {
                const arrow = document.createElement('span');
                arrow.className = 'demo-chain-arrow';
                arrow.textContent = '->';
                list.appendChild(arrow);
            }
            list.appendChild(createTraceChip(id, trace, 'demo-longest-chip'));
        });
        section.appendChild(list);
        parent.appendChild(section);
    }

    function renderBuildOrder(parent, trace) {
        const visibleIds = traceExpanded ? trace.ids : compactTraceIds(trace);
        const groups = new Map();
        for (const id of visibleIds) {
            const item = graph.byId.get(id);
            const era = item.era || 'Unknown';
            if (!groups.has(era)) groups.set(era, []);
            groups.get(era).push(id);
        }

        const section = document.createElement('section');
        section.className = 'demo-target-section';
        const heading = document.createElement('h3');
        heading.textContent = 'Compact build order';
        section.appendChild(heading);

        if (visibleIds.length < trace.ids.length) {
            const summary = document.createElement('p');
            summary.className = 'demo-target-compact-note';
            summary.textContent = `Showing ${visibleIds.length} closest, direct, and chain-critical nodes from ${trace.ids.length} total prerequisite nodes.`;
            section.appendChild(summary);
        }

        const grid = document.createElement('div');
        grid.className = 'demo-target-era-grid';
        const orderedEras = Object.keys(eraOrder)
            .filter(era => groups.has(era))
            .concat([...groups.keys()].filter(era => eraOrder[era] === undefined).sort());

        for (const era of orderedEras) {
            const eraEl = document.createElement('section');
            eraEl.className = 'demo-target-era';
            const eraHeading = document.createElement('h4');
            eraHeading.textContent = `${era} (${groups.get(era).length})`;
            eraEl.appendChild(eraHeading);

            const list = document.createElement('div');
            list.className = 'demo-target-chip-list';
            groups.get(era)
                .sort((a, b) => {
                    const itemA = graph.byId.get(a);
                    const itemB = graph.byId.get(b);
                    const dateDiff = (itemA.firstKnownDate ?? 99999) - (itemB.firstKnownDate ?? 99999);
                    if (dateDiff !== 0) return dateDiff;
                    const distanceDiff = (trace.distance.get(b) || 0) - (trace.distance.get(a) || 0);
                    if (distanceDiff !== 0) return distanceDiff;
                    return itemA.name.localeCompare(itemB.name);
                })
                .forEach(id => list.appendChild(createTraceChip(id, trace)));
            eraEl.appendChild(list);
            grid.appendChild(eraEl);
        }
        section.appendChild(grid);

        if (trace.ids.length > visibleIds.length || traceExpanded) {
            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'demo-trace-toggle';
            toggle.textContent = traceExpanded ? 'Show Compact Trace' : `Show All ${trace.ids.length.toLocaleString()} Nodes`;
            toggle.addEventListener('click', () => {
                traceExpanded = !traceExpanded;
                renderTargetPath();
            });
            section.appendChild(toggle);
        }
        parent.appendChild(section);
    }

    function renderTargetPath() {
        lanesEl.replaceChildren();
        const rawTrace = buildTargetTrace(targetId);
        const trace = applyTrustFilterToTrace(rawTrace);
        if (!rawTrace) {
            renderLanes(getVisibleFieldItems(currentField));
            return;
        }
        if (!trace) {
            const hidden = document.createElement('div');
            hidden.className = 'demo-target-path demo-filter-empty';
            const title = document.createElement('h2');
            title.textContent = 'Target hidden by trust filter';
            const text = document.createElement('p');
            text.textContent = 'Switch back to All trust levels or choose a different target to inspect this roadmap area.';
            hidden.append(title, text);
            lanesEl.appendChild(hidden);
            return;
        }

        const requiredEdges = trace.edges.filter(entry => entry.edge.type === 'required').length;
        const speculativeEdges = trace.edges.filter(entry => entry.edge.type === 'speculative').length;
        const sourcedEdges = trace.edges.filter(entry => hasEdgeSource(entry.edge)).length;
        const eras = new Set(trace.ids.map(id => graph.byId.get(id)?.era).filter(Boolean)).size;

        const wrapper = document.createElement('div');
        wrapper.className = 'demo-target-path';

        const header = document.createElement('div');
        header.className = 'demo-target-header';
        const title = document.createElement('h2');
        title.textContent = `Path to ${trace.target.name}`;
        const summary = document.createElement('p');
        const hiddenNote = trace.hiddenNodeCount || trace.hiddenEdgeCount
            ? ` Trust filter hides ${trace.hiddenNodeCount} nodes and ${trace.hiddenEdgeCount} edges from the full trace.`
            : '';
        summary.textContent = `${trace.ids.length - 1} visible prerequisite technologies across ${eras} eras. The view below starts compact: direct edges, the longest chain, then the highest-signal build-order nodes.${hiddenNote}`;
        header.append(title, summary);

        const stats = document.createElement('div');
        stats.className = 'demo-trace-stats';
        appendTraceStat(stats, 'Prerequisite Nodes', (trace.ids.length - 1).toLocaleString());
        appendTraceStat(stats, 'Dependency Edges', trace.edges.length.toLocaleString());
        appendTraceStat(stats, 'Max Depth', trace.depth.toLocaleString());
        appendTraceStat(stats, 'Edge Sources', `${sourcedEdges}/${trace.edges.length}`);
        if (speculativeEdges) appendTraceStat(stats, 'Speculative Edges', speculativeEdges.toLocaleString());
        header.appendChild(stats);
        wrapper.appendChild(header);

        renderDirectEdges(wrapper, trace);
        renderLongestChain(wrapper, trace);
        renderBuildOrder(wrapper, trace);
        lanesEl.appendChild(wrapper);
    }

    function appendDetailRow(parent, label, value) {
        if (value === undefined || value === null || value === '') return;
        const row = document.createElement('p');
        row.className = 'demo-detail-row';
        const strong = document.createElement('strong');
        strong.textContent = `${label}: `;
        row.append(strong, document.createTextNode(value));
        parent.appendChild(row);
    }

    function createRelationshipButton(id) {
        const item = graph.byId.get(id);
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'relationship-chip';
        button.textContent = item?.name || id;
        if (item) {
            const badge = createTrustBadge('node', nodeTrust(item), { compact: true });
            badge.setAttribute('aria-hidden', 'true');
            button.appendChild(badge);
        }
        button.addEventListener('click', () => setSelected(id));
        return button;
    }

    function appendRelationSection(parent, title, ids, edgeForId, direction = 'depends') {
        const section = document.createElement('section');
        section.className = 'demo-detail-section';
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);

        const candidates = ids
            .filter(id => graph.byId.has(id))
            .map(id => ({ id, edge: edgeForId(id) || {} }))
            .filter(entry => {
                const selected = graph.byId.get(selectedId);
                const related = graph.byId.get(entry.id);
                const dependent = direction === 'unlocks' ? related : selected;
                const prerequisite = direction === 'unlocks' ? selected : related;
                return isNodeVisibleByTrust(related)
                    && isEdgeVisibleByTrust(entry.edge, dependent, prerequisite);
            });
        const visible = candidates
            .sort((a, b) => {
                const aField = hasField(graph.byId.get(a.id), currentField) ? 0 : 1;
                const bField = hasField(graph.byId.get(b.id), currentField) ? 0 : 1;
                if (aField !== bField) return aField - bField;
                return graph.byId.get(a.id).name.localeCompare(graph.byId.get(b.id).name);
            })
            .slice(0, 14);

        if (!visible.length) {
            const empty = document.createElement('p');
            empty.className = 'relationship-empty';
            empty.textContent = ids.some(id => graph.byId.has(id)) ? 'Hidden by trust filter' : 'None';
            section.appendChild(empty);
            parent.appendChild(section);
            return;
        }

        const list = document.createElement('div');
        list.className = 'demo-relation-list';
        for (const entry of visible) {
            const id = entry.id;
            const edge = entry.edge || {};
            const item = document.createElement('div');
            item.className = 'demo-relation-item';
            item.dataset.edgeTrust = edgeTrust(edge).level;
            item.appendChild(createRelationshipButton(id));
            const meta = document.createElement('span');
            meta.className = 'demo-inline-meta';
            meta.textContent = [
                edge.type && formatStatus(edge.type),
                edge.confidence !== undefined && formatConfidence(edge.confidence),
                edge.evidence_level && formatStatus(edge.evidence_level)
            ].filter(Boolean).join(' · ');
            appendEdgeTrustBadge(meta, edge, { compact: true });
            item.appendChild(meta);
            if (edge.note) {
                const note = document.createElement('p');
                note.textContent = edge.note;
                item.appendChild(note);
            }
            list.appendChild(item);
        }
        section.appendChild(list);
        parent.appendChild(section);
    }

    function appendSources(parent, sources) {
        if (!Array.isArray(sources) || !sources.length) return;
        const section = document.createElement('section');
        section.className = 'demo-detail-section';
        const heading = document.createElement('h3');
        heading.textContent = 'Sources';
        section.appendChild(heading);
        const list = document.createElement('ul');
        list.className = 'demo-source-list';
        for (const source of sources.slice(0, 6)) {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = source.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = source.title || source.url;
            item.appendChild(link);
            const meta = [source.publisher, source.year, source.source_type && formatStatus(source.source_type)]
                .filter(Boolean)
                .join(', ');
            if (meta) item.appendChild(document.createTextNode(` (${meta})`));
            list.appendChild(item);
        }
        section.appendChild(list);
        parent.appendChild(section);
    }

    function renderDetail() {
        detailEl.replaceChildren();
        const item = graph.byId.get(selectedId);
        if (!item) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = 'No technology selected';
            detailEl.appendChild(empty);
            return;
        }

        const header = document.createElement('div');
        header.className = 'demo-detail-header';
        const title = document.createElement('h2');
        title.textContent = item.name;
        const id = document.createElement('span');
        id.className = 'tech-id';
        id.textContent = item.id;
        header.append(title, id);

        const badges = document.createElement('div');
        badges.className = 'demo-detail-badges';
        appendNodeTrustBadge(badges, item);
        for (const value of [item.era, item.maturity, item.reviewStatus && formatStatus(item.reviewStatus)].filter(Boolean)) {
            const badge = document.createElement('span');
            badge.textContent = value;
            badges.appendChild(badge);
        }
        header.appendChild(badges);
        const traceButton = document.createElement('button');
        traceButton.type = 'button';
        traceButton.className = 'demo-trace-button';
        traceButton.textContent = item.id === targetId ? 'Tracing Target' : 'Trace Target';
        traceButton.disabled = item.id === targetId;
        traceButton.addEventListener('click', () => setTarget(item.id, { revealDetail: true }));
        header.appendChild(traceButton);
        detailEl.appendChild(header);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'demo-detail-description';
            description.textContent = item.description;
            detailEl.appendChild(description);
        }

        const facts = document.createElement('section');
        facts.className = 'demo-detail-section demo-detail-facts';
        appendDetailRow(facts, 'Trust', `${nodeTrust(item).label}: ${nodeTrust(item).reasons.join(', ') || nodeTrust(item).description}`);
        appendDetailRow(facts, 'First known', `${formatDate(item.firstKnownDate)} (${item.datePrecision || 'unknown'}; ${item.region || 'region unknown'})`);
        appendDetailRow(facts, 'Lane', getLane(item, currentField));
        appendDetailRow(facts, 'Scope', item.scopeNote);
        if (item.timeframe || item.forecastConfidence !== undefined || Array.isArray(item.blockers)) {
            appendDetailRow(facts, 'Forecast', [
                item.timeframe && `timeframe ${item.timeframe}`,
                item.forecastConfidence !== undefined && `${formatConfidence(item.forecastConfidence)} confidence`
            ].filter(Boolean).join(' · '));
            if (Array.isArray(item.blockers) && item.blockers.length) {
                appendDetailRow(facts, 'Forecast blockers', item.blockers.join(', '));
            }
        }
        if (item.roadmap) {
            appendDetailRow(facts, 'Roadmap', `${item.roadmap.timeframe || 'unknown'} · ${item.roadmap.confidence || 'unknown'} confidence`);
            if (Array.isArray(item.roadmap.blockers) && item.roadmap.blockers.length) {
                appendDetailRow(facts, 'Blockers', item.roadmap.blockers.join(', '));
            }
        }
        detailEl.appendChild(facts);

        const prereqIds = getPrerequisiteIds(item);
        appendRelationSection(
            detailEl,
            'Depends On',
            prereqIds,
            id => getDependencyEdges(item).find(edge => edge.prerequisite === id),
            'depends'
        );

        const unlockIds = graph.dependents.get(item.id) || [];
        appendRelationSection(
            detailEl,
            'Unlocks',
            unlockIds,
            id => getDependencyEdges(graph.byId.get(id)).find(edge => edge.prerequisite === item.id),
            'unlocks'
        );

        appendSources(detailEl, item.sources);
    }

    function pickDefaultSelection(items) {
        const preferred = defaultFocus[currentField];
        if (preferred && items.some(item => item.id === preferred)) return preferred;
        const roadmap = getRoadmapItems(items);
        if (roadmap.length) return roadmap[0].id;
        return items[items.length - 1]?.id || null;
    }

    function renderField() {
        const items = getFieldItems(currentField);
        const visibleItems = getVisibleFieldItems(currentField);
        if (!selectedId
            || !graph.byId.has(selectedId)
            || !hasField(graph.byId.get(selectedId), currentField)
            || !isNodeVisibleByTrust(graph.byId.get(selectedId))) {
            const visibleTarget = targetId && graph.byId.has(targetId) && isNodeVisibleByTrust(graph.byId.get(targetId));
            selectedId = visibleTarget ? targetId : pickDefaultSelection(visibleItems.length ? visibleItems : items);
        }
        fieldTitleEl.textContent = currentField;
        renderHero(items);
        renderMetrics(items);
        renderNextCandidates(items);
        if (targetId && graph.byId.has(targetId)) {
            renderTargetPath();
        } else {
            renderLanes(visibleItems);
        }
        updateUrl();
        renderDetail();
        if (selectedId) {
            document.querySelectorAll(`[data-tech-id="${CSS.escape(selectedId)}"]`)
                .forEach(el => el.classList.add('is-selected'));
        }
    }

    initStoryCanvas();

    try {
        setStatus('Loading...');
        const [response, snapshotResponse] = await Promise.all([
            fetch('api/tech-tree'),
            fetch('data/quality-snapshot.json', { cache: 'no-store' })
        ]);
        if (!response.ok) throw new Error('Failed to load tech tree');
        if (!snapshotResponse.ok) throw new Error('Failed to load quality snapshot');
        techData = await response.json();
        const qualitySnapshot = await snapshotResponse.json();
        graph = buildGraph(techData);
        renderQualitySnapshot(qualitySnapshot);
        renderTrustLegend();

        currentField = getFieldFromUrl();
        currentTrustFilter = getTrustFilterFromUrl();
        if (trustFilterSelect) trustFilterSelect.value = currentTrustFilter;
        selectedId = getHashTechId();
        targetId = getTargetFromUrl() || (selectedId && graph.byId.has(selectedId) ? selectedId : null);

        const fieldCounts = new Map();
        for (const item of techData) {
            for (const field of item.fields || []) {
                fieldCounts.set(field, (fieldCounts.get(field) || 0) + 1);
            }
        }
        for (const field of fieldOrder.filter(field => fieldCounts.has(field))) {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = `${field} (${fieldCounts.get(field)})`;
            fieldSelect.appendChild(option);
        }
        fieldSelect.value = currentField;

        if (targetOptionsEl) {
            const options = techData
                .slice()
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(item => {
                    const option = document.createElement('option');
                    option.value = `${item.name} [${item.id}]`;
                    return option;
                });
            targetOptionsEl.replaceChildren(...options);
        }

        if (!targetId) {
            targetId = defaultFocus[currentField] && graph.byId.has(defaultFocus[currentField])
                ? defaultFocus[currentField]
                : null;
        }
        if (targetId) selectedId = targetId;
        syncTargetInput();

        fieldSelect.addEventListener('change', () => {
            currentField = fieldSelect.value;
            traceExpanded = false;
            targetId = defaultFocus[currentField] && graph.byId.has(defaultFocus[currentField])
                ? defaultFocus[currentField]
                : null;
            selectedId = targetId;
            searchInput.value = '';
            syncTargetInput();
            renderField();
        });
        trustFilterSelect?.addEventListener('change', () => {
            currentTrustFilter = trustFilterSelect.value;
            traceExpanded = false;
            renderField();
        });
        searchInput.addEventListener('input', () => {
            if (targetId) {
                renderTargetPath();
            } else {
                renderLanes(getVisibleFieldItems(currentField));
            }
            if (selectedId) {
                document.querySelectorAll(`[data-tech-id="${CSS.escape(selectedId)}"]`)
                    .forEach(el => el.classList.add('is-selected'));
            }
        });
        targetInput?.addEventListener('change', () => {
            const id = parseTargetValue(targetInput.value);
            if (id) {
                setTarget(id);
            } else {
                setStatus('Target not found.');
                targetInput.select();
            }
        });
        targetInput?.addEventListener('keydown', event => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            const id = parseTargetValue(targetInput.value);
            if (id) setTarget(id);
        });
        clearTargetBtn?.addEventListener('click', () => {
            targetId = null;
            traceExpanded = false;
            syncTargetInput();
            updateUrl();
            renderField();
        });
        document.querySelectorAll('[data-demo-preset]').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.demoPreset;
                if (id && graph.byId.has(id)) setTarget(id);
            });
        });
        window.addEventListener('hashchange', () => {
            const hashId = getHashTechId();
            if (hashId && graph.byId.has(hashId)) setSelected(hashId, { updateUrl: false });
        });

        setStatus('');
        renderField();
    } catch (error) {
        console.error('Error loading demo:', error);
        setStatus('Failed to load demo.');
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    const fieldSelect = document.getElementById('demo-field');
    const searchInput = document.getElementById('demo-search');
    const targetInput = document.getElementById('demo-target');
    const targetOptionsEl = document.getElementById('demo-target-options');
    const clearTargetBtn = document.getElementById('demo-clear-target');
    const statusEl = document.getElementById('demo-status');
    const fieldTitleEl = document.getElementById('demo-field-title');
    const metricsEl = document.getElementById('demo-metrics');
    const qualitySnapshotEl = document.getElementById('demo-quality-snapshot');
    const nextListEl = document.getElementById('demo-next-list');
    const lanesEl = document.getElementById('demo-lanes');
    const detailEl = document.getElementById('demo-detail');
    const heroTitleEl = document.getElementById('demo-hero-title');
    const heroSummaryEl = document.getElementById('demo-hero-summary');
    const heroStatsEl = document.getElementById('demo-hero-stats');
    const heroFieldEl = document.getElementById('demo-hero-field');
    const heroTargetEl = document.getElementById('demo-hero-target');
    const storyStageEl = document.getElementById('demo-story-stage');
    const heroChainEl = document.getElementById('demo-hero-chain');
    const heroEdgesEl = document.getElementById('demo-hero-edges');

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
    let traceExpanded = false;

    function setStatus(text) {
        if (statusEl) statusEl.textContent = text;
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
        const hash = selectedId ? `#tech-${encodeURIComponent(selectedId)}` : '';
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${hash}`);
    }

    function setSelected(id, options = {}) {
        if (!id || !graph.byId.has(id)) return;
        selectedId = id;
        if (options.updateUrl !== false) updateUrl();
        renderDetail();
        document.querySelectorAll('.demo-tech-chip.is-selected, .demo-next-card.is-selected, .demo-target-chip.is-selected, .demo-longest-chip.is-selected, .demo-target-edge-button.is-selected, .demo-hero-step.is-selected, .demo-hero-edge-button.is-selected, .demo-story-node-button.is-selected')
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

    function compactTraceIds(trace, limit = 96) {
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
        const roadmapCount = getRoadmapItems(items).length;
        const edgeCount = items.reduce((sum, item) => sum + getDependencyEdges(item).length, 0);
        const metrics = [
            ['Nodes', items.length],
            ['Source Checked', sourceChecked],
            ['Roadmap', roadmapCount],
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

    function sampleEvenly(ids, limit) {
        if (ids.length <= limit) return ids;
        if (limit <= 1) return ids.slice(0, limit);
        const picks = [];
        const lastIndex = ids.length - 1;
        for (let index = 0; index < limit; index += 1) {
            const pick = ids[Math.round((index * lastIndex) / (limit - 1))];
            if (pick && !picks.includes(pick)) picks.push(pick);
        }
        return picks;
    }

    function getStoryPrerequisiteLimit() {
        const width = window.innerWidth || 1200;
        if (width < 560) return 3;
        if (width < 900) return 3;
        return 4;
    }

    function getStoryXBounds() {
        const width = window.innerWidth || 1200;
        if (width < 560) return { start: 170, span: 640 };
        if (width < 900) return { start: 150, span: 700 };
        return { start: 145, span: 710 };
    }

    function shortenStoryLabel(label, limit = 22) {
        if (!label || label.length <= limit) return label || '';
        const trimmed = label.slice(0, limit - 3).trimEnd();
        return `${trimmed}...`;
    }

    function getStoryPointIds(trace) {
        const targetId = trace.target.id;
        const prerequisiteLimit = getStoryPrerequisiteLimit();
        const chainIds = longestDependencyChain(trace).filter(id => id !== targetId);
        const fieldIds = trace.ids
            .filter(id => id !== targetId && hasField(graph.byId.get(id), currentField))
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)));
        const earliestIds = trace.ids
            .filter(id => id !== targetId)
            .map(id => graph.byId.get(id))
            .filter(Boolean)
            .sort(compareDate)
            .slice(0, 2)
            .map(item => item.id);
        const directIds = trace.directEdges
            .slice(0, 3)
            .map(entry => entry.from)
            .filter(id => id !== targetId);

        const orderedCandidates = [...new Set([...earliestIds, ...chainIds, ...fieldIds, ...directIds])]
            .filter(id => graph.byId.has(id))
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)));
        const sampled = sampleEvenly(orderedCandidates, prerequisiteLimit);
        const sampledSet = new Set(sampled);

        for (const id of directIds) {
            if (sampledSet.has(id)) continue;
            if (sampled.length < prerequisiteLimit) {
                sampled.push(id);
            } else if (sampled.length) {
                sampled[sampled.length - 1] = id;
            }
            sampledSet.add(id);
        }

        const prereqs = [...new Set(sampled)]
            .filter(id => id !== targetId && graph.byId.has(id))
            .sort((a, b) => compareDate(graph.byId.get(a), graph.byId.get(b)))
            .slice(0, prerequisiteLimit);
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

    function appendStorySvg(parent, points) {
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
        storyStageEl.replaceChildren();
        const points = buildStoryPoints(trace);
        if (!points.length) return;

        appendStorySvg(storyStageEl, points);

        const nodeLayer = document.createElement('div');
        nodeLayer.className = 'demo-story-node-layer';
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
            nodeLayer.appendChild(button);
        });
        storyStageEl.appendChild(nodeLayer);

        const firstPoint = points[0];
        const caption = document.createElement('div');
        caption.className = 'demo-story-caption';
        const prefix = document.createElement('span');
        prefix.textContent = `${points.length - 1} sampled milestones`;
        const story = document.createElement('strong');
        story.textContent = `${formatDate(firstPoint.item.firstKnownDate)} to ${formatDate(trace.target.firstKnownDate)}`;
        caption.append(prefix, story);
        storyStageEl.appendChild(caption);
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
        return button;
    }

    function renderHeroChain(trace) {
        if (!heroChainEl) return;
        heroChainEl.replaceChildren();
        const chain = compactHeroChain(longestDependencyChain(trace));
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
            empty.textContent = 'No direct dependencies';
            heroEdgesEl.appendChild(empty);
            return;
        }

        for (const entry of trace.directEdges.slice(0, 4)) {
            const prereq = graph.byId.get(entry.from);
            const button = createTechButton(prereq, 'demo-hero-edge-button');
            button.dataset.edgeType = entry.edge.type || 'enabling';
            const title = document.createElement('strong');
            title.textContent = prereq.name;
            const meta = document.createElement('span');
            meta.textContent = [
                edgeKind(entry.edge),
                formatConfidence(entry.edge.confidence),
                entry.edge.evidence_level && formatStatus(entry.edge.evidence_level)
            ].filter(Boolean).join(' · ');
            button.append(title, meta);
            heroEdgesEl.appendChild(button);
        }

        if (trace.directEdges.length > 4) {
            const more = document.createElement('span');
            more.className = 'demo-hero-more';
            more.textContent = `+${trace.directEdges.length - 4} more`;
            heroEdgesEl.appendChild(more);
        }
    }

    function renderHero(items = getFieldItems(currentField)) {
        if (!heroTitleEl || !graph) return;
        const focusId = targetId || selectedId || defaultFocus[currentField] || pickDefaultSelection(items);
        const trace = focusId && graph.byId.has(focusId) ? buildTargetTrace(focusId) : null;
        if (!trace) return;

        const eras = new Set(trace.ids.map(id => graph.byId.get(id)?.era).filter(Boolean)).size;
        const sourcedEdges = trace.edges.filter(entry => hasEdgeSource(entry.edge)).length;
        const requiredEdges = trace.edges.filter(entry => entry.edge.type === 'required').length;
        const contextualEdges = trace.edges.length - requiredEdges;
        const region = trace.target.region || 'region unknown';

        heroTitleEl.textContent = `What had to exist before ${trace.target.name}?`;
        heroSummaryEl.textContent = `${formatDate(trace.target.firstKnownDate)} target, ${region}: ${trace.ids.length - 1} prerequisite technologies across ${eras} eras, with ${requiredEdges} hard edges and ${contextualEdges} contextual or scaling edges.`;
        heroFieldEl.textContent = currentField;
        heroTargetEl.textContent = trace.target.name;

        heroStatsEl.replaceChildren();
        appendHeroStat(heroStatsEl, 'Prerequisites', Math.max(0, trace.ids.length - 1).toLocaleString());
        appendHeroStat(heroStatsEl, 'Max Depth', trace.depth.toLocaleString());
        appendHeroStat(heroStatsEl, 'Edge Sources', `${sourcedEdges}/${trace.edges.length}`);
        appendHeroStat(heroStatsEl, 'Direct Edges', trace.directEdges.length.toLocaleString());

        renderStoryStage(trace);
        renderHeroChain(trace);
        renderHeroEdges(trace);
    }

    function renderNextCandidates(items) {
        nextListEl.replaceChildren();
        const candidates = getRoadmapItems(items).slice(0, 6);
        if (!candidates.length) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = 'No roadmap nodes';
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
            empty.textContent = 'No matching technologies';
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
        return button;
    }

    function renderDirectEdges(parent, trace) {
        const section = document.createElement('section');
        section.className = 'demo-target-section';
        const heading = document.createElement('h3');
        heading.textContent = `Direct prerequisites (${trace.directEdges.length})`;
        section.appendChild(heading);

        if (!trace.directEdges.length) {
            const empty = document.createElement('p');
            empty.className = 'demo-empty';
            empty.textContent = 'None';
            section.appendChild(empty);
            parent.appendChild(section);
            return;
        }

        const list = document.createElement('div');
        list.className = 'demo-target-edge-list';
        for (const entry of trace.directEdges) {
            const prereq = graph.byId.get(entry.from);
            const row = document.createElement('div');
            row.className = 'demo-target-edge';
            row.dataset.edgeType = entry.edge.type || 'enabling';

            const button = createTechButton(prereq, 'demo-target-edge-button');
            button.textContent = prereq.name;
            row.appendChild(button);

            const meta = document.createElement('span');
            meta.textContent = [
                edgeKind(entry.edge),
                formatConfidence(entry.edge.confidence),
                entry.edge.evidence_level && formatStatus(entry.edge.evidence_level)
            ].filter(Boolean).join(' · ');
            row.appendChild(meta);

            if (entry.edge.note) {
                const note = document.createElement('p');
                note.textContent = entry.edge.note;
                row.appendChild(note);
            }
            list.appendChild(row);
        }
        section.appendChild(list);
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
        heading.textContent = 'Build order';
        section.appendChild(heading);

        if (visibleIds.length < trace.ids.length) {
            const summary = document.createElement('p');
            summary.className = 'demo-target-compact-note';
            summary.textContent = `Showing ${visibleIds.length} closest and chain-critical nodes from ${trace.ids.length} total prerequisite nodes.`;
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
        const trace = buildTargetTrace(targetId);
        if (!trace) {
            renderLanes(getFieldItems(currentField));
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
        summary.textContent = `${trace.ids.length - 1} prerequisite technologies across ${eras} eras. ${requiredEdges} hard prerequisite edges, ${trace.edges.length - requiredEdges} contextual or scaling edges.`;
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
        button.addEventListener('click', () => setSelected(id));
        return button;
    }

    function appendRelationSection(parent, title, ids, edgeForId) {
        const section = document.createElement('section');
        section.className = 'demo-detail-section';
        const heading = document.createElement('h3');
        heading.textContent = title;
        section.appendChild(heading);

        const visible = ids
            .filter(id => graph.byId.has(id))
            .sort((a, b) => {
                const aField = hasField(graph.byId.get(a), currentField) ? 0 : 1;
                const bField = hasField(graph.byId.get(b), currentField) ? 0 : 1;
                if (aField !== bField) return aField - bField;
                return graph.byId.get(a).name.localeCompare(graph.byId.get(b).name);
            })
            .slice(0, 14);

        if (!visible.length) {
            const empty = document.createElement('p');
            empty.className = 'relationship-empty';
            empty.textContent = 'None';
            section.appendChild(empty);
            parent.appendChild(section);
            return;
        }

        const list = document.createElement('div');
        list.className = 'demo-relation-list';
        for (const id of visible) {
            const edge = edgeForId(id) || {};
            const item = document.createElement('div');
            item.className = 'demo-relation-item';
            item.appendChild(createRelationshipButton(id));
            const meta = document.createElement('span');
            meta.textContent = [
                edge.type && formatStatus(edge.type),
                edge.confidence !== undefined && formatConfidence(edge.confidence),
                edge.evidence_level && formatStatus(edge.evidence_level)
            ].filter(Boolean).join(' · ');
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
        appendDetailRow(facts, 'First known', `${formatDate(item.firstKnownDate)} (${item.datePrecision || 'unknown'}; ${item.region || 'region unknown'})`);
        appendDetailRow(facts, 'Lane', getLane(item, currentField));
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
            id => getDependencyEdges(item).find(edge => edge.prerequisite === id)
        );

        const unlockIds = graph.dependents.get(item.id) || [];
        appendRelationSection(
            detailEl,
            'Unlocks',
            unlockIds,
            id => getDependencyEdges(graph.byId.get(id)).find(edge => edge.prerequisite === item.id)
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
        if (!selectedId || !graph.byId.has(selectedId) || !hasField(graph.byId.get(selectedId), currentField)) {
            selectedId = targetId || pickDefaultSelection(items);
        }
        fieldTitleEl.textContent = currentField;
        renderHero(items);
        renderMetrics(items);
        renderNextCandidates(items);
        if (targetId && graph.byId.has(targetId)) {
            renderTargetPath();
        } else {
            renderLanes(items);
        }
        updateUrl();
        renderDetail();
        if (selectedId) {
            document.querySelectorAll(`[data-tech-id="${CSS.escape(selectedId)}"]`)
                .forEach(el => el.classList.add('is-selected'));
        }
    }

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

        currentField = getFieldFromUrl();
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
        searchInput.addEventListener('input', () => {
            if (targetId) {
                renderTargetPath();
            } else {
                renderLanes(getFieldItems(currentField));
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

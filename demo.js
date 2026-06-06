document.addEventListener('DOMContentLoaded', async () => {
    const fieldSelect = document.getElementById('demo-field');
    const searchInput = document.getElementById('demo-search');
    const statusEl = document.getElementById('demo-status');
    const fieldTitleEl = document.getElementById('demo-field-title');
    const metricsEl = document.getElementById('demo-metrics');
    const nextListEl = document.getElementById('demo-next-list');
    const lanesEl = document.getElementById('demo-lanes');
    const detailEl = document.getElementById('demo-detail');

    const eraOrder = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const fieldOrder = [
        'Genome Editing / CRISPR-Cas',
        'Semiconductors & Integrated Circuits',
        'Artificial Intelligence & Machine Learning',
        'Energy Systems & Grid',
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

    function updateUrl() {
        const params = new URLSearchParams();
        params.set('field', currentField);
        const hash = selectedId ? `#tech-${encodeURIComponent(selectedId)}` : '';
        window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}${hash}`);
    }

    function setSelected(id, options = {}) {
        if (!id || !graph.byId.has(id)) return;
        selectedId = id;
        if (options.updateUrl !== false) updateUrl();
        renderDetail();
        document.querySelectorAll('.demo-tech-chip.is-selected, .demo-next-card.is-selected')
            .forEach(el => el.classList.remove('is-selected'));
        document.querySelectorAll(`[data-tech-id="${CSS.escape(id)}"]`)
            .forEach(el => el.classList.add('is-selected'));
    }

    function createTechButton(item, className) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = className;
        button.dataset.techId = item.id;
        button.addEventListener('click', () => setSelected(item.id));
        return button;
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
        fieldTitleEl.textContent = currentField;
        renderMetrics(items);
        renderNextCandidates(items);
        renderLanes(items);
        if (!selectedId || !graph.byId.has(selectedId) || !hasField(graph.byId.get(selectedId), currentField)) {
            selectedId = pickDefaultSelection(items);
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
        const response = await fetch('api/tech-tree');
        if (!response.ok) throw new Error('Failed to load tech tree');
        techData = await response.json();
        graph = buildGraph(techData);

        currentField = getFieldFromUrl();
        selectedId = getHashTechId();

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

        fieldSelect.addEventListener('change', () => {
            currentField = fieldSelect.value;
            selectedId = null;
            searchInput.value = '';
            renderField();
        });
        searchInput.addEventListener('input', () => {
            renderLanes(getFieldItems(currentField));
            if (selectedId) {
                document.querySelectorAll(`[data-tech-id="${CSS.escape(selectedId)}"]`)
                    .forEach(el => el.classList.add('is-selected'));
            }
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

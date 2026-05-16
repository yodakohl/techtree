document.addEventListener('DOMContentLoaded', async () => {
    const statusEl = document.getElementById('sorted-status');
    const countEl = document.getElementById('sorted-count');
    const searchInput = document.getElementById('sorted-search');
    const viewMode = document.getElementById('sorted-view');
    const fieldFilter = document.getElementById('sorted-field-filter');
    const branchFilter = document.getElementById('sorted-branch-filter');
    const eraFilter = document.getElementById('sorted-era-filter');
    const sortMode = document.getElementById('sorted-sort');
    const sectionsEl = document.getElementById('sorted-sections');
    const showMoreBtn = document.getElementById('sorted-more');
    const pageSize = 175;
    let visibleLimit = pageSize;

    const eraOrder = {
        Ancient: 0,
        Classical: 1,
        Medieval: 2,
        Renaissance: 3,
        Industrial: 4,
        Modern: 5,
        Future: 6
    };

    const eraColors = {
        Ancient: '#c76a20',
        Classical: '#2878b8',
        Medieval: '#23975a',
        Renaissance: '#8553a8',
        Industrial: '#b98b00',
        Modern: '#c94335',
        Future: '#6f7c86'
    };

    const eraNames = Object.keys(eraOrder);
    const branchRules = [
        {
            name: 'Agriculture & Food',
            terms: ['agricultur', 'farm', 'crop', 'seed', 'grain', 'food', 'fermentation', 'bread', 'irrigation', 'plow', 'animal_husbandry', 'domestication', 'pastoral', 'fishing', 'harvest', 'green_revolution']
        },
        {
            name: 'Materials & Manufacturing',
            terms: ['stone_tool', 'tool', 'metal', 'bronze', 'iron', 'steel', 'alloy', 'glass', 'ceramic', 'pottery', 'textile', 'weaving', 'manufactur', 'factory', 'assembly', '3d_print', 'materials', 'polymer', 'plastic', 'composite', 'nanotechnology', 'casting', 'molding']
        },
        {
            name: 'Energy & Power',
            terms: ['fire', 'charcoal', 'coal', 'steam', 'electric', 'power', 'battery', 'solar', 'wind', 'nuclear', 'fusion', 'hydrogen', 'grid', 'turbine', 'motor', 'engine', 'fuel', 'geothermal', 'renewable', 'energy']
        },
        {
            name: 'Transport & Logistics',
            terms: ['boat', 'ship', 'sail', 'navigation', 'road', 'rail', 'flight', 'aircraft', 'automobile', 'transport', 'logistics', 'supply', 'container', 'drone', 'rocket', 'propellant', 'gps', 'harbor', 'bridge', 'canal']
        },
        {
            name: 'Computing & AI',
            terms: ['abacus', 'algorithm', 'computer', 'software', 'database', 'data_', 'cloud', 'virtualization', 'internet_protocol', 'microprocessor', 'semiconductor', 'transistor', 'integrated_circuit', 'ai', 'artificial_intelligence', 'machine_learning', 'deep_learning', 'language_model', 'neural', 'robotic_process', 'quantum_computing', 'vector_database']
        },
        {
            name: 'Communication & Media',
            terms: ['writing', 'paper', 'printing', 'book', 'library', 'postal', 'telegraph', 'telephone', 'radio', 'television', 'media', 'cinema', 'photography', 'web', 'internet', 'hypertext', 'social_media', 'communication', 'storytelling']
        },
        {
            name: 'Medicine & Biology',
            terms: ['medicine', 'medical', 'hospital', 'surgery', 'anatom', 'health', 'sanitation', 'vaccine', 'antibiotic', 'biology', 'gene', 'genetic', 'dna', 'rna', 'protein', 'cell', 'bio', 'pharma', 'drug', 'immunology', 'neuro', 'brain', 'sequencing']
        },
        {
            name: 'Science & Mathematics',
            terms: ['math', 'geometry', 'algebra', 'calculus', 'probability', 'statistics', 'astronomy', 'physics', 'chemistry', 'scientific', 'experiment', 'measurement', 'surveying', 'cartography', 'optics', 'microscope', 'telescope', 'clock', 'calendar']
        },
        {
            name: 'Society & Governance',
            terms: ['law', 'legal', 'govern', 'bureaucracy', 'democracy', 'state', 'city_state', 'public_', 'education', 'university', 'school', 'charter', 'police', 'military', 'warfare', 'rights', 'ethics', 'tax', 'census']
        },
        {
            name: 'Finance & Commerce',
            terms: ['barter', 'currency', 'coin', 'bank', 'finance', 'commerce', 'trade', 'merchant', 'credit', 'insurance', 'stock', 'capital', 'corporation', 'bookkeeping', 'accounting', 'market', 'retail', 'e-commerce']
        },
        {
            name: 'Infrastructure & Cities',
            terms: ['shelter', 'construction', 'masonry', 'architecture', 'concrete', 'urban', 'city', 'aqueduct', 'sewer', 'water_', 'well', 'cistern', 'building', 'bridge', 'skyscraper', 'housing', 'public_works', 'municipal']
        },
        {
            name: 'Security & Defense',
            terms: ['weapon', 'war', 'military', 'armor', 'fortification', 'castle', 'missile', 'security', 'encryption', 'cryptography', 'zero_trust', 'cyber', 'surveillance', 'defense', 'ballistic', 'radar']
        },
        {
            name: 'Space & Far Future',
            terms: ['space', 'satellite', 'orbital', 'lunar', 'mars', 'asteroid', 'terraform', 'interstellar', 'interplanetary', 'dyson', 'antimatter', 'warp', 'starlifting', 'kardashev', 'future', 'immortality', 'post_labor']
        },
        {
            name: 'Arts & Culture',
            terms: ['art', 'music', 'theater', 'literature', 'myth', 'ritual', 'religion', 'philosophy', 'sculpture', 'painting', 'mosaic', 'heraldry', 'chivalry', 'storytelling']
        }
    ];

    const fieldRules = [
        {
            name: 'Mechanical Engineering',
            branches: ['Materials & Manufacturing', 'Energy & Power', 'Transport & Logistics', 'Infrastructure & Cities', 'Science & Mathematics'],
            terms: [
                'mechanical', 'machine', 'mechanism', 'gear', 'clockwork', 'pump', 'turbine', 'engine', 'motor',
                'steam', 'diesel', 'combustion', 'manufactur', 'factory', 'assembly', 'casting', 'molding',
                'machining', 'precision', 'tool', 'metal', 'steel', 'alloy', 'materials', 'composite',
                'robot', 'automation', 'control', 'instrumentation', 'quality', 'vehicle', 'rail', 'flight',
                'ship', 'bridge', 'construction', 'cad', 'cam', '3d_print', 'thermodynamics', 'fluid',
                'aerodynamics', 'hydraulic', 'pneumatic', 'bearing', 'spring', 'welding', 'power'
            ]
        },
        {
            name: 'Finance & Markets',
            branches: ['Finance & Commerce', 'Society & Governance', 'Computing & AI', 'Communication & Media', 'Security & Defense'],
            terms: [
                'finance', 'financial', 'bank', 'banking', 'currency', 'coin', 'money', 'credit', 'debt',
                'insurance', 'actuarial', 'risk', 'stock', 'exchange', 'market', 'merchant', 'trade',
                'commerce', 'retail', 'capital', 'corporation', 'liability', 'accounting', 'bookkeeping',
                'tax', 'contract', 'law', 'notarial', 'ledger', 'blockchain', 'cryptocurrency', 'derivative',
                'securities', 'e-commerce', 'payment', 'auction', 'pricing', 'probability', 'statistics',
                'forecast', 'supply_chain', 'api', 'identity', 'encryption', 'security'
            ]
        }
    ];

    const fieldLaneRules = {
        'Mechanical Engineering': [
            {
                name: 'Foundations & Measurement',
                terms: ['measurement', 'geometry', 'mathematics', 'physics', 'thermodynamics', 'fluid', 'aerodynamics', 'surveying', 'clock', 'instrument', 'precision', 'quality', 'standard']
            },
            {
                name: 'Materials & Fabrication',
                terms: ['material', 'metal', 'bronze', 'iron', 'steel', 'alloy', 'composite', 'ceramic', 'glass', 'polymer', 'casting', 'molding', 'machining', 'manufactur', 'factory', 'welding', '3d_print']
            },
            {
                name: 'Mechanisms & Machines',
                terms: ['machine', 'mechanism', 'gear', 'lever', 'pulley', 'pump', 'clockwork', 'automata', 'bearing', 'spring', 'pneumatic', 'hydraulic', 'tool', 'motor']
            },
            {
                name: 'Power & Thermal Systems',
                terms: ['power', 'steam', 'engine', 'turbine', 'combustion', 'diesel', 'fuel', 'battery', 'electric', 'grid', 'hydrogen', 'nuclear', 'fusion', 'solar', 'wind']
            },
            {
                name: 'Vehicles & Infrastructure',
                terms: ['transport', 'vehicle', 'road', 'rail', 'automobile', 'flight', 'aircraft', 'ship', 'bridge', 'canal', 'construction', 'infrastructure', 'logistics', 'propellant']
            },
            {
                name: 'Automation & Systems',
                terms: ['automation', 'robot', 'control', 'sensor', 'cad', 'cam', 'digital_twin', 'systems_engineering', 'operations_research', 'process_control', 'assembly_line']
            }
        ],
        'Finance & Markets': [
            {
                name: 'Money & Accounting',
                terms: ['barter', 'currency', 'coin', 'money', 'accounting', 'bookkeeping', 'ledger', 'tax', 'census', 'stock_ticker']
            },
            {
                name: 'Banking & Credit',
                terms: ['bank', 'banking', 'credit', 'debt', 'bill', 'letter_of_credit', 'deposit', 'loan', 'finance', 'capital']
            },
            {
                name: 'Markets & Commerce',
                terms: ['market', 'merchant', 'trade', 'commerce', 'retail', 'e-commerce', 'stock', 'exchange', 'corporation', 'supply_chain', 'pricing']
            },
            {
                name: 'Risk & Insurance',
                terms: ['risk', 'insurance', 'actuarial', 'probability', 'statistics', 'derivative', 'forecast', 'hedge', 'mortality']
            },
            {
                name: 'Institutions & Law',
                terms: ['contract', 'law', 'legal', 'notarial', 'governance', 'regulation', 'liability', 'rights', 'identity', 'taxation']
            },
            {
                name: 'Financial Computing',
                terms: ['computer', 'database', 'software', 'api', 'encryption', 'security', 'blockchain', 'cryptocurrency', 'ai', 'machine_learning', 'cloud', 'digital_identity']
            }
        ]
    };

    function setStatus(message) {
        if (statusEl) statusEl.textContent = message;
    }

    function classifyBranch(item) {
        const text = `${item.id} ${item.name} ${item.description} ${(item.prerequisites || []).join(' ')}`.toLowerCase();
        let best = { name: 'Other', score: 0 };
        for (const rule of branchRules) {
            let score = 0;
            for (const term of rule.terms) {
                if (text.includes(term)) score += 1;
            }
            if (score > best.score) best = { name: rule.name, score };
        }
        return best.name;
    }

    function classifyFields(item, branch) {
        const text = `${item.id} ${item.name} ${item.description} ${(item.prerequisites || []).join(' ')}`.toLowerCase();
        const fields = [];
        for (const rule of fieldRules) {
            let termScore = 0;
            for (const term of rule.terms) {
                if (text.includes(term)) termScore += 1;
            }
            const strongMechanicalHit = rule.name === 'Mechanical Engineering' && [
                'mechanical', 'machine', 'mechanism', 'gear', 'pump', 'turbine', 'engine', 'motor',
                'manufactur', 'factory', 'assembly', 'robot', 'automation', 'control', 'instrumentation',
                'quality', 'vehicle', 'rail', 'flight', 'ship', 'bridge', 'construction', 'cad', 'cam',
                'thermodynamics', 'fluid', 'aerodynamics', 'hydraulic', 'pneumatic', '3d_print'
            ].some(term => text.includes(term));
            const broadFinanceBranch = rule.name === 'Finance & Markets'
                && branch === 'Finance & Commerce';
            const includeMechanical = rule.name === 'Mechanical Engineering'
                && (termScore >= 2 || strongMechanicalHit);
            const includeFinance = rule.name === 'Finance & Markets'
                && (termScore > 0 || broadFinanceBranch);
            if (includeMechanical || includeFinance) {
                fields.push(rule.name);
            }
        }
        return fields;
    }

    function classifyFieldLane(item, fieldName) {
        const lanes = fieldLaneRules[fieldName] || [];
        if (!lanes.length) return 'General';
        const text = `${item.id} ${item.name} ${item.description} ${(item.prerequisites || []).join(' ')}`.toLowerCase();
        let best = { name: 'General', score: 0 };
        for (const lane of lanes) {
            let score = 0;
            for (const term of lane.terms) {
                if (text.includes(term)) score += 1;
            }
            if (score > best.score) best = { name: lane.name, score };
        }
        return best.name;
    }

    function buildGraph(data) {
        const byId = new Map(data.map(item => [item.id, item]));
        const dependents = new Map();
        const remainingPrereqs = new Map();
        const level = new Map();

        for (const item of data) {
            const prereqs = (item.prerequisites || []).filter(id => byId.has(id));
            remainingPrereqs.set(item.id, prereqs.length);
            if (!dependents.has(item.id)) dependents.set(item.id, []);
            for (const prereq of prereqs) {
                if (!dependents.has(prereq)) dependents.set(prereq, []);
                dependents.get(prereq).push(item.id);
            }
        }

        const queue = [];
        for (const item of data) {
            if (remainingPrereqs.get(item.id) === 0) {
                level.set(item.id, 0);
                queue.push(item.id);
            }
        }

        for (let index = 0; index < queue.length; index += 1) {
            const current = queue[index];
            const currentLevel = level.get(current) || 0;
            for (const dependent of dependents.get(current) || []) {
                level.set(dependent, Math.max(level.get(dependent) || 0, currentLevel + 1));
                remainingPrereqs.set(dependent, remainingPrereqs.get(dependent) - 1);
                if (remainingPrereqs.get(dependent) === 0) {
                    queue.push(dependent);
                }
            }
        }

        for (const item of data) {
            if (!level.has(item.id)) level.set(item.id, 0);
        }

        return { byId, dependents, level };
    }

    function compareTech(a, b, mode) {
        if (mode === 'name') return a.name.localeCompare(b.name);
        if (mode === 'dependency') {
            const levelDiff = a.level - b.level;
            if (levelDiff !== 0) return levelDiff;
        }
        const eraDiff = (eraOrder[a.era] ?? 99) - (eraOrder[b.era] ?? 99);
        if (eraDiff !== 0) return eraDiff;
        const levelDiff = a.level - b.level;
        if (levelDiff !== 0) return levelDiff;
        return a.name.localeCompare(b.name);
    }

    function normalizeText(item, graph) {
        const prereqNames = (item.prerequisites || [])
            .map(id => graph.byId.get(id)?.name || id)
            .join(' ');
        const dependentNames = (graph.dependents.get(item.id) || [])
            .map(id => graph.byId.get(id)?.name || id)
            .join(' ');
        return `${item.name} ${item.id} ${item.era} ${item.description} ${prereqNames} ${dependentNames}`.toLowerCase();
    }

    function techLabel(ids, graph) {
        if (!ids.length) return 'None';
        return ids
            .map(id => graph.byId.get(id)?.name || id)
            .sort((a, b) => a.localeCompare(b))
            .join(', ');
    }

    function createRow(item, graph) {
        const row = document.createElement('tr');
        row.id = `tech-${item.id}`;

        const nameCell = document.createElement('th');
        nameCell.scope = 'row';
        const name = document.createElement('a');
        name.href = `#tech-${item.id}`;
        name.textContent = item.name;
        nameCell.appendChild(name);
        const id = document.createElement('span');
        id.className = 'tech-id';
        id.textContent = item.id;
        nameCell.appendChild(id);

        const eraCell = document.createElement('td');
        const eraBadge = document.createElement('span');
        eraBadge.className = 'era-badge';
        eraBadge.style.setProperty('--era-color', eraColors[item.era] || '#777');
        eraBadge.textContent = item.era || 'Unknown';
        eraCell.appendChild(eraBadge);

        const levelCell = document.createElement('td');
        levelCell.textContent = item.level;

        const prereqCell = document.createElement('td');
        prereqCell.className = 'relationship-cell';
        prereqCell.textContent = techLabel(item.prerequisites || [], graph);

        const unlocksCell = document.createElement('td');
        unlocksCell.className = 'relationship-cell';
        unlocksCell.textContent = techLabel(graph.dependents.get(item.id) || [], graph);

        const descriptionCell = document.createElement('td');
        descriptionCell.textContent = item.description || '';

        row.append(nameCell, eraCell, levelCell, prereqCell, unlocksCell, descriptionCell);
        return row;
    }

    function createTechChip(item) {
        const chip = document.createElement('a');
        chip.className = 'branch-tech-chip';
        chip.href = `#tech-${item.id}`;
        chip.id = `branch-tech-${item.id}`;
        chip.title = `${item.name}\n${item.description || ''}`;
        chip.textContent = item.name;
        chip.style.setProperty('--era-color', eraColors[item.era] || '#777');
        return chip;
    }

    function renderBranchView(items, totalCount, selectedField) {
        if (countEl) {
            const lens = selectedField === 'all' ? '' : `${selectedField}: `;
            countEl.textContent = `${lens}${items.length.toLocaleString()} of ${totalCount.toLocaleString()} technologies`;
        }
        if (showMoreBtn) showMoreBtn.hidden = true;

        sectionsEl.replaceChildren();
        if (!items.length) {
            const empty = document.createElement('p');
            empty.className = 'sorted-empty';
            empty.textContent = 'No technologies match the current filters.';
            sectionsEl.appendChild(empty);
            return;
        }

        const branchMap = new Map();
        for (const item of items) {
            const group = selectedField === 'all'
                ? item.branch
                : (item.fieldLanes[selectedField] || 'General');
            if (!branchMap.has(group)) branchMap.set(group, []);
            branchMap.get(group).push(item);
        }

        const orderedGroups = selectedField === 'all'
            ? branchRules.map(rule => rule.name).concat('Other')
            : (fieldLaneRules[selectedField] || []).map(rule => rule.name).concat('General');
        const orderedBranches = orderedGroups
            .filter(branch => branchMap.has(branch));
        const fragment = document.createDocumentFragment();

        for (const branch of orderedBranches) {
            const branchItems = branchMap.get(branch)
                .sort((a, b) => compareTech(a, b, 'dependency'));
            const section = document.createElement('section');
            section.className = 'branch-section';

            const heading = document.createElement('h2');
            heading.textContent = `${branch} (${branchItems.length})`;
            section.appendChild(heading);

            const grid = document.createElement('div');
            grid.className = 'branch-era-grid';

            for (const era of eraNames) {
                const column = document.createElement('div');
                column.className = 'branch-era-column';

                const columnTitle = document.createElement('h3');
                columnTitle.textContent = era;
                columnTitle.style.setProperty('--era-color', eraColors[era] || '#777');
                column.appendChild(columnTitle);

                const eraItems = branchItems.filter(item => item.era === era);
                if (eraItems.length) {
                    for (const item of eraItems) column.appendChild(createTechChip(item));
                } else {
                    const empty = document.createElement('span');
                    empty.className = 'branch-empty';
                    empty.textContent = '-';
                    column.appendChild(empty);
                }

                grid.appendChild(column);
            }

            section.appendChild(grid);
            fragment.appendChild(section);
        }

        sectionsEl.appendChild(fragment);
    }

    function render(data, graph) {
        const query = (searchInput?.value || '').trim().toLowerCase();
        const selectedField = fieldFilter?.value || 'all';
        const selectedBranch = branchFilter?.value || 'all';
        const selectedEra = eraFilter?.value || 'all';
        const selectedView = viewMode?.value || 'branches';
        const mode = sortMode?.value || 'era';

        const filtered = data
            .filter(item => selectedField === 'all' || item.fields.includes(selectedField))
            .filter(item => selectedBranch === 'all' || item.branch === selectedBranch)
            .filter(item => selectedEra === 'all' || item.era === selectedEra)
            .filter(item => !query || item.searchText.includes(query))
            .sort((a, b) => compareTech(a, b, mode));

        if (selectedView === 'branches') {
            renderBranchView(filtered, data.length, selectedField);
            return;
        }

        const visibleItems = filtered.slice(0, visibleLimit);

        if (countEl) {
            countEl.textContent = `Showing ${visibleItems.length.toLocaleString()} of ${filtered.length.toLocaleString()} matches (${data.length.toLocaleString()} total)`;
        }
        if (showMoreBtn) {
            showMoreBtn.hidden = visibleItems.length >= filtered.length;
        }

        sectionsEl.replaceChildren();
        if (!visibleItems.length) {
            const empty = document.createElement('p');
            empty.className = 'sorted-empty';
            empty.textContent = 'No technologies match the current filters.';
            sectionsEl.appendChild(empty);
            return;
        }

        const grouped = new Map();
        for (const item of visibleItems) {
            const key = item.era || 'Unknown';
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key).push(item);
        }

        const fragment = document.createDocumentFragment();
        const eras = [...grouped.keys()].sort((a, b) => (eraOrder[a] ?? 99) - (eraOrder[b] ?? 99));

        for (const era of eras) {
            const section = document.createElement('section');
            section.className = 'sorted-era-section';

            const heading = document.createElement('h2');
            heading.textContent = `${era} (${grouped.get(era).length})`;
            heading.style.setProperty('--era-color', eraColors[era] || '#777');
            section.appendChild(heading);

            const table = document.createElement('table');
            table.className = 'sorted-table';
            table.innerHTML = `
                <thead>
                    <tr>
                        <th scope="col">Technology</th>
                        <th scope="col">Era</th>
                        <th scope="col">Depth</th>
                        <th scope="col">Prerequisites</th>
                        <th scope="col">Unlocks</th>
                        <th scope="col">Description</th>
                    </tr>
                </thead>
            `;
            const body = document.createElement('tbody');
            for (const item of grouped.get(era)) {
                body.appendChild(createRow(item, graph));
            }
            table.appendChild(body);
            section.appendChild(table);
            fragment.appendChild(section);
        }

        sectionsEl.appendChild(fragment);
    }

    try {
        setStatus('Loading technologies...');
        const resp = await fetch('api/tech-tree');
        if (!resp.ok) throw new Error('Failed to load tech tree');
        const data = await resp.json();
        const graph = buildGraph(data);

        for (const item of data) {
            item.level = graph.level.get(item.id) || 0;
            item.branch = classifyBranch(item);
            item.fields = classifyFields(item, item.branch);
            item.fieldLanes = {};
            for (const field of item.fields) {
                item.fieldLanes[field] = classifyFieldLane(item, field);
            }
            item.searchText = `${normalizeText(item, graph)} ${item.branch.toLowerCase()} ${item.fields.join(' ').toLowerCase()}`;
        }

        const eras = [...new Set(data.map(item => item.era).filter(Boolean))]
            .sort((a, b) => (eraOrder[a] ?? 99) - (eraOrder[b] ?? 99));
        for (const era of eras) {
            const option = document.createElement('option');
            option.value = era;
            option.textContent = era;
            eraFilter.appendChild(option);
        }
        const branches = [...new Set(data.map(item => item.branch))]
            .sort((a, b) => {
                const aIndex = branchRules.findIndex(rule => rule.name === a);
                const bIndex = branchRules.findIndex(rule => rule.name === b);
                return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex) || a.localeCompare(b);
            });
        for (const branch of branches) {
            const option = document.createElement('option');
            option.value = branch;
            option.textContent = branch;
            branchFilter.appendChild(option);
        }
        for (const field of fieldRules.map(rule => rule.name)) {
            const option = document.createElement('option');
            option.value = field;
            option.textContent = field;
            fieldFilter.appendChild(option);
        }

        setStatus('');
        render(data, graph);

        const scheduleRender = () => {
            visibleLimit = pageSize;
            window.requestAnimationFrame(() => render(data, graph));
        };
        searchInput?.addEventListener('input', scheduleRender);
        viewMode?.addEventListener('change', scheduleRender);
        fieldFilter?.addEventListener('change', scheduleRender);
        branchFilter?.addEventListener('change', scheduleRender);
        eraFilter?.addEventListener('change', scheduleRender);
        sortMode?.addEventListener('change', scheduleRender);
        showMoreBtn?.addEventListener('click', () => {
            visibleLimit += pageSize;
            window.requestAnimationFrame(() => render(data, graph));
        });
    } catch (err) {
        console.error('Error loading sorted tech view:', err);
        setStatus('Failed to load technologies.');
    }
});

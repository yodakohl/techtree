document.addEventListener('DOMContentLoaded', async () => {
    const mainEl = document.getElementById('sorted-main');
    const statusEl = document.getElementById('sorted-status');
    const countEl = document.getElementById('sorted-count');
    const selectionStatusEl = document.getElementById('sorted-selection-status');
    const searchInput = document.getElementById('sorted-search');
    const viewMode = document.getElementById('sorted-view');
    const fieldFilter = document.getElementById('sorted-field-filter');
    const branchFilter = document.getElementById('sorted-branch-filter');
    const eraFilter = document.getElementById('sorted-era-filter');
    const sortMode = document.getElementById('sorted-sort');
    const sectionsEl = document.getElementById('sorted-sections');
    const showMoreBtn = document.getElementById('sorted-more');
    const resetBtn = document.getElementById('sorted-reset');
    const detailPanel = document.getElementById('sorted-detail-panel');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pageSize = 175;
    let visibleLimit = pageSize;
    let selectedTechId = null;
    let activeGraph = null;
    let renderFrameId = null;
    let searchTimer = null;

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
            terms: ['stone_tool', 'tool', 'metal', 'bronze', 'iron', 'steel', 'alloy', 'glass', 'ceramic', 'pottery', 'textile', 'weaving', 'manufactur', 'fabrication', 'factory', 'assembly', '3d_print', 'materials', 'polymer', 'plastic', 'composite', 'nanotechnology', 'casting', 'molding']
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
            terms: ['abacus', 'algorithm', 'computer', 'software', 'database', 'data_', 'cloud', 'virtualization', 'internet_protocol', 'microprocessor', 'semiconductor', 'transistor', 'integrated_circuit', 'ai', 'artificial_intelligence', 'machine_learning', 'deep_learning', 'language_model', 'neural', 'robotic_process', 'quantum_computing', 'vector_database', 'information-processing', 'calculation', 'automation', 'decision support']
        },
        {
            name: 'Communication & Media',
            terms: ['writing', 'paper', 'printing', 'book', 'library', 'postal', 'telegraph', 'telephone', 'radio', 'television', 'media', 'cinema', 'photography', 'web', 'internet', 'hypertext', 'social_media', 'communication', 'storytelling', 'publishing', 'signaling', 'cultural memory']
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
            terms: ['barter', 'currency', 'coin', 'bank', 'finance', 'commerce', 'commercial', 'trade', 'merchant', 'credit', 'insurance', 'stock', 'capital', 'corporation', 'bookkeeping', 'accounting', 'market', 'retail', 'e-commerce', 'settlement']
        },
        {
            name: 'Infrastructure & Cities',
            terms: ['shelter', 'construction', 'infrastructure', 'built environment', 'masonry', 'architecture', 'concrete', 'urban', 'city', 'aqueduct', 'sewer', 'water_', 'water system', 'well', 'cistern', 'building', 'bridge', 'skyscraper', 'housing', 'public_works', 'municipal']
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
            terms: ['art', 'artistic', 'cultural', 'music', 'theater', 'literature', 'myth', 'ritual', 'religion', 'philosophy', 'sculpture', 'painting', 'mosaic', 'heraldry', 'chivalry', 'storytelling']
        }
    ];

    const generatedBranchNames = new Map([
        ['agriculture', 'Agriculture & Food'],
        ['materials', 'Materials & Manufacturing'],
        ['energy', 'Energy & Power'],
        ['transport', 'Transport & Logistics'],
        ['computing', 'Computing & AI'],
        ['media', 'Communication & Media'],
        ['medicine', 'Medicine & Biology'],
        ['science', 'Science & Mathematics'],
        ['governance', 'Society & Governance'],
        ['finance', 'Finance & Commerce'],
        ['infrastructure', 'Infrastructure & Cities'],
        ['security', 'Security & Defense'],
        ['space', 'Space & Far Future'],
        ['culture', 'Arts & Culture']
    ]);

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
            name: 'Civil Engineering & Built Environment',
            branches: ['Infrastructure & Cities', 'Transport & Logistics', 'Materials & Manufacturing', 'Energy & Power'],
            terms: [
                'construction', 'built_environment', 'civil', 'masonry', 'concrete', 'cement', 'reinforced',
                'aggregate', 'arch', 'dome', 'vault', 'bridge', 'road', 'highway', 'railroad', 'subway',
                'canal', 'aqueduct', 'sewer', 'drainage', 'plumbing', 'dam', 'reservoir', 'qanat',
                'urban', 'municipal', 'building_code', 'sanitary_building', 'skyscraper', 'steel_frame',
                'elevator', 'mass_transit', 'infrastructure', 'public_works', 'regolith', 'lunar_construction'
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
        },
        {
            name: 'Genome Editing / CRISPR-Cas',
            branches: ['Medicine & Biology', 'Science & Mathematics', 'Computing & AI'],
            terms: [
                'crispr', 'cas9', 'cas12', 'cas13', 'genome editing', 'gene editing', 'guide rna',
                'sgrna', 'pam', 'base editing', 'prime editing', 'off-target', 'viral vector',
                'lipid nanoparticle', 'genetic engineering', 'dna sequencing', 'bioinformatics',
                'cell culture', 'ex vivo', 'in vivo', 'casgevy', 'exa-cel'
            ]
        },
        {
            name: 'Semiconductors & Integrated Circuits',
            branches: ['Computing & AI', 'Materials & Manufacturing', 'Communication & Media', 'Science & Mathematics', 'Energy & Power'],
            terms: [
                'semiconductor', 'transistor', 'mosfet', 'cmos', 'integrated_circuit', 'microchip',
                'microprocessor', 'photolithography', 'lithography', 'photoresist', 'photomask',
                'wafer', 'planar', 'vlsi', 'eda', 'hardware_description', 'process_node',
                'finfet', 'nanosheet', 'gate_all_around', 'euv', 'duv', 'dram', 'sram',
                'flash_memory', 'hbm', 'chiplet', 'silicon_photonics', 'gpu', 'accelerator',
                'system_on_chip', 'soc', 'through_silicon', 'packaging'
            ]
        },
        {
            name: 'Artificial Intelligence & Machine Learning',
            branches: ['Computing & AI', 'Science & Mathematics', 'Medicine & Biology', 'Security & Defense', 'Society & Governance'],
            terms: [
                'artificial_intelligence', 'machine_learning', 'neural_network', 'deep_learning',
                'perceptron', 'backpropagation', 'support_vector', 'decision_tree', 'random_forest',
                'reinforcement_learning', 'supervised_learning', 'unsupervised_learning', 'benchmark',
                'data_labeling', 'convolutional', 'transformer', 'language_model', 'foundation_model',
                'diffusion_model', 'generative_ai', 'retrieval_augmented', 'instruction_tuning',
                'rlhf', 'multimodal', 'model_evaluation', 'mlops', 'model_serving', 'prompt',
                'tool_using', 'ai_safety', 'alignment', 'ai_agent', 'explainable_ai', 'ai_model'
            ]
        },
        {
            name: 'Energy Systems & Grid',
            branches: ['Energy & Power', 'Infrastructure & Cities', 'Materials & Manufacturing', 'Transport & Logistics'],
            terms: ['electricity', 'grid', 'transmission', 'transformer', 'turbine', 'solar', 'wind', 'battery', 'storage', 'hydroelectric', 'geothermal', 'nuclear', 'fusion', 'microgrid', 'power_electronics', 'smart_grid']
        },
        {
            name: 'Spaceflight & Satellites',
            branches: ['Space & Far Future', 'Transport & Logistics', 'Communication & Media', 'Science & Mathematics', 'Security & Defense'],
            terms: ['rocket', 'space', 'satellite', 'orbital', 'launch', 'spacecraft', 'gps', 'constellation', 'hubble', 'telescope', 'reusable_launch', 'cubesat', 'on_orbit']
        },
        {
            name: 'Robotics & Autonomous Systems',
            branches: ['Computing & AI', 'Materials & Manufacturing', 'Transport & Logistics', 'Medicine & Biology', 'Space & Far Future'],
            terms: ['robot', 'robotic', 'servo', 'manipulator', 'autonomous', 'drone', 'slam', 'machine_vision', 'mobile_robot', 'cobot', 'warehouse_autonomous', 'humanoid', 'safe_robot']
        },
        {
            name: 'Medical Imaging & Diagnostics',
            branches: ['Medicine & Biology', 'Science & Mathematics', 'Computing & AI'],
            terms: ['x_ray', 'imaging', 'diagnostic', 'ct', 'mri', 'ultrasound', 'mammography', 'pet', 'laboratory', 'immunoassay', 'pcr', 'point_of_care', 'pulse_oximetry', 'health_record', 'telemedicine']
        },
        {
            name: 'Climate & Environmental Systems',
            branches: ['Energy & Power', 'Infrastructure & Cities', 'Science & Mathematics', 'Agriculture & Food'],
            terms: ['climate', 'environment', 'wastewater', 'pollution', 'air_quality', 'carbon', 'greenhouse_gas', 'remote_sensing', 'earth_observation', 'disaster', 'adaptation', 'desalination', 'recycling']
        },
        {
            name: 'Agriculture & Food Systems',
            branches: ['Agriculture & Food', 'Materials & Manufacturing', 'Transport & Logistics', 'Medicine & Biology'],
            terms: ['agriculture', 'crop', 'seed', 'fertilizer', 'pesticide', 'herbicide', 'tractor', 'harvester', 'irrigation', 'hydroponics', 'green_revolution', 'precision_agriculture', 'food_cold_chain', 'drone', 'farming']
        },
        {
            name: 'Cybersecurity & Cryptography',
            branches: ['Computing & AI', 'Security & Defense', 'Finance & Commerce', 'Communication & Media'],
            terms: ['cryptograph', 'encryption', 'signature', 'certificate', 'identity', 'firewall', 'intrusion', 'vulnerability', 'cyber', 'security', 'zero_trust', 'endpoint', 'post_quantum', 'tls', 'siem']
        },
        {
            name: 'Transportation & Logistics',
            branches: ['Transport & Logistics', 'Infrastructure & Cities', 'Finance & Commerce', 'Energy & Power'],
            terms: ['transport', 'logistics', 'road', 'rail', 'automobile', 'highway', 'aviation', 'aircraft', 'container', 'freight', 'warehouse', 'shipping', 'port', 'cold_chain', 'route', 'charging']
        },
        {
            name: 'Materials Science & Manufacturing',
            branches: ['Materials & Manufacturing', 'Science & Mathematics', 'Energy & Power', 'Transport & Logistics'],
            terms: ['material', 'steel', 'alloy', 'aluminum', 'polymer', 'plastic', 'rubber', 'ceramic', 'glass', 'composite', 'graphene', 'nanotechnology', 'metamaterial', 'powder_metallurgy', 'superalloy']
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
        'Civil Engineering & Built Environment': [
            {
                name: 'Foundations & Surveying',
                terms: ['surveying', 'geometry', 'construction', 'masonry', 'urbanization', 'megalithic', 'foundation']
            },
            {
                name: 'Construction Materials',
                terms: ['concrete', 'cement', 'reinforced', 'brick', 'mortar', 'steel', 'aggregate', 'material', 'biodesigned', 'regolith']
            },
            {
                name: 'Structural Systems',
                terms: ['arch', 'dome', 'vault', 'bridge', 'skyscraper', 'steel_frame', 'suspension', 'gothic', 'structure', 'elevator']
            },
            {
                name: 'Transport Infrastructure',
                terms: ['road', 'highway', 'railroad', 'rail', 'subway', 'canal', 'waystation', 'milestone', 'transit', 'bridge_toll']
            },
            {
                name: 'Water & Sanitation Infrastructure',
                terms: ['aqueduct', 'sewer', 'drainage', 'water_supply', 'plumbing', 'dam', 'reservoir', 'qanat', 'sanitation', 'chlorination']
            },
            {
                name: 'Buildings & Urban Systems',
                terms: ['urban', 'municipal', 'building_code', 'sanitary_building', 'planning', 'housing', 'mass_transit']
            },
            {
                name: 'Construction Automation & Roadmap',
                terms: ['robotic_construction', 'autonomous_lunar', 'construction_swarms', 'roadmap', 'forecast']
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
            },
            {
                name: 'Roadmap',
                terms: ['programmable_money', 'quantum_secured_financial', 'privacy_preserving_ai_markets', 'distributed_ai_labor_markets']
            }
        ],
        'Genome Editing / CRISPR-Cas': [
            {
                name: 'Foundations',
                terms: ['molecular_biology', 'dna_structure', 'dna_sequencing', 'bioinformatics', 'cell_culture', 'protein_engineering', 'dna_synthesis', 'nhej', 'hdr']
            },
            {
                name: 'Editing Platforms',
                terms: ['crispr', 'cas9', 'cas12', 'cas13', 'zinc_finger', 'talen', 'base_editing', 'prime_editing', 'crispri', 'crispra', 'nuclease']
            },
            {
                name: 'Delivery',
                terms: ['delivery', 'viral_vector', 'aav', 'lnp', 'lipid_nanoparticle', 'rnp', 'ex_vivo', 'in_vivo']
            },
            {
                name: 'Assays & Safety',
                terms: ['off_target', 'guide', 'sgrna', 'pam', 'screen', 'profiling', 'specificity', 'safety']
            },
            {
                name: 'Therapeutics',
                terms: ['therapy', 'therapeutic', 'casgevy', 'exa_cel', 'sickle', 'clinical', 'medicine']
            },
            {
                name: 'Applications',
                terms: ['synthetic_biology', 'personalized', 'agriculture', 'diagnostic', 'enhancement', 'ecosystem']
            },
            {
                name: 'Roadmap',
                terms: ['roadmap', 'forecast', 'next', 'tissue_targeted', 'clinical_prime', 'in_vivo']
            }
        ],
        'Semiconductors & Integrated Circuits': [
            {
                name: 'Materials & Devices',
                terms: ['semiconductor', 'transistor', 'mosfet', 'diode', 'led', 'photovoltaic', 'finfet', 'nanosheet', 'gate_all_around', 'crystal']
            },
            {
                name: 'Fabrication & Lithography',
                terms: ['fabrication', 'clean_room', 'wafer', 'photolithography', 'lithography', 'photoresist', 'photomask', 'implantation', 'etching', 'deposition', 'planarization', 'duv', 'euv', 'process_node']
            },
            {
                name: 'Circuit Integration',
                terms: ['integrated_circuit', 'microchip', 'cmos', 'logic', 'vlsi', 'system_on_chip', 'soc']
            },
            {
                name: 'Design Automation',
                terms: ['eda', 'design_automation', 'hardware_description', 'hdl', 'vlsi', 'cad', 'verification', 'synthesis']
            },
            {
                name: 'Processors & Architectures',
                terms: ['microprocessor', 'cpu', 'risc', 'gpu', 'accelerator', 'parallel_processor', 'digital_signal_processing', 'architecture']
            },
            {
                name: 'Memory & Storage',
                terms: ['dram', 'sram', 'flash_memory', 'ssd', 'hbm', 'memory', 'cache', 'storage']
            },
            {
                name: 'Packaging & Interconnect',
                terms: ['packaging', 'interconnect', 'through_silicon', 'tsv', 'chiplet', '2_5d', '3d', 'photonics', 'optical']
            },
            {
                name: 'Roadmap',
                terms: ['roadmap', 'high_na', 'nanosheet', 'gate_all_around', 'backside_power', 'silicon_photonics', 'next']
            }
        ],
        'Artificial Intelligence & Machine Learning': [
            {
                name: 'Foundations',
                terms: ['cybernetics', 'artificial_intelligence', 'symbolic', 'expert_system', 'artificial_neuron', 'logic', 'turing']
            },
            {
                name: 'Classical ML',
                terms: ['machine_learning', 'support_vector', 'decision_tree', 'random_forest', 'probabilistic', 'graphical_model', 'reinforcement_learning', 'supervised_learning', 'unsupervised_learning', 'clustering']
            },
            {
                name: 'Neural Networks',
                terms: ['neural_network', 'perceptron', 'backpropagation', 'convolutional', 'word_embedding', 'sequence_to_sequence', 'attention', 'deep_learning']
            },
            {
                name: 'Foundation Models',
                terms: ['transformer', 'language_model', 'foundation_model', 'pretraining', 'fine_tuning', 'self_supervised', 'diffusion', 'generative_ai', 'retrieval_augmented', 'instruction_tuning', 'rlhf', 'multimodal', 'prompt', 'tool_using']
            },
            {
                name: 'Data & Evaluation',
                terms: ['data_labeling', 'benchmark', 'evaluation', 'dataset', 'leaderboard', 'audit', 'helm', 'metric']
            },
            {
                name: 'Deployment & MLOps',
                terms: ['mlops', 'model_serving', 'training_cluster', 'edge_ai', 'accelerator', 'vector_database', 'inference', 'container']
            },
            {
                name: 'Safety & Governance',
                terms: ['safety', 'alignment', 'explainable', 'xai', 'governance', 'risk', 'audit', 'constitutional', 'trustworthy']
            },
            {
                name: 'Applications',
                terms: ['recommender', 'computer_vision', 'speech_recognition', 'drug_discovery', 'tutor', 'clinical', 'autonomous_vehicle']
            },
            {
                name: 'Roadmap',
                terms: ['roadmap', 'advanced_ai', 'agent', 'verifiable', 'on_device', 'ai_scientist', 'operating_system']
            }
        ],
        'Energy Systems & Grid': [
            { name: 'Foundations', terms: ['electricity', 'motor', 'steam', 'alternating_current'] },
            { name: 'Generation', terms: ['generation', 'turbine', 'hydroelectric', 'combined_cycle'] },
            { name: 'Grid & Transmission', terms: ['grid', 'transmission', 'transformer', 'power_electronics', 'high_voltage'] },
            { name: 'Storage', terms: ['battery', 'storage', 'pumped_hydro', 'lithium_ion'] },
            { name: 'Renewables', terms: ['solar', 'wind', 'geothermal', 'renewable'] },
            { name: 'Nuclear & Fusion', terms: ['nuclear', 'fusion', 'fission'] },
            { name: 'Control & Markets', terms: ['smart_grid', 'microgrid', 'control', 'market'] },
            { name: 'Roadmap', terms: ['roadmap', 'long_duration', 'fusion_power'] }
        ],
        'Spaceflight & Satellites': [
            { name: 'Launch', terms: ['rocket', 'launch', 'liquid_fuel', 'reusable'] },
            { name: 'Spacecraft Systems', terms: ['spacecraft', 'guidance', 'navigation', 'control'] },
            { name: 'Satellites', terms: ['satellite', 'cubesat', 'constellation', 'communications', 'earth_observation'] },
            { name: 'Navigation & Timing', terms: ['gps', 'navigation', 'timing'] },
            { name: 'Space Science', terms: ['telescope', 'hubble', 'observatory', 'science'] },
            { name: 'Human Spaceflight', terms: ['space_station', 'human', 'crew'] },
            { name: 'Operations', terms: ['servicing', 'rendezvous', 'operations'] },
            { name: 'Roadmap', terms: ['roadmap', 'on_orbit', 'servicing'] }
        ],
        'Robotics & Autonomous Systems': [
            { name: 'Foundations', terms: ['robotics', 'servo', 'control'] },
            { name: 'Manipulation', terms: ['manipulator', 'arm', 'grasp', 'dexterous'] },
            { name: 'Mobility & Navigation', terms: ['mobile', 'navigation', 'slam', 'drone', 'vehicle'] },
            { name: 'Perception', terms: ['vision', 'perception', 'camera', 'sensor'] },
            { name: 'Industrial Automation', terms: ['industrial', 'factory', 'warehouse', 'cobot', 'manufacturing'] },
            { name: 'Medical & Service Robots', terms: ['surgical', 'medical', 'service'] },
            { name: 'Autonomy & AI', terms: ['autonomous', 'edge_ai', 'foundation_model', 'learning'] },
            { name: 'Safety', terms: ['safe', 'verified', 'safety'] },
            { name: 'Roadmap', terms: ['roadmap', 'humanoid', 'swarm', 'construction'] }
        ],
        'Medical Imaging & Diagnostics': [
            { name: 'Foundations', terms: ['x_rays_discovery', 'medicine_clinical', 'radioactivity'] },
            { name: 'Imaging Modalities', terms: ['imaging', 'x_ray', 'ct', 'ultrasound', 'mri', 'pet', 'nuclear_medicine'] },
            { name: 'Laboratory Diagnostics', terms: ['laboratory', 'immunoassay', 'lab_on_a_chip', 'point_of_care'] },
            { name: 'Molecular Diagnostics', terms: ['pcr', 'dna_sequencing', 'molecular'] },
            { name: 'Monitoring', terms: ['monitoring', 'pulse_oximetry', 'wearable'] },
            { name: 'Digital Health', terms: ['electronic_health', 'telemedicine', 'decision_support'] },
            { name: 'Screening', terms: ['screening', 'mammography'] },
            { name: 'Roadmap', terms: ['roadmap', 'ai_diagnostic'] }
        ],
        'Climate & Environmental Systems': [
            { name: 'Measurement', terms: ['meteorology', 'observation', 'remote_sensing', 'satellite'] },
            { name: 'Pollution Control', terms: ['pollution', 'air_quality', 'catalytic', 'emissions'] },
            { name: 'Water & Waste', terms: ['wastewater', 'sludge', 'desalination', 'water'] },
            { name: 'Climate Modeling', terms: ['climate_model', 'circulation', 'forecast'] },
            { name: 'Mitigation', terms: ['carbon', 'greenhouse_gas', 'renewable', 'capture'] },
            { name: 'Adaptation', terms: ['adaptation', 'disaster', 'early_warning', 'resilience'] },
            { name: 'Ecosystem Monitoring', terms: ['environmental_dna', 'ecology', 'ecosystem'] },
            { name: 'Roadmap', terms: ['roadmap', 'direct_air', 'geoengineering'] }
        ],
        'Agriculture & Food Systems': [
            { name: 'Foundations', terms: ['agriculture', 'plow', 'crop_rotation', 'seed_selection'] },
            { name: 'Mechanization', terms: ['tractor', 'harvester', 'mechanized'] },
            { name: 'Inputs', terms: ['fertilizer', 'pesticide', 'herbicide'] },
            { name: 'Crop Science', terms: ['breeding', 'hybrid', 'genetically_modified', 'green_revolution'] },
            { name: 'Irrigation', terms: ['irrigation', 'drip'] },
            { name: 'Controlled Environments', terms: ['hydroponics', 'controlled_environment', 'vertical_farming'] },
            { name: 'Supply Chains', terms: ['cold_chain', 'supply_chain', 'food'] },
            { name: 'Digital Agriculture', terms: ['precision_agriculture', 'drone', 'gps'] },
            { name: 'Roadmap', terms: ['roadmap', 'climate_resilient'] }
        ],
        'Cybersecurity & Cryptography': [
            { name: 'Cryptographic Foundations', terms: ['cryptograph', 'encryption', 'hash', 'signature', 'tls', 'ssl'] },
            { name: 'Identity & Trust', terms: ['identity', 'certificate', 'pki', 'multi_factor', 'authentication', 'trust'] },
            { name: 'Network Security', terms: ['firewall', 'packet', 'network', 'transport'] },
            { name: 'Detection & Response', terms: ['intrusion', 'detection', 'response', 'siem', 'threat', 'soc', 'vulnerability'] },
            { name: 'Secure Software', terms: ['secure_software', 'development', 'lifecycle'] },
            { name: 'Cloud & Platform Security', terms: ['zero_trust', 'confidential', 'cloud', 'platform'] },
            { name: 'Governance & Risk', terms: ['governance', 'risk', 'framework'] },
            { name: 'Roadmap', terms: ['roadmap', 'post_quantum', 'quantum_resistant', 'agility'] }
        ],
        'Transportation & Logistics': [
            { name: 'Road & Rail', terms: ['road', 'rail', 'highway', 'automobile', 'vehicle'] },
            { name: 'Maritime & Ports', terms: ['maritime', 'port', 'shipping', 'canal'] },
            { name: 'Aviation', terms: ['aviation', 'aircraft', 'airliner', 'air_traffic'] },
            { name: 'Intermodal Freight', terms: ['intermodal', 'container', 'freight'] },
            { name: 'Warehousing', terms: ['warehouse'] },
            { name: 'Cold Chain', terms: ['cold_chain', 'refrigeration'] },
            { name: 'Digital Logistics', terms: ['gps', 'route', 'optimization', 'supply_chain', 'software'] },
            { name: 'Electrification', terms: ['electric', 'charging'] },
            { name: 'Roadmap', terms: ['roadmap', 'autonomous_freight', 'autonomous_vehicle'] }
        ],
        'Materials Science & Manufacturing': [
            { name: 'Foundations', terms: ['stone', 'pottery', 'bronze', 'iron'] },
            { name: 'Metals & Alloys', terms: ['steel', 'aluminum', 'stainless', 'alloy', 'superalloy', 'metallurgy'] },
            { name: 'Polymers', terms: ['polymer', 'plastic', 'rubber'] },
            { name: 'Ceramics & Glass', terms: ['ceramic', 'glass', 'concrete'] },
            { name: 'Composites', terms: ['composite', 'carbon_fiber'] },
            { name: 'Semiconductor Materials', terms: ['deposition', 'semiconductor', 'atomic_layer'] },
            { name: 'Advanced Manufacturing', terms: ['powder_metallurgy', 'additive', 'manufacturing'] },
            { name: 'Materials Discovery', terms: ['materials_informatics', 'graphene', 'nanotechnology', 'materials_genome'] },
            { name: 'Roadmap', terms: ['roadmap', 'metamaterial', 'exotic', 'self_healing'] }
        ]
    };

    function setStatus(message, state = '') {
        if (!statusEl) return;
        statusEl.textContent = message;
        statusEl.classList.toggle('is-error', state === 'error');
        statusEl.setAttribute('aria-live', state === 'error' ? 'assertive' : 'polite');
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

    function formatStatus(value) {
        return String(value || '').replaceAll('_', ' ');
    }

    function formatDate(value) {
        if (typeof value !== 'number') return String(value);
        if (value < 0) return `${Math.abs(value).toLocaleString()} BCE`;
        return String(value);
    }

    function formatConfidence(value) {
        return typeof value === 'number' ? `${Math.round(value * 100)}%` : 'unknown';
    }

    function getHashTechId() {
        const raw = decodeURIComponent(window.location.hash.replace(/^#/, ''));
        if (!raw) return null;
        return raw.startsWith('tech-') ? raw.slice(5) : raw;
    }

    function setHashTechId(id) {
        const nextHash = `#tech-${encodeURIComponent(id)}`;
        if (window.location.hash === nextHash) return;
        window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}${nextHash}`);
    }

    function clearSelectedMarkers() {
        document
            .querySelectorAll('.branch-tech-chip.is-selected, .sorted-table tr.is-selected, .sorted-tech-link.is-selected')
            .forEach(el => {
                el.classList.remove('is-selected');
                el.removeAttribute('aria-current');
            });
    }

    function updateSelectedMarkers() {
        clearSelectedMarkers();
        if (!selectedTechId) return;
        const chip = document.getElementById(`branch-tech-${selectedTechId}`);
        if (chip) {
            chip.classList.add('is-selected');
            chip.setAttribute('aria-current', 'true');
        }
        const row = document.getElementById(`tech-${selectedTechId}`);
        if (row) {
            row.classList.add('is-selected');
            const link = row.querySelector('.sorted-tech-link');
            link?.classList.add('is-selected');
            link?.setAttribute('aria-current', 'true');
        }
    }

    function selectTechnology(id, options = {}) {
        if (!id || !activeGraph?.byId.has(id)) return;
        selectedTechId = id;
        if (options.updateHash !== false) setHashTechId(id);
        renderDetail(activeGraph.byId.get(id));
        updateSelectedMarkers();
        if (selectionStatusEl) selectionStatusEl.textContent = `Selected ${formatTechLabel(id)}.`;
        if (options.revealDetail && detailPanel && window.matchMedia('(max-width: 900px)').matches) {
            detailPanel.scrollIntoView({
                behavior: reducedMotionQuery.matches ? 'auto' : 'smooth',
                block: 'start'
            });
        }
        if (options.focusDetail) {
            detailPanel?.querySelector('h2')?.focus({ preventScroll: true });
        }
    }

    function classificationText(item) {
        return `${item.id} ${item.name} ${item.description || ''} ${(item.prerequisites || []).join(' ')}`.toLowerCase();
    }

    function classifyBranch(item, text = classificationText(item)) {
        const generatedMatch = item.id.match(/^(ancient|classical|medieval|renaissance|industrial|modern|future)_([a-z]+)_/);
        if (generatedMatch && generatedBranchNames.has(generatedMatch[2])) {
            return generatedBranchNames.get(generatedMatch[2]);
        }

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

    function classifyFields(item, branch, text = classificationText(item)) {
        const explicitFields = Array.isArray(item.fields) ? item.fields : [];
        const fields = [...explicitFields];
        for (const rule of fieldRules) {
            if (fields.includes(rule.name)) continue;
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
            } else if ([
                'Genome Editing / CRISPR-Cas',
                'Semiconductors & Integrated Circuits',
                'Artificial Intelligence & Machine Learning',
                'Energy Systems & Grid',
                'Spaceflight & Satellites',
                'Robotics & Autonomous Systems',
                'Medical Imaging & Diagnostics',
                'Climate & Environmental Systems',
                'Agriculture & Food Systems',
                'Cybersecurity & Cryptography',
                'Transportation & Logistics',
                'Materials Science & Manufacturing'
            ].includes(rule.name) && termScore > 0) {
                fields.push(rule.name);
            }
        }
        return [...new Set(fields)];
    }

    function classifyFieldLane(item, fieldName, text = classificationText(item)) {
        if (item.fieldLanes && item.fieldLanes[fieldName]) return item.fieldLanes[fieldName];
        const lanes = fieldLaneRules[fieldName] || [];
        if (!lanes.length) return 'General';
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

    function formatTechLabel(id) {
        return activeGraph?.byId.get(id)?.name || id;
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
        row.addEventListener('click', event => {
            if (event.target.closest('.sorted-tech-link')) return;
            selectTechnology(item.id, { revealDetail: true });
        });

        const nameCell = document.createElement('th');
        nameCell.scope = 'row';
        const name = document.createElement('a');
        name.href = `#tech-${item.id}`;
        name.className = 'sorted-tech-link';
        name.textContent = item.name;
        name.addEventListener('click', event => {
            event.preventDefault();
            event.stopPropagation();
            selectTechnology(item.id, {
                revealDetail: true,
                focusDetail: event.detail === 0
            });
        });
        nameCell.appendChild(name);
        const id = document.createElement('span');
        id.className = 'tech-id';
        id.textContent = item.id;
        nameCell.appendChild(id);
        if (item.maturity) {
            const maturity = document.createElement('span');
            maturity.className = `maturity-badge maturity-${item.maturity}`;
            maturity.textContent = item.maturity;
            nameCell.appendChild(maturity);
        }

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
        if (selectedTechId === item.id) {
            row.classList.add('is-selected');
            name.classList.add('is-selected');
            name.setAttribute('aria-current', 'true');
        }
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
        if (item.maturity) chip.dataset.maturity = item.maturity;
        if (selectedTechId === item.id) {
            chip.classList.add('is-selected');
            chip.setAttribute('aria-current', 'true');
        }
        chip.addEventListener('click', event => {
            event.preventDefault();
            selectTechnology(item.id, {
                revealDetail: true,
                focusDetail: event.detail === 0
            });
        });
        return chip;
    }

    function appendDetailRow(parent, labelText, valueText) {
        if (valueText === undefined || valueText === null || valueText === '') return;
        const row = document.createElement('p');
        row.className = 'sorted-detail-row';
        const label = document.createElement('strong');
        label.textContent = `${labelText}: `;
        row.append(label, document.createTextNode(valueText));
        parent.appendChild(row);
    }

    function createDetailBadge(text, className = '') {
        const badge = document.createElement('span');
        badge.className = `sorted-detail-badge${className ? ` ${className}` : ''}`;
        badge.textContent = text;
        return badge;
    }

    function createSelectableTechButton(id) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'relationship-chip';
        button.textContent = formatTechLabel(id);
        button.addEventListener('click', event => {
            selectTechnology(id, {
                revealDetail: true,
                focusDetail: event.detail === 0
            });
        });
        return button;
    }

    function appendSourceLinks(parent, sources) {
        if (!Array.isArray(sources) || !sources.length) return;
        const list = document.createElement('ul');
        list.className = 'sorted-source-list';
        for (const source of sources) {
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
        parent.appendChild(list);
    }

    function appendEdgeList(parent, titleText, entries) {
        const section = document.createElement('section');
        section.className = 'sorted-detail-section';
        const title = document.createElement('h3');
        title.textContent = titleText;
        section.appendChild(title);

        if (!entries.length) {
            const empty = document.createElement('p');
            empty.className = 'relationship-empty';
            empty.textContent = 'None';
            section.appendChild(empty);
            parent.appendChild(section);
            return;
        }

        const list = document.createElement('ul');
        list.className = 'sorted-edge-list';
        const renderEntries = limit => {
            list.replaceChildren();
            for (const entry of entries.slice(0, limit)) {
                const edge = entry.edge || {};
                const item = document.createElement('li');
                const head = document.createElement('div');
                head.className = 'sorted-edge-head';
                head.appendChild(createSelectableTechButton(entry.id));

                const meta = document.createElement('span');
                meta.className = 'sorted-edge-meta';
                meta.textContent = [
                    edge.type && formatStatus(edge.type),
                    `confidence ${formatConfidence(edge.confidence)}`,
                    edge.evidence_level && formatStatus(edge.evidence_level)
                ].filter(Boolean).join(' · ');
                head.appendChild(meta);
                item.appendChild(head);

                if (edge.note) {
                    const note = document.createElement('p');
                    note.className = 'sorted-edge-note';
                    note.textContent = edge.note;
                    item.appendChild(note);
                }
                if (Array.isArray(edge.sources) && edge.sources.length) {
                    appendSourceLinks(item, edge.sources);
                }
                list.appendChild(item);
            }
            if (entries.length > limit) {
                const item = document.createElement('li');
                item.className = 'sorted-edge-overflow';
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'sorted-edge-more';
                button.textContent = `Show ${entries.length - limit} more`;
                button.addEventListener('click', () => renderEntries(entries.length));
                item.appendChild(button);
                list.appendChild(item);
            }
        };
        renderEntries(24);
        section.appendChild(list);
        parent.appendChild(section);
    }

    function renderDetail(item) {
        if (!detailPanel) return;
        detailPanel.replaceChildren();

        if (!item) {
            const empty = document.createElement('p');
            empty.className = 'sorted-detail-empty';
            empty.textContent = 'No technology selected';
            detailPanel.appendChild(empty);
            return;
        }

        const header = document.createElement('div');
        header.className = 'sorted-detail-header';
        const title = document.createElement('h2');
        title.id = 'sorted-detail-heading';
        title.tabIndex = -1;
        title.textContent = item.name;
        header.appendChild(title);
        const id = document.createElement('span');
        id.className = 'tech-id';
        id.textContent = item.id;
        header.appendChild(id);

        const badges = document.createElement('div');
        badges.className = 'sorted-detail-badges';
        badges.appendChild(createDetailBadge(item.era || 'Unknown era'));
        if (item.maturity) badges.appendChild(createDetailBadge(formatStatus(item.maturity), `maturity-${item.maturity}`));
        if (item.reviewStatus) badges.appendChild(createDetailBadge(formatStatus(item.reviewStatus)));
        header.appendChild(badges);
        detailPanel.appendChild(header);

        if (item.description) {
            const description = document.createElement('p');
            description.className = 'sorted-detail-description';
            description.textContent = item.description;
            detailPanel.appendChild(description);
        }

        const facts = document.createElement('section');
        facts.className = 'sorted-detail-section sorted-detail-facts';
        appendDetailRow(facts, 'First known', item.firstKnownDate !== undefined
            ? `${formatDate(item.firstKnownDate)} (${item.datePrecision || 'unknown'}; ${item.region || 'region unknown'})`
            : 'Unknown');
        appendDetailRow(facts, 'Branch', item.branch || 'Other');
        appendDetailRow(facts, 'Depth', String(item.level ?? 0));
        if (Array.isArray(item.fields) && item.fields.length) {
            appendDetailRow(facts, 'Fields', item.fields.join(', '));
        }
        const lanes = Object.entries(item.fieldLanes || {})
            .map(([field, lane]) => `${field}: ${lane}`);
        if (lanes.length) appendDetailRow(facts, 'Lanes', lanes.join('; '));
        detailPanel.appendChild(facts);

        if (item.roadmap) {
            const roadmap = document.createElement('section');
            roadmap.className = 'sorted-detail-section';
            const roadmapTitle = document.createElement('h3');
            roadmapTitle.textContent = 'Roadmap';
            roadmap.appendChild(roadmapTitle);
            appendDetailRow(roadmap, 'Role', item.roadmap.role || 'forecast');
            appendDetailRow(roadmap, 'Timeframe', item.roadmap.timeframe || 'unknown');
            appendDetailRow(roadmap, 'Confidence', item.roadmap.confidence || 'unknown');
            if (item.roadmap.rationale) appendDetailRow(roadmap, 'Rationale', item.roadmap.rationale);
            if (Array.isArray(item.roadmap.blockers) && item.roadmap.blockers.length) {
                appendDetailRow(roadmap, 'Blockers', item.roadmap.blockers.join(', '));
            }
            detailPanel.appendChild(roadmap);
        }

        const prereqEntries = getPrerequisiteIds(item)
            .filter(id => activeGraph?.byId.has(id))
            .map(id => ({
                id,
                edge: getDependencyEdges(item).find(edge => edge.prerequisite === id)
            }))
            .sort((a, b) => formatTechLabel(a.id).localeCompare(formatTechLabel(b.id)));
        appendEdgeList(detailPanel, 'Depends On', prereqEntries);

        const unlockEntries = (activeGraph?.dependents.get(item.id) || [])
            .filter(id => activeGraph.byId.has(id))
            .map(id => {
                const dependent = activeGraph.byId.get(id);
                return {
                    id,
                    edge: getDependencyEdges(dependent).find(edge => edge.prerequisite === item.id)
                };
            })
            .sort((a, b) => formatTechLabel(a.id).localeCompare(formatTechLabel(b.id)));
        appendEdgeList(detailPanel, 'Unlocks', unlockEntries);

        if (Array.isArray(item.sources) && item.sources.length) {
            const sources = document.createElement('section');
            sources.className = 'sorted-detail-section';
            const sourceTitle = document.createElement('h3');
            sourceTitle.textContent = 'Sources';
            sources.appendChild(sourceTitle);
            appendSourceLinks(sources, item.sources);
            detailPanel.appendChild(sources);
        }
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

            const scroller = document.createElement('div');
            scroller.className = 'branch-era-scroll';
            scroller.tabIndex = 0;
            scroller.setAttribute('aria-label', `${branch} eras; scroll horizontally to view every era`);
            scroller.appendChild(grid);
            section.appendChild(scroller);
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
            renderDetail(selectedTechId ? graph.byId.get(selectedTechId) : null);
            updateSelectedMarkers();
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
            renderDetail(selectedTechId ? graph.byId.get(selectedTechId) : null);
            updateSelectedMarkers();
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
                <caption class="visually-hidden">${era} technologies</caption>
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
            const scroller = document.createElement('div');
            scroller.className = 'sorted-table-scroll';
            scroller.tabIndex = 0;
            scroller.setAttribute('aria-label', `${era} technologies; scroll horizontally to view every column`);
            scroller.appendChild(table);
            section.appendChild(scroller);
            fragment.appendChild(section);
        }

        sectionsEl.appendChild(fragment);
        renderDetail(selectedTechId ? graph.byId.get(selectedTechId) : null);
        updateSelectedMarkers();
    }

    try {
        setStatus('Loading technologies...');
        const resp = await fetch('api/tech-tree');
        if (!resp.ok) throw new Error('Failed to load tech tree');
        const data = await resp.json();
        const graph = buildGraph(data);
        activeGraph = graph;

        for (const item of data) {
            const itemClassificationText = classificationText(item);
            item.level = graph.level.get(item.id) || 0;
            item.branch = classifyBranch(item, itemClassificationText);
            item.fields = classifyFields(item, item.branch, itemClassificationText);
            item.fieldLanes = {};
            for (const field of item.fields) {
                item.fieldLanes[field] = classifyFieldLane(item, field, itemClassificationText);
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
        const hashTechId = getHashTechId();
        if (hashTechId && graph.byId.has(hashTechId)) selectedTechId = hashTechId;
        render(data, graph);
        mainEl?.setAttribute('aria-busy', 'false');

        const scheduleRender = ({ resetLimit = true } = {}) => {
            window.clearTimeout(searchTimer);
            if (resetLimit) visibleLimit = pageSize;
            if (renderFrameId !== null) window.cancelAnimationFrame(renderFrameId);
            renderFrameId = window.requestAnimationFrame(() => {
                renderFrameId = null;
                render(data, graph);
            });
        };
        searchInput?.addEventListener('input', () => {
            window.clearTimeout(searchTimer);
            searchTimer = window.setTimeout(() => scheduleRender(), 100);
        });
        searchInput?.addEventListener('keydown', event => {
            if (event.key !== 'Escape') return;
            window.clearTimeout(searchTimer);
            searchInput.value = '';
            scheduleRender();
            setStatus('Search cleared.');
        });
        viewMode?.addEventListener('change', scheduleRender);
        fieldFilter?.addEventListener('change', scheduleRender);
        branchFilter?.addEventListener('change', scheduleRender);
        eraFilter?.addEventListener('change', scheduleRender);
        sortMode?.addEventListener('change', scheduleRender);
        resetBtn?.addEventListener('click', () => {
            window.clearTimeout(searchTimer);
            if (searchInput) searchInput.value = '';
            if (viewMode) viewMode.value = 'branches';
            if (fieldFilter) fieldFilter.value = 'all';
            if (branchFilter) branchFilter.value = 'all';
            if (eraFilter) eraFilter.value = 'all';
            if (sortMode) sortMode.value = 'era';
            scheduleRender();
            setStatus('Filters cleared.');
            searchInput?.focus();
        });
        showMoreBtn?.addEventListener('click', () => {
            visibleLimit += pageSize;
            scheduleRender({ resetLimit: false });
        });
        window.addEventListener('hashchange', () => {
            const hashId = getHashTechId();
            if (hashId && graph.byId.has(hashId)) {
                selectTechnology(hashId, { updateHash: false, revealDetail: true });
            } else {
                selectedTechId = null;
                renderDetail(null);
                updateSelectedMarkers();
                if (selectionStatusEl) selectionStatusEl.textContent = 'Selection cleared.';
            }
        });
    } catch (err) {
        console.error('Error loading sorted tech view:', err);
        setStatus('Failed to load technologies. Refresh the page or check the server.', 'error');
        mainEl?.setAttribute('aria-busy', 'false');
    }

    window.addEventListener('beforeunload', () => {
        window.clearTimeout(searchTimer);
        if (renderFrameId !== null) window.cancelAnimationFrame(renderFrameId);
    });
});

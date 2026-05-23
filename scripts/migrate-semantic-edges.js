const fs = require('fs');
const path = require('path');
const {
    ERA_DEFAULT_DATES,
    getDependencyEdges,
    getPrerequisiteIds,
    sourceQualityWeight
} = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILES = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json'))
    .filter(file => file !== 'taxonomy.json')
    .sort();

const NODE_DATE_OVERRIDES = {
    fire_control: { firstKnownDate: -400000, datePrecision: 'millennium', region: 'Africa and Eurasia' },
    stone_tool_making: { firstKnownDate: -3300000, datePrecision: 'millennium', region: 'East Africa' },
    oral_tradition_storytelling: { firstKnownDate: -250000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    foraging_and_botany: { firstKnownDate: -200000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    early_astronomy_observation: { firstKnownDate: -3000, datePrecision: 'millennium', region: 'Mesopotamia, Egypt, China, and other early societies' },
    writing: { firstKnownDate: -3200, datePrecision: 'century', region: 'Mesopotamia and Egypt' },
    record_keeping: { firstKnownDate: -8000, datePrecision: 'millennium', region: 'Southwest Asia and other early farming societies' },
    bureaucracy: { firstKnownDate: -3000, datePrecision: 'century', region: 'Mesopotamia, Egypt, China, and other early states' },
    flash_memory: { firstKnownDate: 1984, datePrecision: 'exact', region: 'Japan / global semiconductor industry' },
    solid_state_drives_ssd_flash_memory: { firstKnownDate: 1991, datePrecision: 'decade', region: 'Global electronics industry' },
    vector_databases: { firstKnownDate: 2019, datePrecision: 'decade', region: 'Global software industry' },
    retrieval_augmented_generation: { firstKnownDate: 2020, datePrecision: 'exact', region: 'Global AI research community' },
    recommender_systems: { firstKnownDate: 1992, datePrecision: 'decade', region: 'Global software and research community' },
    crispr_adaptive_immunity: { firstKnownDate: 1987, datePrecision: 'exact', region: 'Japan and global microbiology research' },
    cas9_programmable_nuclease: { firstKnownDate: 2012, datePrecision: 'exact', region: 'Global molecular biology research' },
    single_guide_rna_design: { firstKnownDate: 2012, datePrecision: 'exact', region: 'Global molecular biology research' },
    pam_specificity_engineering: { firstKnownDate: 2012, datePrecision: 'decade', region: 'Global molecular biology research' },
    crispr_gene_editing: { firstKnownDate: 2013, datePrecision: 'exact', region: 'Global molecular biology research' },
    crispr_off_target_profiling: { firstKnownDate: 2013, datePrecision: 'decade', region: 'Global genome-editing research' },
    pooled_crispr_screens: { firstKnownDate: 2014, datePrecision: 'exact', region: 'Global functional-genomics research' },
    crispri_crispra: { firstKnownDate: 2013, datePrecision: 'exact', region: 'Global functional-genomics research' },
    crispr_delivery_aav_lnp_rnp: { firstKnownDate: 2015, datePrecision: 'decade', region: 'Global therapeutic research' },
    ex_vivo_crispr_cell_therapy: { firstKnownDate: 2016, datePrecision: 'decade', region: 'Global clinical research' },
    base_editing: { firstKnownDate: 2016, datePrecision: 'exact', region: 'Global genome-editing research' },
    prime_editing: { firstKnownDate: 2019, datePrecision: 'exact', region: 'Global genome-editing research' },
    cas12_cas13_editing_platforms: { firstKnownDate: 2015, datePrecision: 'decade', region: 'Global genome-editing research' },
    crispr_diagnostics: { firstKnownDate: 2016, datePrecision: 'decade', region: 'Global diagnostics research' },
    casgevy_exa_cel: { firstKnownDate: 2023, datePrecision: 'exact', region: 'United Kingdom and United States' },
    approved_crispr_therapies: { firstKnownDate: 2023, datePrecision: 'exact', region: 'United Kingdom, United States, and global medicine' },
    in_vivo_crispr_therapeutics: { firstKnownDate: 2030, datePrecision: 'decade', region: 'Forecast / global medicine' },
    tool_using_language_models: { firstKnownDate: 2022, datePrecision: 'exact', region: 'Global AI research community' },
    synthetic_biology: { firstKnownDate: 2000, datePrecision: 'decade', region: 'Global biotechnology research' },
    telegraph: { firstKnownDate: 1837, datePrecision: 'decade', region: 'United States and Europe' },
    telephone: { firstKnownDate: 1876, datePrecision: 'exact', region: 'United States' },
    telephone_exchange: { firstKnownDate: 1878, datePrecision: 'exact', region: 'United States' },
    telegraph_cables_transoceanic: { firstKnownDate: 1866, datePrecision: 'exact', region: 'Atlantic Ocean / United Kingdom and North America' },
    coaxial_cable: { firstKnownDate: 1880, datePrecision: 'decade', region: 'United Kingdom and United States' },
    automatic_telephone_switching: { firstKnownDate: 1891, datePrecision: 'exact', region: 'United States' },
    radio_telegraphy_wireless_communication: { firstKnownDate: 1895, datePrecision: 'decade', region: 'Europe and North America' },
    radio: { firstKnownDate: 1906, datePrecision: 'decade', region: 'Global communications industry' },
    telecommunications: { firstKnownDate: 1932, datePrecision: 'decade', region: 'Global standards and carrier networks' },
    microwave_relay_networks: { firstKnownDate: 1947, datePrecision: 'decade', region: 'United States and Europe' },
    information_theory: { firstKnownDate: 1948, datePrecision: 'exact', region: 'United States' },
    frequency_division_multiplexing: { firstKnownDate: 1910, datePrecision: 'decade', region: 'Global carrier networks' },
    time_division_multiplexing: { firstKnownDate: 1960, datePrecision: 'decade', region: 'Global digital carrier networks' },
    packet_switching: { firstKnownDate: 1961, datePrecision: 'decade', region: 'United States and United Kingdom' },
    computer_networking: { firstKnownDate: 1969, datePrecision: 'exact', region: 'United States' },
    internet_protocols_tcp_ip_arpanet: { firstKnownDate: 1974, datePrecision: 'exact', region: 'United States' },
    local_area_networks: { firstKnownDate: 1970, datePrecision: 'decade', region: 'United States and global computing industry' },
    ethernet: { firstKnownDate: 1973, datePrecision: 'exact', region: 'United States' },
    internet: { firstKnownDate: 1983, datePrecision: 'exact', region: 'United States and global research networks' },
    domain_name_system: { firstKnownDate: 1983, datePrecision: 'exact', region: 'United States and global internet' },
    border_gateway_protocol: { firstKnownDate: 1989, datePrecision: 'exact', region: 'Global internet' },
    network_time_protocol: { firstKnownDate: 1985, datePrecision: 'exact', region: 'United States and global internet' },
    world_wide_web: { firstKnownDate: 1989, datePrecision: 'exact', region: 'CERN / Switzerland' },
    http_protocol: { firstKnownDate: 1991, datePrecision: 'exact', region: 'CERN / global web' },
    web_browsers: { firstKnownDate: 1990, datePrecision: 'exact', region: 'CERN / global web' },
    fiber_optics: { firstKnownDate: 1970, datePrecision: 'exact', region: 'United Kingdom, United States, and global carrier networks' },
    dense_wavelength_division_multiplexing: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global optical-networking industry' },
    submarine_fiber_optic_cables: { firstKnownDate: 1988, datePrecision: 'exact', region: 'Atlantic Ocean and global carrier networks' },
    cellular_networks: { firstKnownDate: 1979, datePrecision: 'decade', region: 'Japan, Nordic countries, and United States' },
    gsm_digital_cellular: { firstKnownDate: 1991, datePrecision: 'exact', region: 'Europe and global mobile industry' },
    lte_4g_networks: { firstKnownDate: 2009, datePrecision: 'exact', region: 'Global mobile industry' },
    five_g_new_radio: { firstKnownDate: 2018, datePrecision: 'exact', region: 'Global mobile industry' },
    mobile_phones: { firstKnownDate: 1973, datePrecision: 'exact', region: 'United States and global mobile industry' },
    mobile_broadband_networks: { firstKnownDate: 2001, datePrecision: 'decade', region: 'Global mobile industry' },
    wifi_wireless_networking: { firstKnownDate: 1997, datePrecision: 'exact', region: 'Global IEEE 802.11 ecosystem' },
    bluetooth_short_range: { firstKnownDate: 1998, datePrecision: 'exact', region: 'Global device industry' },
    smartphones: { firstKnownDate: 1994, datePrecision: 'decade', region: 'Global mobile computing industry' },
    internet_of_things_iot_ubiquitous_connectivity: { firstKnownDate: 1999, datePrecision: 'decade', region: 'Global embedded-networking industry' },
    rfid_tracking: { firstKnownDate: 1973, datePrecision: 'decade', region: 'Global logistics and identification systems' },
    email_messaging_protocols: { firstKnownDate: 1971, datePrecision: 'exact', region: 'United States / ARPANET' },
    voice_over_ip: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global internet' },
    content_delivery_networks: { firstKnownDate: 1998, datePrecision: 'exact', region: 'United States and global internet' },
    mesh_wifi_networks: { firstKnownDate: 2003, datePrecision: 'decade', region: 'Global wireless-networking industry' },
    cable_modems_docsis: { firstKnownDate: 1997, datePrecision: 'exact', region: 'North America and global cable networks' },
    digital_subscriber_line_dsl: { firstKnownDate: 1990, datePrecision: 'decade', region: 'Global telephone-carrier networks' },
    network_management_snmp: { firstKnownDate: 1988, datePrecision: 'exact', region: 'Global internet' },
    software_defined_networking: { firstKnownDate: 2008, datePrecision: 'decade', region: 'Global networking research and industry' },
    tls_ssl_secure_transport: { firstKnownDate: 1995, datePrecision: 'decade', region: 'Global internet' },
    communications_satellites: { firstKnownDate: 1962, datePrecision: 'exact', region: 'United States and global satellite networks' },
    quantum_internet: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / global quantum-networking research' },
    '5g_6g_communication_networks': { firstKnownDate: 2030, datePrecision: 'decade', region: 'Forecast / global mobile industry' }
};

const DEPENDENCY_REPLACEMENTS = {
    bureaucracy: 'record_keeping',
    public_health_systems: 'sewers_and_drainage',
    astronomy: 'early_astronomy_observation',
    early_medicine: 'herbal_medicine_preparation',
    engineering: 'construction',
    hospitals_early: 'military_field_medicine',
    plant_breeding_hybridization: 'selective_seed_saving',
    tungsten_filament_production: 'light_bulb',
    financial_derivatives: 'stock_exchange_modern',
    automobile: 'internal_combustion_engine',
    clockwork_mechanisms: 'mechanical_clocks',
    double_entry_bookkeeping: 'double_entry_diffusion',
    statistics_advanced_data_analysis: 'probability_theory',
    public_art_museums: 'oil_painting',
    drug_delivery_systems_targeted: 'biochemistry',
    natural_language_processing_advanced: 'deep_learning_neural_networks'
};

const REMOVE_DEPENDENCIES = new Map([
    ['stone_tool_making', new Set(['fire_control'])],
    ['oral_tradition_storytelling', new Set(['fire_control'])],
    ['vector_databases', new Set(['large_language_models'])],
    ['retrieval_augmented_generation', new Set(['vector_databases'])],
    ['flash_memory', new Set(['solid_state_drives_ssd_flash_memory'])],
    ['solid_state_drives_ssd_flash_memory', new Set(['personal_computers'])],
    ['experimental_controls', new Set(['probability_statistics_inference'])],
    ['art_conservation_workshops', new Set(['public_museum_catalogs'])],
    ['lipid_nanoparticles', new Set(['messenger_rna_therapeutics'])],
    ['synthetic_biology', new Set(['crispr_gene_editing'])],
    ['5g_6g_communication_networks', new Set(['mobile_phones', 'advanced_ai'])],
    ['submarine_fiber_optic_cables', new Set(['dense_wavelength_division_multiplexing'])]
]);

const ADD_DEPENDENCIES = new Map([
    ['solid_state_drives_ssd_flash_memory', ['flash_memory']],
    ['vector_databases', ['information_theory']],
    ['retrieval_augmented_generation', ['search_engines']],
    ['experimental_controls', ['probability_theory']],
    ['5g_6g_communication_networks', ['five_g_new_radio']],
    ['submarine_fiber_optic_cables', ['lasers']]
]);

const EDGE_OVERRIDES = {
    'foraging_and_botany|oral_tradition_storytelling': {
        type: 'common_dependency',
        confidence: 0.45,
        evidence_level: 'expert_inference',
        note: 'Shared knowledge transmission helps preserve ecological knowledge, but it is not a hard technical prerequisite.',
        reviewStatus: 'source_checked'
    },
    'stone_tool_making|fire_control': null,
    'oral_tradition_storytelling|fire_control': null,
    'flash_memory|solid_state_drives_ssd_flash_memory': null,
    'solid_state_drives_ssd_flash_memory|flash_memory': {
        type: 'required',
        confidence: 0.9,
        evidence_level: 'expert_inference',
        note: 'Flash memory is the non-volatile storage component used by flash-based SSDs; the product depends on the component, not the reverse.',
        reviewStatus: 'source_checked'
    },
    'vector_databases|large_language_models': null,
    'retrieval_augmented_generation|vector_databases': null,
    'retrieval_augmented_generation|search_engines': {
        type: 'enabling',
        confidence: 0.85,
        evidence_level: 'primary_source',
        note: 'RAG requires retrieval from an external corpus, but the retrieval system can be classic search or another database, not necessarily a vector database.',
        reviewStatus: 'source_checked'
    },
    'vector_databases|machine_learning_early_algorithms': {
        type: 'enabling',
        confidence: 0.75,
        evidence_level: 'expert_inference',
        note: 'Embedding models and nearest-neighbor methods make vector databases useful, but LLMs are not required.',
        reviewStatus: 'source_checked'
    },
    'recommender_systems|machine_learning_early_algorithms': {
        type: 'enabling',
        confidence: 0.8,
        evidence_level: 'review',
        note: 'Recommender systems draw on collaborative filtering, ranking, and machine-learning methods rather than one specific random-forest citation.',
        reviewStatus: 'source_checked'
    },
    'stone_tool_making|': {
        type: 'historical_predecessor',
        confidence: 0.9,
        evidence_level: 'textbook',
        note: 'Stone tools precede controlled fire and are treated as a root material technology in this graph.',
        reviewStatus: 'source_checked'
    }
};

const CRISPR_EDGE_TYPES = {
    'cas9_programmable_nuclease|crispr_adaptive_immunity': ['historical_predecessor', 'Discovery of CRISPR-Cas immunity precedes engineering Cas9 as a programmable nuclease.'],
    'crispr_gene_editing|cas9_programmable_nuclease': ['required', 'Programmable Cas9 nuclease activity is the core platform for early CRISPR genome editing.'],
    'crispr_off_target_profiling|crispr_gene_editing': ['enabling', 'Off-target profiling is an assay layer for safer CRISPR use, not a prerequisite for discovering editing.'],
    'pooled_crispr_screens|crispr_gene_editing': ['enabling', 'Pooled screens build on CRISPR editing plus guide libraries and sequencing.'],
    'crispri_crispra|crispr_gene_editing': ['enabling', 'CRISPRi/a adapts CRISPR targeting into regulation rather than cleavage-only editing.'],
    'crispr_delivery_aav_lnp_rnp|crispr_gene_editing': ['commercial_or_scaling_dependency', 'Delivery methods are scaling and therapeutic-enablement dependencies for CRISPR use in organisms and patients.'],
    'ex_vivo_crispr_cell_therapy|crispr_delivery_aav_lnp_rnp': ['commercial_or_scaling_dependency', 'Cell therapies require delivery/manufacturing workflows for edited cells.'],
    'approved_crispr_therapies|ex_vivo_crispr_cell_therapy': ['commercial_or_scaling_dependency', 'Approved therapies depend on clinical manufacturing, evidence, and regulatory approval, not only edit chemistry.'],
    'in_vivo_crispr_therapeutics|crispr_delivery_aav_lnp_rnp': ['commercial_or_scaling_dependency', 'In vivo therapy depends heavily on safe tissue-targeted delivery.']
};

const TELECOM_FIELD = 'Telecommunications & Networking';

const TELECOM_FIELD_LANES = {
    telegraph: 'Foundations & Switching',
    telephone: 'Foundations & Switching',
    telephone_exchange: 'Foundations & Switching',
    automatic_telephone_switching: 'Foundations & Switching',
    radio_telegraphy_wireless_communication: 'Foundations & Switching',
    telecommunications: 'Foundations & Switching',
    radio: 'Foundations & Switching',
    information_theory: 'Foundations & Switching',
    computer_networking: 'Foundations & Switching',
    packet_switching: 'Foundations & Switching',
    telegraph_cables_transoceanic: 'Transmission Media',
    coaxial_cable: 'Transmission Media',
    microwave_relay_networks: 'Transmission Media',
    fiber_optics: 'Transmission Media',
    frequency_division_multiplexing: 'Transmission Media',
    time_division_multiplexing: 'Transmission Media',
    dense_wavelength_division_multiplexing: 'Transmission Media',
    submarine_fiber_optic_cables: 'Transmission Media',
    communications_satellites: 'Transmission Media',
    internet_protocols_tcp_ip_arpanet: 'Protocols & Routing',
    domain_name_system: 'Protocols & Routing',
    border_gateway_protocol: 'Protocols & Routing',
    http_protocol: 'Protocols & Routing',
    email_messaging_protocols: 'Protocols & Routing',
    tls_ssl_secure_transport: 'Protocols & Routing',
    network_time_protocol: 'Protocols & Routing',
    local_area_networks: 'Access Networks',
    ethernet: 'Access Networks',
    cellular_networks: 'Access Networks',
    gsm_digital_cellular: 'Access Networks',
    lte_4g_networks: 'Access Networks',
    five_g_new_radio: 'Access Networks',
    mobile_broadband_networks: 'Access Networks',
    wifi_wireless_networking: 'Access Networks',
    bluetooth_short_range: 'Access Networks',
    cable_modems_docsis: 'Access Networks',
    digital_subscriber_line_dsl: 'Access Networks',
    internet: 'Services & Applications',
    world_wide_web: 'Services & Applications',
    web_browsers: 'Services & Applications',
    voice_over_ip: 'Services & Applications',
    smartphones: 'Services & Applications',
    mobile_phones: 'Services & Applications',
    internet_of_things_iot_ubiquitous_connectivity: 'Services & Applications',
    rfid_tracking: 'Services & Applications',
    content_delivery_networks: 'Operations & Scaling',
    mesh_wifi_networks: 'Operations & Scaling',
    network_management_snmp: 'Operations & Scaling',
    software_defined_networking: 'Operations & Scaling',
    quantum_internet: 'Roadmap',
    '5g_6g_communication_networks': 'Roadmap'
};

const FIELD_OVERRIDES = Object.fromEntries(Object.entries(TELECOM_FIELD_LANES).map(([id, lane]) => [
    id,
    {
        fields: [TELECOM_FIELD],
        fieldLanes: { [TELECOM_FIELD]: lane },
        maturity: lane === 'Roadmap' ? 'forecast' : 'established'
    }
]));

FIELD_OVERRIDES.quantum_internet.roadmap = {
    role: 'roadmap',
    timeframe: '2030s+',
    confidence: 'medium',
    blockers: ['repeater scaling', 'loss-tolerant quantum memories', 'standards and interconnection'],
    rationale: 'Quantum networking is an active research roadmap rather than a broadly deployed communication infrastructure.'
};
FIELD_OVERRIDES['5g_6g_communication_networks'].roadmap = {
    role: 'roadmap',
    timeframe: '2030s',
    confidence: 'medium',
    blockers: ['spectrum allocation', 'radio hardware maturity', 'energy efficiency', 'standards completion'],
    rationale: '6G work is in pre-commercial standardization and research, while established 5G is represented separately by 5G New Radio.'
};

const SOURCE_OVERRIDES = {
    advanced_chemistry: [
        { title: 'Chemistry', url: 'https://www.britannica.com/science/chemistry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    construction: [
        { title: 'Construction', url: 'https://www.britannica.com/technology/construction', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    scientific_method: [
        { title: 'Scientific Method', url: 'https://plato.stanford.edu/entries/scientific-method/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2025 }
    ],
    printing_press: [
        { title: 'Gutenberg Bible', url: 'https://www.loc.gov/item/2021666734', publisher: 'Library of Congress', year: 2021 }
    ],
    mathematics: [
        { title: 'Mathematics', url: 'https://www.britannica.com/science/mathematics', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    writing: [
        { title: 'How to write cuneiform', url: 'https://www.britishmuseum.org/blog/how-write-cuneiform', publisher: 'British Museum', year: 2020 }
    ],
    record_keeping: [
        { title: 'How to write cuneiform', url: 'https://www.britishmuseum.org/blog/how-write-cuneiform', publisher: 'British Museum', year: 2020 }
    ],
    woodworking_basic: [
        { title: 'Woodworking', url: 'https://www.britannica.com/technology/woodworking', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    mass_production: [
        { title: 'Mass production', url: 'https://www.britannica.com/technology/mass-production', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    codified_law: [
        { title: 'Code of Hammurabi', url: 'https://www.britannica.com/topic/Code-of-Hammurabi', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    algorithms_computation_theory: [
        { title: 'Algorithm', url: 'https://plato.stanford.edu/entries/algorithm/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2024 }
    ],
    electronics: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    masonry: [
        { title: 'Masonry', url: 'https://www.britannica.com/technology/masonry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    steam_engine: [
        { title: 'Rotative Steam Engine by Boulton and Watt, 1788', url: 'https://collection.sciencemuseumgroup.org.uk/objects/co50948/rotative-steam-engine-by-boulton-and-watt-1788-beam-engine-steam-engine', publisher: 'Science Museum Group', year: 2026 }
    ],
    geometry: [
        { title: 'Geometry', url: 'https://www.britannica.com/science/geometry', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    precision_machine_tools: [
        { title: 'American Precision Museum', url: 'https://ledger.americanprecision.org/american-precision-museum/', publisher: 'American Precision Museum', year: 2026 }
    ],
    quantum_physics: [
        { title: 'Quantum mechanics', url: 'https://www.britannica.com/science/quantum-mechanics-physics', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    philosophy: [
        { title: 'Stanford Encyclopedia of Philosophy', url: 'https://plato.stanford.edu/', publisher: 'Stanford Encyclopedia of Philosophy', year: 2026 }
    ],
    nanotechnology: [
        { title: 'About Nanotechnology', url: 'https://www.nano.gov/about-nanotechnology', publisher: 'National Nanotechnology Initiative', year: 2026 }
    ],
    guilds: [
        { title: 'Guild', url: 'https://www.britannica.com/topic/guild-trade-association', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    fire_control: [
        { title: 'Fire', url: 'https://www.britannica.com/science/fire-combustion', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    animal_husbandry: [
        { title: 'Animal breeding', url: 'https://www.britannica.com/science/animal-breeding', publisher: 'Encyclopaedia Britannica', year: 2026 }
    ],
    software_engineering: [
        { title: 'Software Engineering Body of Knowledge (SWEBOK)', url: 'https://www.computer.org/education/bodies-of-knowledge/software-engineering', publisher: 'IEEE Computer Society', year: 2025 }
    ],
    electric_motor: [
        { title: 'Motors', url: 'https://www.sparkmuseum.com/MOTORS.HTM', publisher: 'SPARK Museum of Electrical Invention', year: 2026 }
    ],
    internal_combustion_engine: [
        { title: 'Memorial - Daimler garden house in Bad Cannstatt', url: 'https://group.mercedes-benz.com/company/tradition/museums-historical-sites/daimler-memorial.html', publisher: 'Mercedes-Benz Museum', year: 2026 }
    ],
    transistors: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    integrated_circuits: [
        { title: '1960: First Planar Integrated Circuit is Fabricated', url: 'https://www.computerhistory.org/siliconengine/first-planar-integrated-circuit-is-fabricated/', publisher: 'Computer History Museum', year: 2007 }
    ],
    semiconductors: [
        { title: 'The Silicon Engine', url: 'https://www.computerhistory.org/siliconengine/', publisher: 'Computer History Museum', year: 2007 }
    ],
    telegraph: [
        { title: 'Invention of the Telegraph', url: 'https://www.loc.gov/collections/samuel-morse-papers/articles-and-essays/invention-of-the-telegraph/', publisher: 'Library of Congress', year: 2026 }
    ],
    telephone: [
        { title: 'Alexander Graham Bell and the Telephone', url: 'https://www.loc.gov/collections/alexander-graham-bell-papers/articles-and-essays/alexander-graham-bell-and-the-telephone/', publisher: 'Library of Congress', year: 2026 }
    ],
    telephone_exchange: [
        { title: 'Telephone', url: 'https://www.britannica.com/technology/telephone', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    telegraph_cables_transoceanic: [
        { title: 'Transatlantic Cable', url: 'https://ethw.org/Transatlantic_Cable', publisher: 'IEEE History Center', year: 2026 }
    ],
    coaxial_cable: [
        { title: 'Coaxial Cable', url: 'https://www.britannica.com/technology/coaxial-cable', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    automatic_telephone_switching: [
        { title: 'Telephone', url: 'https://www.britannica.com/technology/telephone', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    radio_telegraphy_wireless_communication: [
        { title: 'Guglielmo Marconi - Biographical', url: 'https://www.nobelprize.org/prizes/physics/1909/marconi/biographical/', publisher: 'Nobel Prize', year: 2026 }
    ],
    radio: [
        { title: 'Guglielmo Marconi - Biographical', url: 'https://www.nobelprize.org/prizes/physics/1909/marconi/biographical/', publisher: 'Nobel Prize', year: 2026 }
    ],
    telecommunications: [
        { title: 'History of ITU', url: 'https://www.itu.int/en/history/Pages/ITUsHistory.aspx', publisher: 'International Telecommunication Union', year: 2026 }
    ],
    microwave_relay_networks: [
        { title: 'Microwave Telecommunication', url: 'https://www.britannica.com/technology/microwave-telecommunication', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    information_theory: [
        { title: 'A Mathematical Theory of Communication', url: 'https://doi.org/10.1002/j.1538-7305.1948.tb01338.x', publisher: 'Bell System Technical Journal', year: 1948 }
    ],
    frequency_division_multiplexing: [
        { title: 'Telecommunications media - Frequency-division multiplexing', url: 'https://www.britannica.com/technology/telecommunications-media/Frequency-division-multiplexing', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    time_division_multiplexing: [
        { title: 'Telecommunications media - Time-division multiplexing', url: 'https://www.britannica.com/technology/telecommunications-media/Time-division-multiplexing', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    computer_networking: [
        { title: 'A Brief History of the Internet', url: 'https://www.internetsociety.org/internet/history-internet/brief-history-internet/', publisher: 'Internet Society', year: 2026 }
    ],
    packet_switching: [
        { title: 'On Distributed Communications: I. Introduction to Distributed Communications Networks', url: 'https://www.rand.org/pubs/research_memoranda/RM3420.html', publisher: 'RAND Corporation', year: 1964 }
    ],
    internet_protocols_tcp_ip_arpanet: [
        { title: 'A Protocol for Packet Network Intercommunication', url: 'https://doi.org/10.1109/TCOM.1974.1092259', publisher: 'IEEE Transactions on Communications', year: 1974 }
    ],
    local_area_networks: [
        { title: 'Networking', url: 'https://www.computerhistory.org/revolution/networking/19', publisher: 'Computer History Museum', year: 2026 }
    ],
    ethernet: [
        { title: 'Ethernet', url: 'https://www.computerhistory.org/revolution/networking/19/381', publisher: 'Computer History Museum', year: 2026 }
    ],
    internet: [
        { title: 'ARPANET', url: 'https://www.darpa.mil/about-us/timeline/arpanet', publisher: 'DARPA', year: 2026 }
    ],
    domain_name_system: [
        { title: 'RFC 1034: Domain Names - Concepts and Facilities', url: 'https://datatracker.ietf.org/doc/html/rfc1034', publisher: 'RFC Editor', year: 1987 }
    ],
    border_gateway_protocol: [
        { title: 'RFC 4271: A Border Gateway Protocol 4 (BGP-4)', url: 'https://datatracker.ietf.org/doc/html/rfc4271', publisher: 'RFC Editor', year: 2006 }
    ],
    network_time_protocol: [
        { title: 'RFC 5905: Network Time Protocol Version 4', url: 'https://datatracker.ietf.org/doc/html/rfc5905', publisher: 'RFC Editor', year: 2010 }
    ],
    world_wide_web: [
        { title: 'The World Wide Web Project', url: 'https://info.cern.ch/hypertext/WWW/TheProject.html', publisher: 'CERN', year: 1991 }
    ],
    http_protocol: [
        { title: 'RFC 9110: HTTP Semantics', url: 'https://datatracker.ietf.org/doc/html/rfc9110', publisher: 'RFC Editor', year: 2022 }
    ],
    web_browsers: [
        { title: 'The WorldWideWeb browser', url: 'https://www.w3.org/People/Berners-Lee/WorldWideWeb.html', publisher: 'World Wide Web Consortium', year: 1990 }
    ],
    fiber_optics: [
        { title: 'The Nobel Prize in Physics 2009 - Charles K. Kao', url: 'https://www.nobelprize.org/prizes/physics/2009/kao/facts/', publisher: 'Nobel Prize', year: 2026 }
    ],
    dense_wavelength_division_multiplexing: [
        { title: 'ITU-T G.694.1 Spectral grids for WDM applications', url: 'https://www.itu.int/rec/T-REC-G.694.1', publisher: 'International Telecommunication Union', year: 2020 }
    ],
    submarine_fiber_optic_cables: [
        { title: 'Submarine Cable', url: 'https://www.britannica.com/technology/submarine-cable', publisher: 'Encyclopaedia Britannica', year: 2026, source_type: 'textbook' }
    ],
    cellular_networks: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    gsm_digital_cellular: [
        { title: '2G - Global System for Mobile Communication', url: 'https://www.etsi.org/technologies/mobile/2g', publisher: 'ETSI', year: 2026 }
    ],
    lte_4g_networks: [
        { title: 'LTE', url: 'https://www.3gpp.org/technologies/lte', publisher: '3GPP', year: 2026 }
    ],
    five_g_new_radio: [
        { title: '5G System Overview', url: 'https://www.3gpp.org/technologies/5g-system-overview', publisher: '3GPP', year: 2026 }
    ],
    mobile_phones: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    mobile_broadband_networks: [
        { title: 'IMT-2000', url: 'https://www.itu.int/rec/R-REC-M.1457', publisher: 'International Telecommunication Union', year: 2026 }
    ],
    wifi_wireless_networking: [
        { title: 'IEEE 802.11 Wireless LAN', url: 'https://standards.ieee.org/ieee/802.11/7028/', publisher: 'IEEE Standards Association', year: 2020 }
    ],
    bluetooth_short_range: [
        { title: 'Bluetooth Technology Overview', url: 'https://www.bluetooth.com/learn-about-bluetooth/tech-overview/', publisher: 'Bluetooth SIG', year: 2026 }
    ],
    smartphones: [
        { title: 'Mobile Computing', url: 'https://www.computerhistory.org/revolution/mobile-computing/18', publisher: 'Computer History Museum', year: 2026 }
    ],
    internet_of_things_iot_ubiquitous_connectivity: [
        { title: 'NIST Cybersecurity for IoT Program', url: 'https://www.nist.gov/itl/applied-cybersecurity/nist-cybersecurity-iot-program', publisher: 'NIST', year: 2026 }
    ],
    rfid_tracking: [
        { title: 'EPC/RFID Standards', url: 'https://www.gs1.org/standards/epc-rfid', publisher: 'GS1', year: 2026 }
    ],
    email_messaging_protocols: [
        { title: 'RFC 5321: Simple Mail Transfer Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc5321', publisher: 'RFC Editor', year: 2008 }
    ],
    voice_over_ip: [
        { title: 'RFC 3261: SIP: Session Initiation Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc3261', publisher: 'RFC Editor', year: 2002 }
    ],
    content_delivery_networks: [
        { title: 'Akamai: A Case Study in Internet Content Delivery', url: 'https://dl.acm.org/doi/10.1145/347057.347425', publisher: 'ACM SIGCOMM Computer Communication Review', year: 2000 }
    ],
    mesh_wifi_networks: [
        { title: 'IEEE 802.11s Wireless LAN Mesh Networking', url: 'https://standards.ieee.org/ieee/802.11s/4243/', publisher: 'IEEE Standards Association', year: 2011 }
    ],
    cable_modems_docsis: [
        { title: 'A 101 on DOCSIS Technology', url: 'https://www.cablelabs.com/blog/a-101-on-docsis-technology-the-heart-of-cable-broadband', publisher: 'CableLabs', year: 2018 }
    ],
    digital_subscriber_line_dsl: [
        { title: 'ITU-T G.992.1 ADSL transceivers', url: 'https://www.itu.int/rec/T-REC-G.992.1', publisher: 'International Telecommunication Union', year: 1999 }
    ],
    network_management_snmp: [
        { title: 'RFC 1157: Simple Network Management Protocol', url: 'https://datatracker.ietf.org/doc/html/rfc1157', publisher: 'RFC Editor', year: 1990 }
    ],
    software_defined_networking: [
        { title: 'Software-Defined Networking Definition', url: 'https://opennetworking.org/sdn-definition/', publisher: 'Open Networking Foundation', year: 2026 }
    ],
    tls_ssl_secure_transport: [
        { title: 'RFC 8446: The Transport Layer Security Protocol Version 1.3', url: 'https://datatracker.ietf.org/doc/html/rfc8446', publisher: 'RFC Editor', year: 2018 }
    ],
    communications_satellites: [
        { title: 'Telstar Opened Era of Global Satellite Television', url: 'https://www.nasa.gov/history/telstar-opened-era-of-global-satellite-television/', publisher: 'NASA', year: 2012 }
    ],
    quantum_internet: [
        { title: 'The Quantum Internet', url: 'https://doi.org/10.1126/science.aam9288', publisher: 'Science', year: 2018, source_type: 'primary_paper', supports: ['node', 'roadmap', 'maturity'] }
    ],
    '5g_6g_communication_networks': [
        { title: 'IMT-2030', url: 'https://www.itu.int/en/ITU-R/study-groups/rsg5/rwp5d/imt-2030/Pages/default.aspx', publisher: 'International Telecommunication Union', year: 2026, supports: ['node', 'roadmap', 'maturity'] }
    ],
    recommender_systems: [
        {
            title: 'Recommender Systems Handbook',
            url: 'https://link.springer.com/book/10.1007/978-1-0716-2197-4',
            publisher: 'Springer',
            year: 2022,
            source_type: 'textbook',
            supports: ['node', 'edge', 'maturity']
        }
    ],
    vector_databases: [
        {
            title: 'Lucene for Approximate Nearest-Neighbors Search on Arbitrary Dense Vectors',
            url: 'https://arxiv.org/abs/1910.10208',
            publisher: 'arXiv',
            year: 2019,
            source_type: 'primary_paper',
            supports: ['node', 'edge', 'maturity']
        }
    ]
};

function inferSourceType(source) {
    const text = `${source.publisher || ''} ${source.title || ''} ${source.url || ''}`.toLowerCase();
    if (/nist\.gov\/materials\b/.test(text) || /title: materials/.test(text)) return 'generic_overview';
    if (/doi\.org|nature\.com|science\.org|nejm|cell\.com|proceedings\.neurips|arxiv|journal|transactions|sigcomm|acm|bell system technical/.test(text)) return 'primary_paper';
    if (/handbook|textbook|springer|swebok|stanford encyclopedia|plato\.stanford/.test(text)) return 'textbook';
    if (/review|survey/.test(text)) return 'review';
    if (/museum|computerhistory|nobelprize|sciencemuseumgroup|american precision|sparkmuseum|mercedes-benz|ethw|ieee history/.test(text)) return 'museum';
    if (/ipcc|climate change 20\d\d|systematic review|survey/.test(text)) return 'review';
    if (/nist|energy\.gov|faa|fhwa|fcc|cisa|gps\.gov|who|iaea|iea|un|darpa|usda|fda|nih|cdc|esa|nasa|cern|uic|ietf|rfc-editor|cgiar|fao|ifr|world robotics|jedec|loc\.gov|library of congress|britishmuseum|ieee|computer\.org|nano\.gov|national nanotechnology initiative|itu|international telecommunication union|etsi|3gpp|w3\.org|world wide web consortium|internet society|internetsociety|gs1|bluetooth|wi-fi alliance|cablelabs|open networking foundation/.test(text)) return 'official_agency';
    if (/britannica|encyclopaedia/.test(text)) return 'generic_overview';
    return 'weak_web';
}

function normalizeSource(source, item) {
    const source_type = source.source_type || inferSourceType(source);
    const supports = source.supports || ['node'];
    if (item.maturity && !supports.includes('maturity')) supports.push('maturity');
    if (item.roadmap && !supports.includes('roadmap')) supports.push('roadmap');
    return { ...source, source_type, supports };
}

function inferEdgeType(item, prerequisite) {
    if (item.era === 'Future' || item.maturity === 'forecast' || prerequisite.era === 'Future') return 'speculative';
    const itemText = `${item.id} ${item.name}`.toLowerCase();
    const prereqText = `${prerequisite.id} ${prerequisite.name}`.toLowerCase();
    if (/steam_engine|electric_motor|internal_combustion_engine|siege_engineering|construction|precision_machine_tools|software_engineering/.test(prereqText)) {
        if (/diesel_engine|automobile_prototype|powered_flight|submarines|electric_traction|electric_generators|electric_elevators|electric_fans|operating_systems|object_oriented_programming|internet_protocols/.test(itemText)) return 'required';
        return /factory|production|manufacturing|logistics|grid|railroad|ship|mass|industrial|appliances|lighting|tools|machining|skyscraper|cinematography/.test(itemText)
            ? 'commercial_or_scaling_dependency'
            : 'enabling';
    }
    if (/manufacturing|production|factory|supply|logistics|grid|market|commercial|platform|therapy|therapeutic|approval|charging|warehouse/.test(itemText)) {
        if (/mass_production|factory|grid|logistics|supply|software|database|internet|clinical|regulatory|delivery|manufacturing/.test(prereqText)) {
            return 'commercial_or_scaling_dependency';
        }
    }
    if (/oral|law|legal|tax|census|ritual|religion|bureaucracy|governance|education|university|theater|museum|library/.test(itemText)) {
        return 'common_dependency';
    }
    if (/early|basic|root|stone_tool|fire_control|writing|record_keeping/.test(prereqText)) return 'historical_predecessor';
    if (/semiconductor|transistor|integrated_circuit|engine|motor|battery|laser|pcr|cas9|flash_memory|photolithography/.test(prereqText)) return 'required';
    return 'enabling';
}

function inferEvidenceLevel(item, prerequisite, type) {
    if (type === 'speculative') return 'speculative';
    if (item.reviewStatus === 'source_checked' && prerequisite.reviewStatus === 'source_checked') return 'expert_inference';
    if ((item.sources || []).some(source => sourceQualityWeight(source.source_type) >= 0.8)) return 'expert_inference';
    return type === 'common_dependency' ? 'weak_inference' : 'expert_inference';
}

function confidenceFor(type, evidenceLevel) {
    if (type === 'required') return 0.82;
    if (type === 'historical_predecessor') return 0.75;
    if (type === 'commercial_or_scaling_dependency') return 0.72;
    if (type === 'enabling') return 0.68;
    if (type === 'common_dependency') return 0.55;
    if (type === 'accelerates') return 0.52;
    if (type === 'speculative') return 0.35;
    return evidenceLevel === 'weak_inference' ? 0.5 : 0.6;
}

function noteFor(type, prerequisite) {
    return {
        required: `${prerequisite.name} is modeled as a necessary component or method for this technology in the current graph.`,
        enabling: `${prerequisite.name} provides a capability that enables this technology without being the only possible path.`,
        accelerates: `${prerequisite.name} accelerates development or adoption but is not strictly required.`,
        historical_predecessor: `${prerequisite.name} is an earlier historical predecessor or foundation, not a one-to-one engineering dependency.`,
        common_dependency: `${prerequisite.name} is contextual infrastructure or shared knowledge, not a strict hard prerequisite.`,
        commercial_or_scaling_dependency: `${prerequisite.name} supports manufacturing, deployment, commercialization, or operational scaling.`,
        speculative: `${prerequisite.name} is a plausible dependency for a forecast technology and should be treated as speculative.`
    }[type];
}

function applyFieldMetadata(item) {
    const override = FIELD_OVERRIDES[item.id];
    if (!override) return;
    item.fields = [...new Set([...(item.fields || []), ...(override.fields || [])])];
    item.fieldLanes = { ...(item.fieldLanes || {}), ...(override.fieldLanes || {}) };
    if (override.maturity) item.maturity = override.maturity;
    if (override.roadmap) item.roadmap = override.roadmap;
}

function makeEdge(item, prerequisiteId, byId) {
    const prerequisite = byId.get(prerequisiteId);
    if (!prerequisite) return null;
    const override = EDGE_OVERRIDES[`${item.id}|${prerequisiteId}`];
    if (override === null) return null;
    const crisprOverride = CRISPR_EDGE_TYPES[`${item.id}|${prerequisiteId}`];
    let type = inferEdgeType(item, prerequisite);
    let note = noteFor(type, prerequisite);
    let evidence_level = inferEvidenceLevel(item, prerequisite, type);
    let confidence = confidenceFor(type, evidence_level);
    let reviewStatus = item.reviewStatus === 'source_checked' ? 'source_checked' : 'structurally_validated';

    if (crisprOverride) {
        [type, note] = crisprOverride;
        evidence_level = 'expert_inference';
        confidence = type === 'required' ? 0.88 : 0.78;
        reviewStatus = 'source_checked';
    }
    if (override) {
        ({ type, note, evidence_level, confidence, reviewStatus } = { type, note, evidence_level, confidence, reviewStatus, ...override });
    }

    const edge = {
        prerequisite: prerequisiteId,
        type,
        confidence,
        evidence_level,
        note,
        reviewStatus
    };
    if (reviewStatus === 'source_checked' && Array.isArray(item.sources) && item.sources.length) {
        edge.sources = [item.sources[0]].map(source => {
            const edgeSource = { ...source };
            edgeSource.supports = [...new Set([...(edgeSource.supports || []), 'edge'])];
            return edgeSource;
        });
    }
    return edge;
}

function applyDependencyCorrections(item) {
    let prereqs = [...(item.prerequisites || [])]
        .map(id => {
            if (id === 'precision_mechanics_miniaturization' || (id === 'precision_machine_tools' && item.era === 'Renaissance')) {
                return item.era === 'Renaissance' ? 'scientific_instrument_making_guilds' : 'precision_machine_tools';
            }
            return DEPENDENCY_REPLACEMENTS[id] || id;
        })
        .filter(id => !(REMOVE_DEPENDENCIES.get(item.id)?.has(id)));
    for (const extra of ADD_DEPENDENCIES.get(item.id) || []) {
        if (!prereqs.includes(extra)) prereqs.push(extra);
    }
    prereqs = [...new Set(prereqs)].filter(id => id !== item.id);
    item.prerequisites = prereqs;
}

const byFile = new Map();
const allItems = [];
for (const file of DATA_FILES) {
    const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    byFile.set(file, items);
    for (const item of items) allItems.push(item);
}

for (const item of allItems) {
    applyDependencyCorrections(item);
}

const byId = new Map(allItems.map(item => [item.id, item]));

for (const item of allItems) {
    const defaults = ERA_DEFAULT_DATES[item.era] || ERA_DEFAULT_DATES.Modern;
    Object.assign(item, defaults, NODE_DATE_OVERRIDES[item.id] || {});
    applyFieldMetadata(item);
    if (Array.isArray(item.sources)) {
        item.sources = item.sources.map(source => normalizeSource(source, item));
    }
    if (SOURCE_OVERRIDES[item.id]) item.sources = SOURCE_OVERRIDES[item.id].map(source => normalizeSource(source, item));
    const bestSourceWeight = Math.max(0, ...(item.sources || []).map(source => sourceQualityWeight(source.source_type)));
    item.reviewStatus = bestSourceWeight > 0.45 ? 'source_checked' : 'structurally_validated';

    const edges = [];
    for (const prerequisite of item.prerequisites || []) {
        const edge = makeEdge(item, prerequisite, byId);
        if (edge) edges.push(edge);
    }
    item.dependencyEdges = edges;
    item.prerequisites = getPrerequisiteIds(item);
}

for (let pass = 0; pass < 12; pass += 1) {
    let changed = false;
    for (const item of allItems) {
        for (const edge of item.dependencyEdges || []) {
            const prerequisite = byId.get(edge.prerequisite);
            if (!prerequisite) continue;
            if (typeof prerequisite.firstKnownDate === 'number' && prerequisite.firstKnownDate > item.firstKnownDate) {
                item.firstKnownDate = prerequisite.firstKnownDate;
                if (item.datePrecision === 'millennium') item.datePrecision = prerequisite.datePrecision || 'century';
                changed = true;
            }
        }
    }
    if (!changed) break;
}

for (const [file, items] of byFile.entries()) {
    fs.writeFileSync(path.join(DATA_DIR, file), `${JSON.stringify(items, null, 2)}\n`);
}

console.log(`Migrated ${allItems.length} technologies to typed dependencyEdges.`);

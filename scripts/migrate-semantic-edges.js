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
    synthetic_biology: { firstKnownDate: 2000, datePrecision: 'decade', region: 'Global biotechnology research' }
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
    ['synthetic_biology', new Set(['crispr_gene_editing'])]
]);

const ADD_DEPENDENCIES = new Map([
    ['solid_state_drives_ssd_flash_memory', ['flash_memory']],
    ['vector_databases', ['information_theory']],
    ['retrieval_augmented_generation', ['search_engines']],
    ['experimental_controls', ['probability_theory']]
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
    if (/doi\.org|nature\.com|science\.org|nejm|cell\.com|proceedings\.neurips|arxiv|journal|transactions|machine learning/.test(text)) return 'primary_paper';
    if (/handbook|textbook|springer|swebok|stanford encyclopedia|plato\.stanford/.test(text)) return 'textbook';
    if (/review|survey/.test(text)) return 'review';
    if (/museum|computerhistory|nobelprize|sciencemuseumgroup|american precision|sparkmuseum|mercedes-benz/.test(text)) return 'museum';
    if (/ipcc|climate change 20\d\d|systematic review|survey/.test(text)) return 'review';
    if (/nist|energy\.gov|faa|fhwa|cisa|gps\.gov|who|iaea|iea|un|darpa|usda|fda|nih|cdc|esa|nasa|uic|ietf|rfc-editor|cgiar|fao|ifr|world robotics|jedec|loc\.gov|library of congress|britishmuseum|ieee|computer\.org|nano\.gov|national nanotechnology initiative/.test(text)) return 'official_agency';
    if (/britannica|encyclopaedia/.test(text)) return 'generic_overview';
    return 'weak_web';
}

function normalizeSource(source, item) {
    const source_type = inferSourceType(source);
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
    let reviewStatus = item.fields?.includes('Genome Editing / CRISPR-Cas') ? 'source_checked' : 'structurally_validated';

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

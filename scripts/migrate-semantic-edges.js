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
    if (/handbook|textbook|springer/.test(text)) return 'textbook';
    if (/review|survey/.test(text)) return 'review';
    if (/museum|computerhistory|nobelprize/.test(text)) return 'museum';
    if (/ipcc|climate change 20\d\d|systematic review|survey/.test(text)) return 'review';
    if (/nist|energy\.gov|faa|fhwa|cisa|gps\.gov|who|iaea|iea|un|darpa|usda|fda|nih|cdc|esa|nasa|uic|ietf|rfc-editor|cgiar|fao|ifr|world robotics|jedec/.test(text)) return 'official_agency';
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
    if (SOURCE_OVERRIDES[item.id]) item.sources = SOURCE_OVERRIDES[item.id];
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

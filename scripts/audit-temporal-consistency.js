const fs = require('fs');
const path = require('path');
const { ERA_ORDER, getDependencyEdges } = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');

const PRODUCT_COMPONENT_RULES = [
    {
        component: /flash_memory|transistor|integrated_circuits?|semiconductors?|photolithography|battery|fuel_cell|electric_motor/,
        product: /solid_state_drives|smartphone|personal_computers|automobile|electric_vehicle|jet_airliners|data_centers/,
        reason: 'component-like technology should not depend on a product/application that uses it'
    },
    {
        component: /vector_databases|search_engines|information_retrieval|databases/,
        product: /retrieval_augmented_generation|chatbots|large_language_models/,
        reason: 'retrieval/storage infrastructure should not depend on a later AI application'
    }
];

const BROAD_FIELD_PATTERNS = [
    /^advanced_/,
    /_systems?$/,
    /science$/,
    /engineering$/,
    /research$/
];

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .filter(file => file !== 'taxonomy.json')
        .sort()
        .flatMap(file => {
            const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            return items.map(item => ({ ...item, __file: file }));
        });
}

function isBroadField(node) {
    const text = `${node.id} ${node.name}`.toLowerCase();
    return BROAD_FIELD_PATTERNS.some(pattern => pattern.test(node.id) || pattern.test(text));
}

function isNarrowSubfield(node) {
    const text = `${node.id} ${node.name}`.toLowerCase();
    return /platform|therapy|therapeutic|screen|database|airliner|ssd|drive|charging|gateway|application|app|workflow|model/.test(text);
}

const data = loadData();
const byId = new Map(data.map(item => [item.id, item]));
const errors = [];

for (const item of data) {
    const itemEraOrder = ERA_ORDER.get(item.era);
    for (const edge of getDependencyEdges(item)) {
        const prerequisite = byId.get(edge.prerequisite);
        if (!prerequisite) continue;

        const prerequisiteEraOrder = ERA_ORDER.get(prerequisite.era);
        if (prerequisiteEraOrder > itemEraOrder) {
            errors.push(`${item.__file}: ${item.id} (${item.era}) depends on later-era ${edge.prerequisite} (${prerequisite.era})`);
        }
        if (item.era === 'Modern' && prerequisite.era === 'Future') {
            errors.push(`${item.__file}: ${item.id} is Modern but depends on Future node ${edge.prerequisite}`);
        }
        if (typeof item.firstKnownDate === 'number' && typeof prerequisite.firstKnownDate === 'number' && prerequisite.firstKnownDate > item.firstKnownDate) {
            errors.push(`${item.__file}: ${item.id} (${item.firstKnownDate}) depends on later firstKnownDate ${edge.prerequisite} (${prerequisite.firstKnownDate})`);
        }

        const itemText = `${item.id} ${item.name}`.toLowerCase();
        const prerequisiteText = `${prerequisite.id} ${prerequisite.name}`.toLowerCase();
        for (const rule of PRODUCT_COMPONENT_RULES) {
            if (rule.component.test(itemText) && rule.product.test(prerequisiteText)) {
                errors.push(`${item.__file}: ${item.id} depends on product/application ${edge.prerequisite}; ${rule.reason}`);
            }
        }

        if (isBroadField(item) && isNarrowSubfield(prerequisite) && edge.type === 'required') {
            errors.push(`${item.__file}: broad node ${item.id} has hard required edge to narrow subfield ${edge.prerequisite}`);
        }
    }
}

if (errors.length) {
    console.error(`Temporal and semantic edge audit failed with ${errors.length} issue(s):`);
    for (const error of errors.slice(0, 200)) console.error(`- ${error}`);
    if (errors.length > 200) console.error(`... ${errors.length - 200} more issue(s) omitted`);
    process.exit(1);
}

console.log(`Temporal and semantic edge audit passed for ${data.length} technologies.`);

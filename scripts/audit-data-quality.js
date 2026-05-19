const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const EXPANSION_DIR = path.join(DATA_DIR, 'expansion');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const SOURCE_REQUIRED_FIELDS = new Set([
    'Genome Editing / CRISPR-Cas',
    'Semiconductors & Integrated Circuits',
    'Artificial Intelligence & Machine Learning'
]);
const VALID_MATURITIES = new Set(['established', 'emerging', 'approved', 'forecast']);
const ERA_ORDER = new Map([
    ['Ancient', 0],
    ['Classical', 1],
    ['Medieval', 2],
    ['Renaissance', 3],
    ['Industrial', 4],
    ['Modern', 5],
    ['Future', 6]
]);

const TERM_MIN_ERA = {
    'x ray': 'Industrial',
    xray: 'Industrial',
    radiology: 'Industrial',
    rocket: 'Industrial',
    transistor: 'Modern',
    microprocessor: 'Modern',
    internet: 'Modern',
    'world wide web': 'Modern',
    'cloud computing': 'Modern',
    blockchain: 'Modern',
    cryptocurrency: 'Modern',
    'artificial intelligence': 'Modern',
    'machine learning': 'Modern',
    'deep learning': 'Modern',
    'language model': 'Modern',
    'neural network': 'Modern',
    satellite: 'Modern',
    drone: 'Modern',
    mri: 'Modern',
    'ct scan': 'Modern',
    software: 'Modern',
    database: 'Modern',
    api: 'Modern',
    cybersecurity: 'Modern',
    'zero trust': 'Modern',
    virtualization: 'Modern',
    '3d printing': 'Modern',
    'warp drive': 'Future',
    'dyson sphere': 'Future',
    terraforming: 'Future',
    terraform: 'Future',
    interstellar: 'Future',
    starlifting: 'Future',
    kardashev: 'Future',
    antimatter: 'Future',
    'post labor': 'Future',
    immortality: 'Future',
    'mind upload': 'Future',
    'mind uploading': 'Future',
    cryonics: 'Future',
    nanobot: 'Future',
    agi: 'Future',
    'artificial general intelligence': 'Future'
};

const GENERATED_ID = /_0[0-9]{3}$/;

function normalizeName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function normalizeComparableName(name) {
    return normalizeName(name)
        .split(' ')
        .map(word => {
            if (word.length > 4 && word.endsWith('ies')) return `${word.slice(0, -3)}y`;
            if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1);
            return word;
        })
        .join(' ');
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasTerm(text, term) {
    const pattern = escapeRegExp(term).replace(/\s+/g, '[\\s_-]+');
    return new RegExp(`(^|[^a-z0-9])${pattern}([^a-z0-9]|$)`, 'i').test(text);
}

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .filter(file => file !== 'taxonomy.json')
        .sort()
        .flatMap(file => {
            const items = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
            if (!Array.isArray(items)) throw new Error(`${file} must contain an array`);
            return items.map(item => ({ ...item, __file: file }));
        });
}

const data = loadData();
const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
const validFields = new Set(Object.keys(taxonomy.fields || {}));
const errors = [];
const ids = new Map();
const names = new Map();
const comparableNames = new Map();
const sourceRows = [];

for (const item of data) {
    if (GENERATED_ID.test(item.id)) {
        errors.push(`${item.__file}: ${item.id} looks like a generated placeholder row`);
    }

    if (ids.has(item.id)) {
        errors.push(`duplicate id ${item.id} in ${ids.get(item.id)} and ${item.__file}`);
    } else {
        ids.set(item.id, item.__file);
    }

    const normalizedName = normalizeName(item.name);
    if (normalizedName) {
        if (!names.has(normalizedName)) names.set(normalizedName, []);
        names.get(normalizedName).push(item);
    }

    const comparableName = normalizeComparableName(item.name);
    if (comparableName) {
        if (!comparableNames.has(comparableName)) comparableNames.set(comparableName, []);
        comparableNames.get(comparableName).push(item);
    }

    const itemEraOrder = ERA_ORDER.get(item.era);
    const text = `${item.id} ${item.name} ${item.description}`;
    for (const [term, minEra] of Object.entries(TERM_MIN_ERA)) {
        const minEraOrder = ERA_ORDER.get(minEra);
        if (itemEraOrder === undefined || minEraOrder === undefined) continue;
        if (itemEraOrder < minEraOrder && hasTerm(text, term)) {
            errors.push(`${item.__file}: ${item.id} uses "${term}" before ${minEra}`);
        }
    }

    if (item.fields !== undefined) {
        if (!Array.isArray(item.fields)) {
            errors.push(`${item.__file}: ${item.id} fields must be an array`);
        } else {
            for (const field of item.fields) {
                if (!validFields.has(field)) errors.push(`${item.__file}: ${item.id} has invalid field ${field}`);
                const lane = item.fieldLanes && item.fieldLanes[field];
                const validLanes = taxonomy.fields?.[field] || [];
                if (lane && !validLanes.includes(lane)) errors.push(`${item.__file}: ${item.id} has invalid lane ${lane} for field ${field}`);
            }
        }
    }

    if (item.maturity !== undefined && !VALID_MATURITIES.has(item.maturity)) {
        errors.push(`${item.__file}: ${item.id} has invalid maturity ${item.maturity}`);
    }

    for (const sourceRequiredField of SOURCE_REQUIRED_FIELDS) {
        if (item.fields?.includes(sourceRequiredField) && (!Array.isArray(item.sources) || item.sources.length === 0)) {
            errors.push(`${item.__file}: ${item.id} is in ${sourceRequiredField} but has no sources`);
        }
    }

    if (Array.isArray(item.sources)) {
        for (const [index, source] of item.sources.entries()) {
            if (!source || typeof source !== 'object') {
                errors.push(`${item.__file}: ${item.id} source ${index + 1} must be an object`);
                continue;
            }
            for (const field of ['title', 'url', 'publisher', 'year']) {
                if (!(field in source)) errors.push(`${item.__file}: ${item.id} source ${index + 1} is missing ${field}`);
            }
        }
    }

    if (item.maturity === 'forecast') {
        const roadmap = item.roadmap || {};
        for (const field of ['role', 'timeframe', 'confidence', 'rationale']) {
            if (!roadmap[field]) errors.push(`${item.__file}: ${item.id} forecast roadmap is missing ${field}`);
        }
        if (!Array.isArray(roadmap.blockers) || roadmap.blockers.length === 0) {
            errors.push(`${item.__file}: ${item.id} forecast roadmap must list blockers`);
        }
    }
}

for (const [name, items] of names.entries()) {
    if (items.length < 2) continue;
    errors.push(`duplicate display name "${name}": ${items.map(item => `${item.__file}:${item.id}`).join(', ')}`);
}

for (const [name, items] of comparableNames.entries()) {
    const distinctNames = new Set(items.map(item => normalizeName(item.name)));
    if (items.length < 2 || distinctNames.size < 2) continue;
    errors.push(`near-duplicate display name "${name}": ${items.map(item => `${item.__file}:${item.id}:${item.name}`).join(', ')}`);
}

if (fs.existsSync(EXPANSION_DIR)) {
    const sourceIds = new Map();
    for (const file of fs.readdirSync(EXPANSION_DIR).filter(name => name.endsWith('.tsv')).sort()) {
        const filePath = path.join(EXPANSION_DIR, file);
        const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
        for (const [index, line] of lines.entries()) {
            if (!line.trim() || line.startsWith('#')) continue;
            const columns = line.split('\t');
            const [era, id, name, description, prerequisiteText = ''] = columns;
            if (columns.length < 5) {
                errors.push(`${file}:${index + 1} source row must have 5 tab-separated columns`);
                continue;
            }
            const row = { file, line: index + 1, era, id, name, description, prerequisites: prerequisiteText.split(',').map(value => value.trim()).filter(Boolean) };
            sourceRows.push(row);
            if (GENERATED_ID.test(id)) {
                errors.push(`${file}:${index + 1} ${id} looks like a generated placeholder source row`);
            }
            if (sourceIds.has(id)) {
                errors.push(`duplicate source id ${id} in ${sourceIds.get(id)} and ${file}:${index + 1}`);
            } else {
                sourceIds.set(id, `${file}:${index + 1}`);
            }
        }
    }

    const validSourcePrerequisites = new Set([...ids.keys(), ...sourceIds.keys()]);
    for (const row of sourceRows) {
        for (const prerequisite of row.prerequisites) {
            if (!validSourcePrerequisites.has(prerequisite)) {
                errors.push(`${row.file}:${row.line} ${row.id} references missing source prerequisite ${prerequisite}`);
            }
        }
    }
}

if (errors.length) {
    console.error(`Data quality audit failed with ${errors.length} issue(s):`);
    for (const error of errors.slice(0, 200)) {
        console.error(`- ${error}`);
    }
    if (errors.length > 200) {
        console.error(`... ${errors.length - 200} more issue(s) omitted`);
    }
    process.exit(1);
}

const sourceSummary = sourceRows.length ? ` and ${sourceRows.length} TSV source rows` : '';
console.log(`Audited ${data.length} technologies${sourceSummary}: no generated placeholder rows, duplicate ids, duplicate or near-duplicate display names, missing source prerequisites, or too-early future/modern terms.`);

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
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

function normalizeName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
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
const errors = [];
const ids = new Map();
const names = new Map();

for (const item of data) {
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

    const itemEraOrder = ERA_ORDER.get(item.era);
    const text = `${item.id} ${item.name} ${item.description}`;
    for (const [term, minEra] of Object.entries(TERM_MIN_ERA)) {
        const minEraOrder = ERA_ORDER.get(minEra);
        if (itemEraOrder === undefined || minEraOrder === undefined) continue;
        if (itemEraOrder < minEraOrder && hasTerm(text, term)) {
            errors.push(`${item.__file}: ${item.id} uses "${term}" before ${minEra}`);
        }
    }
}

for (const [name, items] of names.entries()) {
    if (items.length < 2) continue;
    errors.push(`duplicate display name "${name}": ${items.map(item => `${item.__file}:${item.id}`).join(', ')}`);
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

console.log(`Audited ${data.length} technologies: no duplicate ids, duplicate display names, or too-early future/modern terms.`);

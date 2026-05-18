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

function isGenerated(id) {
    return /_0[0-9]{3}$/.test(id);
}

function normalizeName(name) {
    return String(name || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}

function loadEraFiles() {
    return fs.readdirSync(DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .filter(file => file !== 'taxonomy.json')
        .sort()
        .map(file => {
            const filePath = path.join(DATA_DIR, file);
            const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            if (!Array.isArray(items)) throw new Error(`${file} must contain an array`);
            return { file, filePath, items };
        });
}

function compareCandidates(a, b, dependentCounts) {
    const aHandmade = isGenerated(a.id) ? 0 : 1;
    const bHandmade = isGenerated(b.id) ? 0 : 1;
    if (aHandmade !== bHandmade) return bHandmade - aHandmade;

    const aEra = ERA_ORDER.get(a.era) ?? Number.MAX_SAFE_INTEGER;
    const bEra = ERA_ORDER.get(b.era) ?? Number.MAX_SAFE_INTEGER;
    if (aEra !== bEra) return aEra - bEra;

    const aDependents = dependentCounts.get(a.id) || 0;
    const bDependents = dependentCounts.get(b.id) || 0;
    if (aDependents !== bDependents) return bDependents - aDependents;

    if (a.id.length !== b.id.length) return a.id.length - b.id.length;
    return a.id.localeCompare(b.id);
}

const eraFiles = loadEraFiles();
const allItems = eraFiles.flatMap(({ file, items }) => items.map(item => ({ ...item, __file: file })));
const dependentCounts = new Map();
for (const item of allItems) {
    for (const prerequisite of item.prerequisites || []) {
        dependentCounts.set(prerequisite, (dependentCounts.get(prerequisite) || 0) + 1);
    }
}

const byName = new Map();
for (const item of allItems) {
    const key = normalizeName(item.name);
    if (!key) continue;
    if (!byName.has(key)) byName.set(key, []);
    byName.get(key).push(item);
}

const redirect = new Map();
let duplicateGroups = 0;
for (const group of byName.values()) {
    if (group.length < 2) continue;
    duplicateGroups += 1;
    const [keep] = [...group].sort((a, b) => compareCandidates(a, b, dependentCounts));
    for (const item of group) {
        if (item.id !== keep.id) redirect.set(item.id, keep.id);
    }
}

let removed = 0;
let rewired = 0;
for (const eraFile of eraFiles) {
    const nextItems = [];
    for (const item of eraFile.items) {
        if (redirect.has(item.id)) {
            removed += 1;
            continue;
        }

        const before = item.prerequisites || [];
        const after = [...new Set(before
            .map(id => redirect.get(id) || id)
            .filter(id => id !== item.id))];
        if (after.length !== before.length || after.some((id, index) => id !== before[index])) {
            item.prerequisites = after;
            rewired += 1;
        }
        nextItems.push(item);
    }
    eraFile.items = nextItems;
    fs.writeFileSync(eraFile.filePath, `${JSON.stringify(nextItems, null, 2)}\n`);
}

console.log(`Found ${duplicateGroups} duplicate display-name groups.`);
console.log(`Removed ${removed} duplicate technologies and rewired ${rewired} prerequisite lists.`);

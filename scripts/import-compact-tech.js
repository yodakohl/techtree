const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const SOURCE_FILE = process.argv[2]
    ? path.resolve(process.argv[2])
    : path.join(DATA_DIR, 'expansion', 'human-tech-bulk.tsv');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');

const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
const validEras = new Set(taxonomy.eras);

function readEraFiles() {
    const byEra = new Map();
    const byId = new Map();

    for (const era of taxonomy.eras) {
        const file = `${era.toLowerCase()}.json`;
        const filePath = path.join(DATA_DIR, file);
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        byEra.set(era, { filePath, items });
        for (const item of items) byId.set(item.id, item);
    }

    return { byEra, byId };
}

function parseSource() {
    const lines = fs.readFileSync(SOURCE_FILE, 'utf8')
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));

    return lines.map((line, index) => {
        const parts = line.split('\t');
        if (parts.length !== 5) {
            throw new Error(`${SOURCE_FILE}:${index + 1} expected 5 tab-separated fields`);
        }
        const [era, id, name, description, prereqText] = parts;
        const prerequisites = prereqText.split(',').map(value => value.trim()).filter(Boolean);
        return { era, id, name, description, prerequisites, sourceLine: index + 1 };
    });
}

function main() {
    const { byEra, byId } = readEraFiles();
    const rows = parseSource();
    const pendingIds = new Set(rows.map(row => row.id));
    const sourceIds = new Set();
    const errors = [];

    for (const row of rows) {
        if (!validEras.has(row.era)) errors.push(`${row.id}: invalid era ${row.era}`);
        if (!/^[a-z0-9_]+$/.test(row.id)) errors.push(`${row.id}: id must use lowercase snake_case`);
        if (sourceIds.has(row.id)) errors.push(`${row.id}: duplicated in compact source`);
        sourceIds.add(row.id);
        for (const prerequisite of row.prerequisites) {
            if (!byId.has(prerequisite) && !pendingIds.has(prerequisite)) {
                errors.push(`${row.id}: missing prerequisite ${prerequisite}`);
            }
            if (prerequisite === row.id) errors.push(`${row.id}: cannot require itself`);
        }
    }

    if (errors.length) {
        console.error(`Import failed with ${errors.length} issue(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exit(1);
    }

    let added = 0;
    let skipped = 0;
    for (const row of rows) {
        if (byId.has(row.id)) {
            skipped += 1;
            continue;
        }
        const target = byEra.get(row.era);
        const item = {
            id: row.id,
            name: row.name,
            era: row.era,
            description: row.description,
            prerequisites: row.prerequisites
        };
        target.items.push(item);
        byId.set(row.id, item);
        added += 1;
    }

    for (const { filePath, items } of byEra.values()) {
        fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`);
    }

    console.log(`Imported ${added} technologies from ${path.relative(process.cwd(), SOURCE_FILE)} (${skipped} already existed).`);
}

main();

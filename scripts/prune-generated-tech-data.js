const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const GENERATED_ID = /_0[0-9]{3}$/;

const files = fs.readdirSync(DATA_DIR)
    .filter(file => file.endsWith('.json'))
    .filter(file => file !== 'taxonomy.json')
    .sort();

let removed = 0;
let rewired = 0;

for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!Array.isArray(items)) throw new Error(`${file} must contain an array`);

    const generatedIds = new Set(items.filter(item => GENERATED_ID.test(item.id)).map(item => item.id));
    const kept = [];

    for (const item of items) {
        if (generatedIds.has(item.id)) {
            removed += 1;
            continue;
        }

        const before = item.prerequisites || [];
        const after = before.filter(id => !GENERATED_ID.test(id));
        if (after.length !== before.length) {
            item.prerequisites = after;
            rewired += 1;
        }
        kept.push(item);
    }

    fs.writeFileSync(filePath, `${JSON.stringify(kept, null, 2)}\n`);
}

console.log(`Removed ${removed} generated technologies and rewired ${rewired} prerequisite lists.`);

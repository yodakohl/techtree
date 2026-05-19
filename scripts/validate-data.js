const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const REQUIRED_FIELDS = ['id', 'name', 'era', 'description', 'prerequisites'];
const VALID_MATURITIES = new Set(['established', 'emerging', 'approved', 'forecast']);

function loadData() {
    const files = fs.readdirSync(DATA_DIR)
        .filter(file => file.endsWith('.json'))
        .filter(file => file !== 'taxonomy.json')
        .sort();

    return files.flatMap(file => {
        const filePath = path.join(DATA_DIR, file);
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(items)) {
            throw new Error(`${file} must contain a JSON array`);
        }
        return items.map(item => ({ ...item, __file: file }));
    });
}

function findCycles(data, ids) {
    const graph = new Map();
    for (const item of data) {
        graph.set(item.id, (item.prerequisites || []).filter(id => ids.has(id)));
    }

    let nextIndex = 0;
    const stack = [];
    const onStack = new Set();
    const indexById = new Map();
    const lowlinkById = new Map();
    const cycles = [];

    function visit(id) {
        indexById.set(id, nextIndex);
        lowlinkById.set(id, nextIndex);
        nextIndex += 1;
        stack.push(id);
        onStack.add(id);

        for (const prerequisite of graph.get(id) || []) {
            if (!indexById.has(prerequisite)) {
                visit(prerequisite);
                lowlinkById.set(id, Math.min(lowlinkById.get(id), lowlinkById.get(prerequisite)));
            } else if (onStack.has(prerequisite)) {
                lowlinkById.set(id, Math.min(lowlinkById.get(id), indexById.get(prerequisite)));
            }
        }

        if (lowlinkById.get(id) === indexById.get(id)) {
            const component = [];
            let current;
            do {
                current = stack.pop();
                onStack.delete(current);
                component.push(current);
            } while (current !== id);

            if (component.length > 1) {
                cycles.push(component);
            }
        }
    }

    for (const id of graph.keys()) {
        if (!indexById.has(id)) visit(id);
    }

    return cycles;
}

function validate() {
    const data = loadData();
    const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
    const validEras = new Set(taxonomy.eras);
    const validFields = new Set(Object.keys(taxonomy.fields || {}));
    const errors = [];
    const ids = new Map();

    for (const item of data) {
        for (const field of REQUIRED_FIELDS) {
            if (!(field in item)) {
                errors.push(`${item.__file}: ${item.id || '<missing id>'} is missing ${field}`);
            }
        }

        if (typeof item.id !== 'string' || !item.id.trim()) {
            errors.push(`${item.__file}: found an entry with an invalid id`);
            continue;
        }

        if (ids.has(item.id)) {
            errors.push(`${item.id} is duplicated in ${ids.get(item.id)} and ${item.__file}`);
        } else {
            ids.set(item.id, item.__file);
        }

        if (!validEras.has(item.era)) {
            errors.push(`${item.id} has invalid era ${item.era}`);
        }

        const expectedFile = `${String(item.era || '').toLowerCase()}.json`;
        if (validEras.has(item.era) && item.__file !== expectedFile) {
            errors.push(`${item.id} has era ${item.era} but is stored in ${item.__file}`);
        }

        if (!Array.isArray(item.prerequisites)) {
            errors.push(`${item.id} prerequisites must be an array`);
        }

        if ('fields' in item) {
            if (!Array.isArray(item.fields)) {
                errors.push(`${item.id} fields must be an array when present`);
            } else {
                for (const field of item.fields) {
                    if (!validFields.has(field)) errors.push(`${item.id} has invalid field ${field}`);
                    const lane = item.fieldLanes && item.fieldLanes[field];
                    const validLanes = taxonomy.fields?.[field] || [];
                    if (lane && !validLanes.includes(lane)) errors.push(`${item.id} has invalid lane ${lane} for field ${field}`);
                }
            }
        }

        if ('maturity' in item && !VALID_MATURITIES.has(item.maturity)) {
            errors.push(`${item.id} has invalid maturity ${item.maturity}`);
        }

        if ('sources' in item) {
            if (!Array.isArray(item.sources) || item.sources.length === 0) {
                errors.push(`${item.id} sources must be a non-empty array when present`);
            } else {
                for (const [index, source] of item.sources.entries()) {
                    if (!source || typeof source !== 'object') {
                        errors.push(`${item.id} source ${index + 1} must be an object`);
                        continue;
                    }
                    for (const sourceField of ['title', 'url', 'publisher', 'year']) {
                        if (!(sourceField in source)) errors.push(`${item.id} source ${index + 1} is missing ${sourceField}`);
                    }
                    if (source.url && typeof source.url === 'string' && !/^https?:\/\//.test(source.url)) {
                        errors.push(`${item.id} source ${index + 1} url must be http(s)`);
                    }
                }
            }
        }

        if (item.fields?.includes('Genome Editing / CRISPR-Cas') && (!Array.isArray(item.sources) || item.sources.length === 0)) {
            errors.push(`${item.id} is in Genome Editing / CRISPR-Cas but has no sources`);
        }

        if (item.maturity === 'forecast') {
            const roadmap = item.roadmap || {};
            for (const field of ['role', 'timeframe', 'confidence', 'rationale']) {
                if (!roadmap[field]) errors.push(`${item.id} forecast roadmap is missing ${field}`);
            }
            if (!Array.isArray(roadmap.blockers) || roadmap.blockers.length === 0) {
                errors.push(`${item.id} forecast roadmap must list blockers`);
            }
        }
    }

    for (const item of data) {
        for (const prerequisite of item.prerequisites || []) {
            if (!ids.has(prerequisite)) {
                errors.push(`${item.id} references missing prerequisite ${prerequisite}`);
            }
            if (prerequisite === item.id) {
                errors.push(`${item.id} cannot require itself`);
            }
        }
    }

    if (!errors.length) {
        const cycles = findCycles(data, new Set(ids.keys()));
        for (const cycle of cycles) {
            errors.push(`cyclic prerequisite group: ${cycle.sort().join(' -> ')}`);
        }
    }

    if (errors.length) {
        console.error(`Data validation failed with ${errors.length} issue(s):`);
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }

    console.log(`Validated ${data.length} technologies across ${ids.size} unique ids with no missing prerequisites or cycles.`);
}

validate();

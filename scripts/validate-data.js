const fs = require('fs');
const path = require('path');
const {
    EDGE_TYPES,
    EVIDENCE_LEVELS,
    DATE_PRECISIONS,
    REVIEW_STATUSES,
    SOURCE_TYPES,
    SOURCE_SUPPORTS,
    getDependencyEdges,
    getPrerequisiteIds
} = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const REQUIRED_FIELDS = ['id', 'name', 'era', 'description', 'prerequisites', 'dependencyEdges', 'firstKnownDate', 'datePrecision', 'region', 'reviewStatus'];
const VALID_MATURITIES = new Set(['established', 'emerging', 'approved', 'forecast']);
const SOURCE_REQUIRED_FIELDS = new Set([
    'Genome Editing / CRISPR-Cas',
    'Semiconductors & Integrated Circuits',
    'Artificial Intelligence & Machine Learning',
    'Energy Systems & Grid',
    'Spaceflight & Satellites',
    'Robotics & Autonomous Systems',
    'Medical Imaging & Diagnostics',
    'Climate & Environmental Systems',
    'Agriculture & Food Systems',
    'Cybersecurity & Cryptography',
    'Transportation & Logistics',
    'Materials Science & Manufacturing',
    'Telecommunications & Networking',
    'Water & Sanitation Systems'
]);

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
        graph.set(item.id, getPrerequisiteIds(item).filter(id => ids.has(id)));
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
        if (!Array.isArray(item.dependencyEdges)) {
            errors.push(`${item.id} dependencyEdges must be an array`);
        } else {
            const edgePrereqs = [];
            for (const [index, edge] of item.dependencyEdges.entries()) {
                const edgeLabel = `${item.id} dependencyEdges[${index}]`;
                if (!edge || typeof edge !== 'object') {
                    errors.push(`${edgeLabel} must be an object`);
                    continue;
                }
                edgePrereqs.push(edge.prerequisite);
                if (typeof edge.prerequisite !== 'string' || !edge.prerequisite.trim()) {
                    errors.push(`${edgeLabel} is missing prerequisite`);
                }
                if (!EDGE_TYPES.has(edge.type)) {
                    errors.push(`${edgeLabel} has invalid type ${edge.type}`);
                }
                if (typeof edge.confidence !== 'number' || edge.confidence < 0 || edge.confidence > 1) {
                    errors.push(`${edgeLabel} confidence must be a number from 0.0 to 1.0`);
                }
                if (!EVIDENCE_LEVELS.has(edge.evidence_level)) {
                    errors.push(`${edgeLabel} has invalid evidence_level ${edge.evidence_level}`);
                }
                if (typeof edge.note !== 'string' || !edge.note.trim()) {
                    errors.push(`${edgeLabel} must have a short note`);
                }
                if (!REVIEW_STATUSES.has(edge.reviewStatus)) {
                    errors.push(`${edgeLabel} has invalid reviewStatus ${edge.reviewStatus}`);
                }
                if (edge.sources !== undefined) {
                    if (!Array.isArray(edge.sources)) {
                        errors.push(`${edgeLabel} sources must be an array when present`);
                    } else {
                        for (const [sourceIndex, source] of edge.sources.entries()) {
                            validateSource(source, `${edgeLabel} source ${sourceIndex + 1}`, errors);
                            if (source && !source.supports?.includes('edge')) {
                                errors.push(`${edgeLabel} source ${sourceIndex + 1} must include supports: edge`);
                            }
                        }
                    }
                }
            }
            if (Array.isArray(item.prerequisites) && JSON.stringify(item.prerequisites) !== JSON.stringify(edgePrereqs)) {
                errors.push(`${item.id} prerequisites must mirror dependencyEdges prerequisite order`);
            }
        }

        if (typeof item.firstKnownDate !== 'number' || !Number.isFinite(item.firstKnownDate)) {
            errors.push(`${item.id} firstKnownDate must be a finite numeric year`);
        }
        if (!DATE_PRECISIONS.has(item.datePrecision)) {
            errors.push(`${item.id} has invalid datePrecision ${item.datePrecision}`);
        }
        if (typeof item.region !== 'string' || !item.region.trim()) {
            errors.push(`${item.id} region must be a non-empty string`);
        }
        if (!REVIEW_STATUSES.has(item.reviewStatus)) {
            errors.push(`${item.id} has invalid reviewStatus ${item.reviewStatus}`);
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
                    validateSource(source, `${item.id} source ${index + 1}`, errors);
                }
            }
        }

        for (const sourceRequiredField of SOURCE_REQUIRED_FIELDS) {
            if (item.fields?.includes(sourceRequiredField) && (!Array.isArray(item.sources) || item.sources.length === 0)) {
                errors.push(`${item.id} is in ${sourceRequiredField} but has no sources`);
            }
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
        for (const prerequisite of getPrerequisiteIds(item)) {
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

function validateSource(source, label, errors) {
    if (!source || typeof source !== 'object') {
        errors.push(`${label} must be an object`);
        return;
    }
    for (const sourceField of ['title', 'url', 'publisher', 'year', 'source_type', 'supports']) {
        if (!(sourceField in source)) errors.push(`${label} is missing ${sourceField}`);
    }
    if (source.url && typeof source.url === 'string' && !/^https?:\/\//.test(source.url)) {
        errors.push(`${label} url must be http(s)`);
    }
    if (!SOURCE_TYPES.has(source.source_type)) {
        errors.push(`${label} has invalid source_type ${source.source_type}`);
    }
    if (!Array.isArray(source.supports) || source.supports.length === 0) {
        errors.push(`${label} supports must be a non-empty array`);
    } else {
        for (const support of source.supports) {
            if (!SOURCE_SUPPORTS.has(support)) errors.push(`${label} has invalid supports value ${support}`);
        }
    }
}

validate();

const fs = require('fs');
const path = require('path');
const {
    EDGE_TYPES,
    EVIDENCE_LEVELS,
    DATE_PRECISIONS,
    REVIEW_STATUSES,
    SOURCE_TYPES,
    SOURCE_SUPPORTS
} = require('./edge-schema');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const REQUIRED_FIELDS = ['id', 'name', 'era', 'description', 'prerequisites', 'dependencyEdges', 'firstKnownDate', 'datePrecision', 'region', 'reviewStatus'];
const VALID_MATURITIES = new Set(['established', 'emerging', 'approved', 'forecast']);
const MAX_TECHNOLOGIES = 10000;
const MAX_DEPENDENCIES = 100;
const MAX_SOURCES = 100;
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
    'Water & Sanitation Systems',
    'Pharmaceuticals & Drug Development'
]);

function loadData(dataDir = DATA_DIR) {
    const files = fs.readdirSync(dataDir)
        .filter(isTechnologyDataFile)
        .sort();

    return files.flatMap(file => {
        const filePath = path.join(dataDir, file);
        const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(items)) {
            throw new Error(`${file} must contain a JSON array`);
        }
        return items.map(item => ({ ...item, __file: file }));
    });
}

function getSafePrerequisiteIds(item) {
    if (Array.isArray(item?.dependencyEdges)) {
        return item.dependencyEdges
            .filter(edge => edge && typeof edge === 'object')
            .map(edge => edge.prerequisite)
            .filter(prerequisite => typeof prerequisite === 'string');
    }
    return Array.isArray(item?.prerequisites)
        ? item.prerequisites.filter(prerequisite => typeof prerequisite === 'string')
        : [];
}

function findCycles(data, ids) {
    const graph = new Map();
    for (const item of data) {
        graph.set(item.id, getSafePrerequisiteIds(item).filter(id => ids.has(id)));
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

            if (component.length > 1) cycles.push(component);
        }
    }

    for (const id of graph.keys()) {
        if (!indexById.has(id)) visit(id);
    }

    return cycles;
}

function validateSource(source, label, errors) {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
        errors.push(`${label} must be an object`);
        return;
    }

    for (const sourceField of ['title', 'url', 'publisher', 'year', 'source_type', 'supports']) {
        if (!(sourceField in source)) errors.push(`${label} is missing ${sourceField}`);
    }
    for (const textField of ['title', 'url', 'publisher']) {
        if (textField in source && (typeof source[textField] !== 'string' || !source[textField].trim())) {
            errors.push(`${label} ${textField} must be a non-empty string`);
        }
    }
    const sourceTextLimits = { title: 1000, url: 4096, publisher: 500, locator: 5000, source_locator: 5000 };
    for (const [textField, maxLength] of Object.entries(sourceTextLimits)) {
        if (typeof source[textField] === 'string' && source[textField].length > maxLength) {
            errors.push(`${label} ${textField} must be ${maxLength} characters or fewer`);
        }
    }
    if (typeof source.url === 'string' && source.url && !/^https?:\/\//.test(source.url)) {
        errors.push(`${label} url must be http(s)`);
    }
    if ('year' in source && (typeof source.year !== 'number' || !Number.isInteger(source.year))) {
        errors.push(`${label} year must be an integer`);
    }
    if (!SOURCE_TYPES.has(source.source_type)) {
        errors.push(`${label} has invalid source_type ${source.source_type}`);
    }
    if (!Array.isArray(source.supports) || source.supports.length === 0) {
        errors.push(`${label} supports must be a non-empty array`);
    } else {
        if (new Set(source.supports).size !== source.supports.length) {
            errors.push(`${label} supports must not contain duplicates`);
        }
        for (const support of source.supports) {
            if (!SOURCE_SUPPORTS.has(support)) errors.push(`${label} has invalid supports value ${support}`);
        }
    }
    if ('locator' in source && (typeof source.locator !== 'string' || !source.locator.trim())) {
        errors.push(`${label} locator must be a non-empty string when present`);
    }
    if ('source_locator' in source && (typeof source.source_locator !== 'string' || !source.source_locator.trim())) {
        errors.push(`${label} source_locator must be a non-empty string when present`);
    }
}

function validateData(data, taxonomy, { checkFilePlacement = false, label = 'payload' } = {}) {
    const errors = [];
    if (!Array.isArray(data)) return [`${label} must be a JSON array`];
    if (data.length === 0) return [`${label} must contain at least one technology`];
    if (data.length > MAX_TECHNOLOGIES) return [`${label} must contain no more than ${MAX_TECHNOLOGIES} technologies`];
    if (!taxonomy || !Array.isArray(taxonomy.eras) || typeof taxonomy.fields !== 'object') {
        return ['taxonomy must define eras and fields'];
    }

    const validEras = new Set(taxonomy.eras);
    const validFields = new Set(Object.keys(taxonomy.fields || {}));
    const ids = new Map();
    const validItems = [];

    for (const [itemIndex, item] of data.entries()) {
        const entryLabel = item && typeof item === 'object' && item.__file
            ? item.__file
            : `${label}[${itemIndex}]`;
        if (!item || typeof item !== 'object' || Array.isArray(item)) {
            errors.push(`${entryLabel} must be an object`);
            continue;
        }

        for (const field of REQUIRED_FIELDS) {
            if (!(field in item)) {
                errors.push(`${entryLabel}: ${item.id || '<missing id>'} is missing ${field}`);
            }
        }

        if (typeof item.id !== 'string' || !item.id.trim()) {
            errors.push(`${entryLabel}: found an entry with an invalid id`);
            continue;
        }
        validItems.push(item);

        if (!/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/.test(item.id) || item.id.length > 160) {
            errors.push(`${item.id} must be a lowercase identifier of 160 characters or fewer`);
        }

        if (ids.has(item.id)) {
            errors.push(`${item.id} is duplicated in ${ids.get(item.id)} and ${entryLabel}`);
        } else {
            ids.set(item.id, entryLabel);
        }

        for (const textField of ['name', 'description']) {
            if (typeof item[textField] !== 'string' || !item[textField].trim()) {
                errors.push(`${item.id} ${textField} must be a non-empty string`);
            }
        }
        if (typeof item.name === 'string' && item.name.length > 300) {
            errors.push(`${item.id} name must be 300 characters or fewer`);
        }
        if (typeof item.description === 'string' && item.description.length > 5000) {
            errors.push(`${item.id} description must be 5000 characters or fewer`);
        }
        if (!validEras.has(item.era)) {
            errors.push(`${item.id} has invalid era ${item.era}`);
        }

        const expectedFile = `${String(item.era || '').toLowerCase()}.json`;
        if (checkFilePlacement && validEras.has(item.era) && item.__file !== expectedFile) {
            errors.push(`${item.id} has era ${item.era} but is stored in ${item.__file || entryLabel}`);
        }

        if (!Array.isArray(item.prerequisites)) {
            errors.push(`${item.id} prerequisites must be an array`);
        } else {
            if (item.prerequisites.length > MAX_DEPENDENCIES) {
                errors.push(`${item.id} prerequisites must contain no more than ${MAX_DEPENDENCIES} entries`);
            }
            if (new Set(item.prerequisites).size !== item.prerequisites.length) {
                errors.push(`${item.id} prerequisites must not contain duplicates`);
            }
            for (const [index, prerequisite] of item.prerequisites.entries()) {
                if (typeof prerequisite !== 'string' || !prerequisite.trim()) {
                    errors.push(`${item.id} prerequisites[${index}] must be a non-empty string`);
                }
            }
        }

        if (!Array.isArray(item.dependencyEdges)) {
            errors.push(`${item.id} dependencyEdges must be an array`);
        } else {
            if (item.dependencyEdges.length > MAX_DEPENDENCIES) {
                errors.push(`${item.id} dependencyEdges must contain no more than ${MAX_DEPENDENCIES} entries`);
            }
            const edgePrereqs = [];
            for (const [index, edge] of item.dependencyEdges.entries()) {
                const edgeLabel = `${item.id} dependencyEdges[${index}]`;
                if (!edge || typeof edge !== 'object' || Array.isArray(edge)) {
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
                if (typeof edge.note === 'string' && edge.note.length > 5000) {
                    errors.push(`${edgeLabel} note must be 5000 characters or fewer`);
                }
                if (!REVIEW_STATUSES.has(edge.reviewStatus)) {
                    errors.push(`${edgeLabel} has invalid reviewStatus ${edge.reviewStatus}`);
                }
                if (edge.sources !== undefined) {
                    if (!Array.isArray(edge.sources)) {
                        errors.push(`${edgeLabel} sources must be an array when present`);
                    } else {
                        if (edge.sources.length > MAX_SOURCES) {
                            errors.push(`${edgeLabel} sources must contain no more than ${MAX_SOURCES} entries`);
                        }
                        for (const [sourceIndex, source] of edge.sources.entries()) {
                            validateSource(source, `${edgeLabel} source ${sourceIndex + 1}`, errors);
                            if (source && !source.supports?.includes('edge')) {
                                errors.push(`${edgeLabel} source ${sourceIndex + 1} must include supports: edge`);
                            }
                        }
                    }
                }
            }
            if (new Set(edgePrereqs).size !== edgePrereqs.length) {
                errors.push(`${item.id} dependencyEdges must not contain duplicate prerequisites`);
            }
            if (Array.isArray(item.prerequisites) && JSON.stringify(item.prerequisites) !== JSON.stringify(edgePrereqs)) {
                errors.push(`${item.id} prerequisites must mirror dependencyEdges prerequisite order`);
            }
        }

        if (typeof item.firstKnownDate !== 'number' || !Number.isFinite(item.firstKnownDate)) {
            errors.push(`${item.id} firstKnownDate must be a finite numeric year`);
        } else if (!Number.isInteger(item.firstKnownDate) || item.firstKnownDate < -10000000 || item.firstKnownDate > 10000) {
            errors.push(`${item.id} firstKnownDate must be an integer year from -10000000 to 10000`);
        }
        if (!DATE_PRECISIONS.has(item.datePrecision)) {
            errors.push(`${item.id} has invalid datePrecision ${item.datePrecision}`);
        }
        if (typeof item.region !== 'string' || !item.region.trim()) {
            errors.push(`${item.id} region must be a non-empty string`);
        }
        if (typeof item.region === 'string' && item.region.length > 1000) {
            errors.push(`${item.id} region must be 1000 characters or fewer`);
        }
        if (!REVIEW_STATUSES.has(item.reviewStatus)) {
            errors.push(`${item.id} has invalid reviewStatus ${item.reviewStatus}`);
        }

        if ('fields' in item) {
            if (!Array.isArray(item.fields)) {
                errors.push(`${item.id} fields must be an array when present`);
            } else {
                if (item.fields.length > 50) errors.push(`${item.id} fields must contain no more than 50 entries`);
                if (new Set(item.fields).size !== item.fields.length) {
                    errors.push(`${item.id} fields must not contain duplicates`);
                }
                for (const field of item.fields) {
                    if (!validFields.has(field)) errors.push(`${item.id} has invalid field ${field}`);
                    const lane = item.fieldLanes && item.fieldLanes[field];
                    const validLanes = taxonomy.fields?.[field] || [];
                    if (lane && !validLanes.includes(lane)) errors.push(`${item.id} has invalid lane ${lane} for field ${field}`);
                }
            }
        }
        if ('fieldLanes' in item) {
            if (!item.fieldLanes || typeof item.fieldLanes !== 'object' || Array.isArray(item.fieldLanes)) {
                errors.push(`${item.id} fieldLanes must be an object when present`);
            } else {
                for (const [field, lane] of Object.entries(item.fieldLanes)) {
                    if (!item.fields?.includes(field)) errors.push(`${item.id} fieldLanes includes unassigned field ${field}`);
                    if (typeof lane !== 'string' || !lane.trim()) {
                        errors.push(`${item.id} fieldLanes value for ${field} must be a non-empty string`);
                    } else if (!(taxonomy.fields?.[field] || []).includes(lane)) {
                        errors.push(`${item.id} has invalid lane ${lane} for field ${field}`);
                    }
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
                if (item.sources.length > MAX_SOURCES) {
                    errors.push(`${item.id} sources must contain no more than ${MAX_SOURCES} entries`);
                }
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
            if (!item.roadmap || typeof item.roadmap !== 'object' || Array.isArray(item.roadmap)) {
                errors.push(`${item.id} forecast roadmap must be an object`);
            } else {
                for (const field of ['role', 'timeframe', 'confidence', 'rationale']) {
                    if (typeof item.roadmap[field] !== 'string' || !item.roadmap[field].trim()) {
                        errors.push(`${item.id} forecast roadmap is missing ${field}`);
                    } else if (item.roadmap[field].length > 5000) {
                        errors.push(`${item.id} forecast roadmap ${field} must be 5000 characters or fewer`);
                    }
                }
                if (!Array.isArray(item.roadmap.blockers) || item.roadmap.blockers.length === 0) {
                    errors.push(`${item.id} forecast roadmap must list blockers`);
                } else {
                    if (item.roadmap.blockers.length > 100) errors.push(`${item.id} forecast roadmap must list no more than 100 blockers`);
                    for (const [index, blocker] of item.roadmap.blockers.entries()) {
                        if (typeof blocker !== 'string' || !blocker.trim() || blocker.length > 1000) {
                            errors.push(`${item.id} forecast roadmap blocker ${index + 1} must be a non-empty string of 1000 characters or fewer`);
                        }
                    }
                }
            }
        }
    }

    for (const item of validItems) {
        for (const prerequisite of getSafePrerequisiteIds(item)) {
            if (!ids.has(prerequisite)) {
                errors.push(`${item.id} references missing prerequisite ${prerequisite}`);
            }
            if (prerequisite === item.id) {
                errors.push(`${item.id} cannot require itself`);
            }
        }
    }

    const cycles = findCycles(validItems, new Set(ids.keys()));
    for (const cycle of cycles) {
        errors.push(`cyclic prerequisite group: ${cycle.sort().join(' -> ')}`);
    }

    return errors;
}

function main() {
    const data = loadData();
    const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));
    const errors = validateData(data, taxonomy, { checkFilePlacement: true, label: 'data' });

    if (errors.length) {
        console.error(`Data validation failed with ${errors.length} issue(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exitCode = 1;
        return;
    }

    console.log(`Validated ${data.length} technologies across ${data.length} unique ids with no missing prerequisites or cycles.`);
}

if (require.main === module) main();

module.exports = {
    findCycles,
    loadData,
    validateData,
    validateSource
};

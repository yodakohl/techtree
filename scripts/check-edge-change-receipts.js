const fs = require('fs');
const path = require('path');
const {
    EDGE_TYPES,
    EVIDENCE_LEVELS
} = require('./edge-schema');

const DATA_DIR = path.join(__dirname, '..', 'data');
const RECEIPT_DIR = path.join(__dirname, '..', 'docs', 'edge-change-receipts');
const CHANGE_CLASSES = new Set([
    'evidence_upgrade',
    'semantic_retype',
    'topology_change',
    'no_change'
]);
const SOURCE_SUPPORT_VALUES = new Set(['yes', 'partial', 'no']);

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

function loadReceipts() {
    if (!fs.existsSync(RECEIPT_DIR)) return [];
    return fs.readdirSync(RECEIPT_DIR)
        .filter(file => file.endsWith('.json'))
        .sort()
        .map(file => ({
            file,
            receipt: JSON.parse(fs.readFileSync(path.join(RECEIPT_DIR, file), 'utf8'))
        }));
}

function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

function isUrl(value) {
    return isNonEmptyString(value) && /^https?:\/\//.test(value);
}

function assert(errors, condition, message) {
    if (!condition) errors.push(message);
}

function validateClaim(errors, file, label, claim) {
    assert(errors, claim && typeof claim === 'object', `${file}: ${label} must be an object`);
    if (!claim || typeof claim !== 'object') return;
    assert(errors, EDGE_TYPES.has(claim.type), `${file}: ${label}.type is invalid`);
    assert(errors, EVIDENCE_LEVELS.has(claim.evidence_level), `${file}: ${label}.evidence_level is invalid`);
    assert(errors, typeof claim.confidence === 'number' && claim.confidence >= 0 && claim.confidence <= 1, `${file}: ${label}.confidence must be 0.0-1.0`);
    assert(errors, isNonEmptyString(claim.note), `${file}: ${label}.note is required`);
}

function findEdge(data, dependentId, prerequisiteId) {
    const item = data.find(candidate => candidate.id === dependentId);
    if (!item) return { item: null, edge: null };
    const edge = (item.dependencyEdges || []).find(candidate => candidate.prerequisite === prerequisiteId);
    return { item, edge };
}

function edgeHasSource(edge, sourceUrl) {
    return Array.isArray(edge.sources) && edge.sources.some(source => {
        return source.url === sourceUrl && Array.isArray(source.supports) && source.supports.includes('edge');
    });
}

function validateReceipt(data, file, receipt) {
    const errors = [];
    assert(errors, isNonEmptyString(receipt.id), `${file}: id is required`);
    assert(errors, /^\d{4}-\d{2}-\d{2}$/.test(receipt.decision_date || ''), `${file}: decision_date must be YYYY-MM-DD`);
    assert(errors, CHANGE_CLASSES.has(receipt.change_class), `${file}: change_class is invalid`);
    assert(errors, receipt.edge && typeof receipt.edge === 'object', `${file}: edge is required`);
    assert(errors, isNonEmptyString(receipt.edge?.dependent), `${file}: edge.dependent is required`);
    assert(errors, isNonEmptyString(receipt.edge?.prerequisite), `${file}: edge.prerequisite is required`);
    validateClaim(errors, file, 'old_claim', receipt.old_claim);
    validateClaim(errors, file, 'new_claim', receipt.new_claim);
    assert(errors, SOURCE_SUPPORT_VALUES.has(receipt.source_supports_edge), `${file}: source_supports_edge is invalid`);
    assert(errors, isUrl(receipt.source_url), `${file}: source_url must be an HTTP URL`);
    assert(errors, isNonEmptyString(receipt.invariant_preserved_or_changed), `${file}: invariant_preserved_or_changed is required`);
    assert(errors, Array.isArray(receipt.would_reject_if) && receipt.would_reject_if.length > 0, `${file}: would_reject_if must have at least one falsifiable rejection condition`);
    assert(errors, isNonEmptyString(receipt.short_reason), `${file}: short_reason is required`);
    assert(errors, Array.isArray(receipt.validation_commands) && receipt.validation_commands.length > 0, `${file}: validation_commands must list at least one command`);

    const oldClaim = receipt.old_claim || {};
    const newClaim = receipt.new_claim || {};
    if (receipt.change_class === 'semantic_retype') {
        assert(errors, oldClaim.type !== newClaim.type, `${file}: semantic_retype must change edge type`);
        assert(errors, isNonEmptyString(receipt.ontology_before), `${file}: semantic_retype requires ontology_before`);
        assert(errors, isNonEmptyString(receipt.ontology_after), `${file}: semantic_retype requires ontology_after`);
    }
    if (receipt.change_class === 'evidence_upgrade') {
        assert(errors, oldClaim.type === newClaim.type, `${file}: evidence_upgrade must preserve edge type`);
        assert(errors, oldClaim.evidence_level !== newClaim.evidence_level, `${file}: evidence_upgrade must change evidence_level`);
    }

    const { item, edge } = findEdge(data, receipt.edge?.dependent, receipt.edge?.prerequisite);
    assert(errors, item, `${file}: dependent node ${receipt.edge?.dependent} does not exist`);
    assert(errors, edge, `${file}: current edge ${receipt.edge?.dependent}->${receipt.edge?.prerequisite} does not exist`);
    if (edge && receipt.new_claim) {
        assert(errors, edge.type === newClaim.type, `${file}: current edge type does not match new_claim.type`);
        assert(errors, edge.evidence_level === newClaim.evidence_level, `${file}: current edge evidence_level does not match new_claim.evidence_level`);
        assert(errors, edge.confidence === newClaim.confidence, `${file}: current edge confidence does not match new_claim.confidence`);
        assert(errors, edge.note === newClaim.note, `${file}: current edge note does not match new_claim.note`);
        if (receipt.source_supports_edge !== 'no') {
            assert(errors, edgeHasSource(edge, receipt.source_url), `${file}: current edge must cite source_url with supports: edge`);
        }
    }

    return errors;
}

function main() {
    const data = loadData();
    const receipts = loadReceipts();
    const errors = receipts.flatMap(({ file, receipt }) => validateReceipt(data, file, receipt));

    if (errors.length) {
        console.error(`Edge change receipt audit failed with ${errors.length} issue(s):`);
        for (const error of errors) console.error(`- ${error}`);
        process.exit(1);
    }

    console.log(`Edge change receipt audit passed for ${receipts.length} receipt(s).`);
}

main();

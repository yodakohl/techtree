const fs = require('fs');
const path = require('path');
const {
    EDGE_TYPES,
    EVIDENCE_LEVELS,
    SOURCE_TYPES
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
const SUPPORT_RELATIONSHIPS = new Set([
    'describes_component_architecture',
    'demonstrates_method_dependency',
    'establishes_historical_lineage',
    'documents_application_use',
    'documents_approval_or_deployment',
    'supports_chronology',
    'reviews_field_relationship'
]);
const EDGE_TYPE_SUPPORT_RELATIONSHIPS = {
    required: new Set([
        'describes_component_architecture',
        'documents_approval_or_deployment'
    ]),
    enabling: new Set([
        'describes_component_architecture',
        'demonstrates_method_dependency',
        'documents_application_use',
        'reviews_field_relationship'
    ]),
    accelerates: new Set([
        'documents_application_use',
        'reviews_field_relationship'
    ]),
    historical_predecessor: new Set([
        'establishes_historical_lineage',
        'supports_chronology',
        'reviews_field_relationship'
    ]),
    common_dependency: new Set([
        'supports_chronology',
        'reviews_field_relationship'
    ]),
    commercial_or_scaling_dependency: new Set([
        'describes_component_architecture',
        'documents_application_use',
        'documents_approval_or_deployment',
        'reviews_field_relationship'
    ]),
    speculative: new Set([
        'supports_chronology',
        'reviews_field_relationship'
    ])
};
const COMMON_WORDS = new Set([
    'about',
    'because',
    'between',
    'claim',
    'claims',
    'directly',
    'edge',
    'from',
    'into',
    'source',
    'supports',
    'that',
    'this',
    'with'
]);

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

function normalizeText(value) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function meaningfulWords(value) {
    return normalizeText(value)
        .split(/\s+/)
        .filter(word => word.length > 3 && !COMMON_WORDS.has(word));
}

function wordSimilarity(a, b) {
    const aWords = new Set(meaningfulWords(a));
    const bWords = new Set(meaningfulWords(b));
    if (!aWords.size || !bWords.size) return 0;
    const overlap = [...aWords].filter(word => bWords.has(word)).length;
    return overlap / Math.min(aWords.size, bWords.size);
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

function findEdgeSource(edge, sourceUrl) {
    if (!Array.isArray(edge.sources)) return null;
    return edge.sources.find(source => {
        return source.url === sourceUrl && Array.isArray(source.supports) && source.supports.includes('edge');
    }) || null;
}

function validateSourceShape(errors, file, receipt) {
    const shape = receipt.source_shape;
    assert(errors, shape && typeof shape === 'object', `${file}: source_shape is required`);
    if (!shape || typeof shape !== 'object') return;

    assert(errors, SOURCE_TYPES.has(shape.source_type), `${file}: source_shape.source_type is invalid`);
    assert(errors, SUPPORT_RELATIONSHIPS.has(shape.support_relationship), `${file}: source_shape.support_relationship is invalid`);
    if (SUPPORT_RELATIONSHIPS.has(shape.support_relationship) && EDGE_TYPES.has(receipt.new_claim?.type)) {
        const allowed = EDGE_TYPE_SUPPORT_RELATIONSHIPS[receipt.new_claim.type] || new Set();
        assert(
            errors,
            allowed.has(shape.support_relationship),
            `${file}: support_relationship ${shape.support_relationship} is too weak or mismatched for ${receipt.new_claim.type} edge`
        );
    }
    assert(errors, isNonEmptyString(shape.source_locator), `${file}: source_shape.source_locator is required`);
    assert(errors, isNonEmptyString(shape.source_claim_summary), `${file}: source_shape.source_claim_summary is required`);
    assert(errors, isNonEmptyString(shape.source_support_rationale), `${file}: source_shape.source_support_rationale is required`);

    for (const field of ['source_claim_summary', 'source_support_rationale']) {
        if (typeof shape[field] === 'string') {
            assert(errors, shape[field].trim().length >= 30, `${file}: source_shape.${field} must be specific enough to dispute`);
        }
    }

    const rationale = shape.source_support_rationale;
    if (typeof rationale === 'string') {
        assert(errors, normalizeText(rationale) !== normalizeText(shape.source_claim_summary), `${file}: source_support_rationale must not merely restate source_claim_summary`);
        assert(errors, normalizeText(rationale) !== normalizeText(receipt.new_claim?.note), `${file}: source_support_rationale must not merely restate new_claim.note`);
        assert(errors, wordSimilarity(rationale, shape.source_claim_summary) < 0.86, `${file}: source_support_rationale is too similar to source_claim_summary`);
        assert(errors, wordSimilarity(rationale, receipt.new_claim?.note) < 0.9, `${file}: source_support_rationale is too similar to new_claim.note`);
    }
}

function validateDemotionPreserves(errors, file, receipt) {
    const preserves = receipt.demotion_preserves;
    assert(errors, Array.isArray(preserves) && preserves.length > 0, `${file}: required-edge demotions must list demotion_preserves`);
    if (!Array.isArray(preserves) || !preserves.length) return;

    const seen = new Set();
    for (const [index, preserved] of preserves.entries()) {
        const prefix = `${file}: demotion_preserves[${index}]`;
        assert(errors, preserved && typeof preserved === 'object', `${prefix} must be an object`);
        if (!preserved || typeof preserved !== 'object') continue;

        assert(errors, isNonEmptyString(preserved.prerequisite), `${prefix}.prerequisite is required`);
        assert(errors, EDGE_TYPES.has(preserved.type), `${prefix}.type is invalid`);
        assert(errors, isNonEmptyString(preserved.reason), `${prefix}.reason is required`);
        if (isNonEmptyString(preserved.reason)) {
            assert(errors, preserved.reason.trim().length >= 30, `${prefix}.reason must be specific enough to dispute`);
        }
        if (isNonEmptyString(preserved.prerequisite)) {
            assert(errors, preserved.prerequisite !== receipt.edge?.prerequisite, `${prefix}.prerequisite must not be the demoted edge`);
            assert(errors, !seen.has(preserved.prerequisite), `${prefix}.prerequisite is duplicated`);
            seen.add(preserved.prerequisite);
        }
    }
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
    validateSourceShape(errors, file, receipt);
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
        if (oldClaim.type === 'required' && newClaim.type !== 'required') {
            validateDemotionPreserves(errors, file, receipt);
        }
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
            const source = findEdgeSource(edge, receipt.source_url);
            assert(errors, source, `${file}: current edge must cite source_url with supports: edge`);
            if (source && receipt.source_shape?.source_type) {
                assert(errors, source.source_type === receipt.source_shape.source_type, `${file}: source_shape.source_type must match cited edge source`);
            }
        }
    }
    if (item && Array.isArray(receipt.demotion_preserves)) {
        for (const [index, preserved] of receipt.demotion_preserves.entries()) {
            const preservedEdge = (item.dependencyEdges || []).find(candidate => candidate.prerequisite === preserved.prerequisite);
            assert(errors, preservedEdge, `${file}: demotion_preserves[${index}] edge ${receipt.edge?.dependent}->${preserved.prerequisite} does not exist`);
            if (preservedEdge) {
                assert(errors, preservedEdge.type === preserved.type, `${file}: demotion_preserves[${index}] expected ${preserved.prerequisite} to be ${preserved.type}, got ${preservedEdge.type}`);
            }
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

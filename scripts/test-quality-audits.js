const assert = require('assert/strict');
const {
    hasLocatedNodeSource,
    hasLocatedStrongTrustSource,
    hasNodeSource,
    hasUnresolvedChronology
} = require('./accuracy-risk-report');
const {
    dependencySummary,
    hasGenericTemplateEdgeNote,
    sourceEvidenceMismatch,
    usesEraDefaultDate
} = require('./audit-random-source-fit');

const edgeOnlyNode = {
    sources: [{
        title: 'Context only',
        source_type: 'review',
        supports: ['edge'],
        source_locator: 'A located edge claim.'
    }]
};
assert.equal(hasNodeSource(edgeOnlyNode), false);
assert.equal(hasLocatedNodeSource(edgeOnlyNode), false);

const locatedNode = {
    sources: [{
        title: 'Direct evidence',
        source_type: 'review',
        supports: ['node'],
        source_locator: 'The abstract directly dates and defines the technology.'
    }]
};
assert.equal(hasNodeSource(locatedNode), true);
assert.equal(hasLocatedNodeSource(locatedNode), true);
assert.equal(hasLocatedStrongTrustSource(locatedNode), true);

const ancientDefault = {
    era: 'Ancient',
    firstKnownDate: -10000,
    datePrecision: 'millennium',
    region: 'Global / multiple regions'
};
assert.equal(usesEraDefaultDate(ancientDefault), true);
assert.equal(hasUnresolvedChronology(ancientDefault), true);
assert.equal(hasUnresolvedChronology({ ...ancientDefault, firstKnownDate: -9500, datePrecision: 'unknown' }), true);
assert.equal(hasUnresolvedChronology({ ...ancientDefault, firstKnownDate: -9500, datePrecision: 'century' }), false);

assert.equal(hasGenericTemplateEdgeNote({ note: 'Scientific Method provides a capability that enables this technology.' }), true);
assert.match(
    dependencySummary([{ prerequisite: 'fluid_mechanics', evidence_level: 'review', reviewStatus: 'source_checked' }]),
    /review/
);

assert.equal(sourceEvidenceMismatch({
    id: 'talens',
    name: 'TALENs',
    sources: [{ title: 'Efficient design and assembly of custom TALEN constructs', supports: ['node'] }]
}), false);
assert.equal(sourceEvidenceMismatch({
    id: 'barometer',
    name: 'Barometer',
    sources: [{ title: 'Glass of the Ancient Mediterranean', supports: ['node'] }]
}), true);

console.log('Quality audit regression tests passed.');

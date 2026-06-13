const EDGE_TYPES = new Set([
    'required',
    'enabling',
    'accelerates',
    'historical_predecessor',
    'common_dependency',
    'commercial_or_scaling_dependency',
    'speculative'
]);

const EVIDENCE_LEVELS = new Set([
    'primary_source',
    'review',
    'textbook',
    'expert_inference',
    'weak_inference',
    'speculative'
]);

const DATE_PRECISIONS = new Set([
    'year',
    'exact',
    'decade',
    'century',
    'millennium',
    'unknown'
]);

const REVIEW_STATUSES = new Set([
    'generated',
    'structurally_validated',
    'source_checked',
    'domain_reviewed',
    'disputed'
]);

const SOURCE_TYPES = new Set([
    'primary_paper',
    'review',
    'textbook',
    'official_agency',
    'museum',
    'generic_overview',
    'weak_web'
]);

const SOURCE_SUPPORTS = new Set([
    'node',
    'edge',
    'roadmap',
    'maturity'
]);

const ERA_ORDER = new Map([
    ['Ancient', 0],
    ['Classical', 1],
    ['Medieval', 2],
    ['Renaissance', 3],
    ['Industrial', 4],
    ['Modern', 5],
    ['Future', 6]
]);

const ERA_DEFAULT_DATES = {
    Ancient: { firstKnownDate: -10000, datePrecision: 'millennium', region: 'Global / multiple regions' },
    Classical: { firstKnownDate: -500, datePrecision: 'century', region: 'Mediterranean, South Asia, East Asia, and other classical societies' },
    Medieval: { firstKnownDate: 500, datePrecision: 'century', region: 'Afro-Eurasia and other medieval societies' },
    Renaissance: { firstKnownDate: 1400, datePrecision: 'century', region: 'Europe and connected early modern exchange networks' },
    Industrial: { firstKnownDate: 1760, datePrecision: 'decade', region: 'Europe, North America, and industrializing regions' },
    Modern: { firstKnownDate: 1945, datePrecision: 'decade', region: 'Global / multiple regions' },
    Future: { firstKnownDate: 2035, datePrecision: 'decade', region: 'Forecast / not yet broadly established' }
};

function getDependencyEdges(item) {
    if (Array.isArray(item.dependencyEdges)) return item.dependencyEdges;
    return (item.prerequisites || []).map(prerequisite => ({
        prerequisite,
        type: 'enabling',
        confidence: 0.55,
        evidence_level: 'weak_inference',
        note: 'Legacy prerequisite edge not yet semantically reviewed.',
        reviewStatus: 'structurally_validated'
    }));
}

function getPrerequisiteIds(item) {
    return getDependencyEdges(item).map(edge => edge.prerequisite);
}

function sourceQualityWeight(sourceType) {
    return {
        primary_paper: 1,
        textbook: 0.9,
        review: 0.85,
        official_agency: 0.8,
        museum: 0.75,
        generic_overview: 0.45,
        weak_web: 0.25
    }[sourceType] ?? 0.25;
}

module.exports = {
    EDGE_TYPES,
    EVIDENCE_LEVELS,
    DATE_PRECISIONS,
    REVIEW_STATUSES,
    SOURCE_TYPES,
    SOURCE_SUPPORTS,
    ERA_ORDER,
    ERA_DEFAULT_DATES,
    getDependencyEdges,
    getPrerequisiteIds,
    sourceQualityWeight
};

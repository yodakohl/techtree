(function attachTrustLevels(root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.TechTreeTrust = factory();
    }
})(typeof globalThis !== 'undefined' ? globalThis : this, function buildTrustLevels() {
    const ERA_DEFAULT_DATES = {
        Ancient: {
            firstKnownDate: -10000,
            datePrecision: 'millennium',
            region: 'Global / multiple regions'
        },
        Classical: {
            firstKnownDate: -500,
            datePrecision: 'century',
            region: 'Mediterranean, South Asia, East Asia, and other classical societies'
        },
        Medieval: {
            firstKnownDate: 500,
            datePrecision: 'century',
            region: 'Afro-Eurasia and other medieval societies'
        },
        Renaissance: {
            firstKnownDate: 1400,
            datePrecision: 'century',
            region: 'Europe and connected early modern exchange networks'
        },
        Industrial: {
            firstKnownDate: 1760,
            datePrecision: 'decade',
            region: 'Europe, North America, and industrializing regions'
        },
        Modern: {
            firstKnownDate: 1945,
            datePrecision: 'decade',
            region: 'Global / multiple regions'
        },
        Future: {
            firstKnownDate: 2035,
            datePrecision: 'decade',
            region: 'Forecast / not yet broadly established'
        }
    };

    const NODE_TRUST = {
        high: {
            level: 'high',
            label: 'High trust',
            shortLabel: 'High',
            description: 'Source-checked, source-backed, and not using an era-default date.'
        },
        medium: {
            level: 'medium',
            label: 'Medium trust',
            shortLabel: 'Medium',
            description: 'Curated or reviewed, but still missing part of the strongest evidence/date package.'
        },
        low: {
            level: 'low',
            label: 'Low trust',
            shortLabel: 'Low',
            description: 'Generated, inferred, unsourced, unknown-date, or still using an era-default date.'
        },
        future: {
            level: 'future',
            label: 'Future roadmap',
            shortLabel: 'Future',
            description: 'Roadmap claim or future node, not a historical fact.'
        }
    };

    const EDGE_TRUST = {
        strong: {
            level: 'strong',
            label: 'Strong edge',
            shortLabel: 'Strong',
            description: 'Required dependency with an edge-level source.'
        },
        medium: {
            level: 'medium',
            label: 'Medium edge',
            shortLabel: 'Medium',
            description: 'Sourced or well-specified contextual dependency.'
        },
        weak: {
            level: 'weak',
            label: 'Weak edge',
            shortLabel: 'Weak',
            description: 'Inferred, unsourced, speculative, or low-confidence dependency.'
        }
    };

    function hasNodeSource(node) {
        return Array.isArray(node?.sources)
            && node.sources.some(source => Array.isArray(source.supports)
                ? source.supports.includes('node')
                : true);
    }

    function hasEdgeSource(edge) {
        return Array.isArray(edge?.sources)
            && edge.sources.some(source => Array.isArray(source.supports)
                ? source.supports.includes('edge')
                : true);
    }

    function usesEraDefaultDate(node) {
        const defaults = ERA_DEFAULT_DATES[node?.era];
        return typeof node?.firstKnownDate === 'number'
            && defaults
            && node.firstKnownDate === defaults.firstKnownDate
            && node.datePrecision === defaults.datePrecision
            && node.region === defaults.region;
    }

    function isFutureRoadmap(node) {
        return node?.era === 'Future'
            || node?.maturity === 'forecast'
            || Boolean(node?.roadmap);
    }

    function deriveNodeTrust(node) {
        const sourced = hasNodeSource(node);
        const eraDefaultDate = usesEraDefaultDate(node);
        const reviewStatus = node?.reviewStatus || 'generated';
        const reviewed = reviewStatus === 'source_checked' || reviewStatus === 'domain_reviewed';
        const curated = reviewed || reviewStatus === 'structurally_validated';
        const unknownDate = !node?.datePrecision || node.datePrecision === 'unknown' || typeof node.firstKnownDate !== 'number';

        if (isFutureRoadmap(node)) {
            return {
                ...NODE_TRUST.future,
                hasSource: sourced,
                usesEraDefaultDate: eraDefaultDate,
                reasons: ['roadmap or future-era claim']
            };
        }

        if (reviewed && sourced && !eraDefaultDate && !unknownDate) {
            return {
                ...NODE_TRUST.high,
                hasSource: sourced,
                usesEraDefaultDate: eraDefaultDate,
                reasons: ['source checked', 'has node source', 'specific first-known date']
            };
        }

        if (reviewStatus === 'generated' || !sourced || eraDefaultDate || unknownDate) {
            const reasons = [];
            if (reviewStatus === 'generated') reasons.push('generated review status');
            if (!sourced) reasons.push('no node-level source');
            if (eraDefaultDate) reasons.push('era-default date');
            if (unknownDate) reasons.push('unknown date precision');
            return {
                ...NODE_TRUST.low,
                hasSource: sourced,
                usesEraDefaultDate: eraDefaultDate,
                reasons
            };
        }

        if (curated) {
            return {
                ...NODE_TRUST.medium,
                hasSource: sourced,
                usesEraDefaultDate: eraDefaultDate,
                reasons: ['curated or reviewed', 'incomplete high-trust criteria']
            };
        }

        return {
            ...NODE_TRUST.low,
            hasSource: sourced,
            usesEraDefaultDate: eraDefaultDate,
            reasons: ['unrecognized review status']
        };
    }

    function hasStrongNote(edge) {
        return typeof edge?.note === 'string'
            && edge.note.trim().length >= 80
            && (edge.confidence || 0) >= 0.7;
    }

    function deriveEdgeTrust(edge) {
        const sourced = hasEdgeSource(edge);
        const evidence = edge?.evidence_level || 'weak_inference';
        const type = edge?.type || 'enabling';
        const confidence = typeof edge?.confidence === 'number' ? edge.confidence : 0;
        const inferred = evidence === 'expert_inference'
            || evidence === 'weak_inference'
            || evidence === 'speculative'
            || edge?.reviewStatus === 'generated';
        const lowConfidence = confidence < 0.6;
        const contextualWithSource = sourced && [
            'enabling',
            'accelerates',
            'historical_predecessor',
            'common_dependency',
            'commercial_or_scaling_dependency'
        ].includes(type);

        if (inferred || lowConfidence || type === 'speculative') {
            const reasons = [];
            if (inferred) reasons.push('inferred or speculative evidence');
            if (lowConfidence) reasons.push('low confidence');
            if (type === 'speculative') reasons.push('speculative edge type');
            if (!sourced) reasons.push('no edge-level source');
            return {
                ...EDGE_TRUST.weak,
                hasSource: sourced,
                reasons
            };
        }

        if (type === 'required' && sourced && confidence >= 0.75) {
            return {
                ...EDGE_TRUST.strong,
                hasSource: sourced,
                reasons: ['required edge', 'edge-level source', 'high confidence']
            };
        }

        if (!sourced) {
            const reasons = [];
            if (!sourced) reasons.push('no edge-level source');
            return {
                ...EDGE_TRUST.weak,
                hasSource: sourced,
                reasons
            };
        }

        if (contextualWithSource || hasStrongNote(edge)) {
            return {
                ...EDGE_TRUST.medium,
                hasSource: sourced,
                reasons: sourced ? ['edge-level source'] : ['specific high-confidence note']
            };
        }

        return {
            ...EDGE_TRUST.weak,
            hasSource: sourced,
            reasons: ['does not meet medium or strong edge criteria']
        };
    }

    return {
        ERA_DEFAULT_DATES,
        NODE_TRUST,
        EDGE_TRUST,
        hasNodeSource,
        hasEdgeSource,
        usesEraDefaultDate,
        isFutureRoadmap,
        deriveNodeTrust,
        deriveEdgeTrust
    };
});

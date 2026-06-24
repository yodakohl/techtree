const LAUNCH_QUALITY_EXCLUDED_ERAS = new Set(['Future']);
const LAUNCH_QUALITY_SCOPE_LABEL = 'Ancient through Modern';

function isFutureTechnology(item) {
    return item?.era === 'Future';
}

function isLaunchQualityNode(item) {
    return !LAUNCH_QUALITY_EXCLUDED_ERAS.has(item?.era);
}

function launchQualityNodes(items) {
    return items.filter(isLaunchQualityNode);
}

const FUTURE_EXCLUSION_NOTE = 'Future-era technologies are forecast/roadmap nodes. They are structurally validated, but they are excluded from launch-quality source-check, placeholder-date, edge-source, source-fit, and source-URL gates.';

module.exports = {
    FUTURE_EXCLUSION_NOTE,
    LAUNCH_QUALITY_EXCLUDED_ERAS,
    LAUNCH_QUALITY_SCOPE_LABEL,
    isFutureTechnology,
    isLaunchQualityNode,
    launchQualityNodes
};

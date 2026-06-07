const TECHNOLOGY_DATA_EXCLUDES = new Set([
    'taxonomy.json',
    'quality-snapshot.json'
]);

function isTechnologyDataFile(file) {
    return file.endsWith('.json') && !TECHNOLOGY_DATA_EXCLUDES.has(file);
}

module.exports = {
    isTechnologyDataFile
};

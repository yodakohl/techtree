const fs = require('fs');
const path = require('path');
const { isTechnologyDataFile } = require('./data-files');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');

const taxonomy = JSON.parse(fs.readFileSync(TAXONOMY_FILE, 'utf8'));

const branchRules = [
    ['Agriculture & Food', ['agricultur', 'farm', 'crop', 'seed', 'grain', 'food', 'fermentation', 'bread', 'irrigation', 'plow', 'animal_husbandry', 'domestication', 'pastoral', 'fishing', 'harvest', 'green_revolution']],
    ['Materials & Manufacturing', ['stone_tool', 'tool', 'metal', 'bronze', 'iron', 'steel', 'alloy', 'glass', 'ceramic', 'pottery', 'textile', 'weaving', 'manufactur', 'fabrication', 'factory', 'assembly', '3d_print', 'materials', 'polymer', 'plastic', 'composite', 'nanotechnology', 'casting', 'molding']],
    ['Energy & Power', ['fire', 'charcoal', 'coal', 'steam', 'electric', 'power', 'battery', 'solar', 'wind', 'nuclear', 'fusion', 'hydrogen', 'grid', 'turbine', 'motor', 'engine', 'fuel', 'geothermal', 'renewable', 'energy']],
    ['Transport & Logistics', ['boat', 'ship', 'sail', 'navigation', 'road', 'rail', 'flight', 'aircraft', 'automobile', 'transport', 'logistics', 'supply', 'container', 'drone', 'rocket', 'propellant', 'gps', 'harbor', 'bridge', 'canal']],
    ['Computing & AI', ['abacus', 'algorithm', 'computer', 'software', 'database', 'data_', 'cloud', 'virtualization', 'internet_protocol', 'microprocessor', 'semiconductor', 'transistor', 'integrated_circuit', 'ai', 'artificial_intelligence', 'machine_learning', 'deep_learning', 'language_model', 'neural', 'robotic_process', 'quantum_computing', 'vector_database', 'information-processing', 'calculation', 'automation', 'decision support']],
    ['Communication & Media', ['writing', 'paper', 'printing', 'book', 'library', 'postal', 'telegraph', 'telephone', 'radio', 'television', 'media', 'cinema', 'photography', 'web', 'internet', 'hypertext', 'social_media', 'communication', 'storytelling', 'publishing', 'signaling', 'cultural memory']],
    ['Medicine & Biology', ['medicine', 'medical', 'hospital', 'surgery', 'anatom', 'health', 'sanitation', 'vaccine', 'antibiotic', 'biology', 'gene', 'genetic', 'dna', 'rna', 'protein', 'cell', 'bio', 'pharma', 'drug', 'immunology', 'neuro', 'brain', 'sequencing']],
    ['Science & Mathematics', ['math', 'geometry', 'algebra', 'calculus', 'probability', 'statistics', 'astronomy', 'physics', 'chemistry', 'scientific', 'experiment', 'measurement', 'surveying', 'cartography', 'optics', 'microscope', 'telescope', 'clock', 'calendar']],
    ['Society & Governance', ['law', 'legal', 'govern', 'bureaucracy', 'democracy', 'state', 'city_state', 'public_', 'education', 'university', 'school', 'charter', 'police', 'military', 'warfare', 'rights', 'ethics', 'tax', 'census']],
    ['Finance & Commerce', ['barter', 'currency', 'coin', 'bank', 'finance', 'commerce', 'commercial', 'trade', 'merchant', 'credit', 'insurance', 'stock', 'capital', 'corporation', 'bookkeeping', 'accounting', 'market', 'retail', 'e-commerce', 'settlement']],
    ['Infrastructure & Cities', ['shelter', 'construction', 'infrastructure', 'built environment', 'masonry', 'architecture', 'concrete', 'urban', 'city', 'aqueduct', 'sewer', 'water_', 'water system', 'well', 'cistern', 'building', 'bridge', 'skyscraper', 'housing', 'public_works', 'municipal']],
    ['Security & Defense', ['weapon', 'war', 'military', 'armor', 'fortification', 'castle', 'missile', 'security', 'encryption', 'cryptography', 'zero_trust', 'cyber', 'surveillance', 'defense', 'ballistic', 'radar']],
    ['Space & Far Future', ['space', 'satellite', 'orbital', 'lunar', 'mars', 'asteroid', 'terraform', 'interstellar', 'interplanetary', 'dyson', 'antimatter', 'warp', 'starlifting', 'kardashev', 'future', 'immortality', 'post_labor']],
    ['Arts & Culture', ['art', 'artistic', 'cultural', 'music', 'theater', 'literature', 'myth', 'ritual', 'religion', 'philosophy', 'sculpture', 'painting', 'mosaic', 'heraldry', 'chivalry', 'storytelling']]
];

const generatedBranchNames = new Map([
    ['agriculture', 'Agriculture & Food'],
    ['materials', 'Materials & Manufacturing'],
    ['energy', 'Energy & Power'],
    ['transport', 'Transport & Logistics'],
    ['computing', 'Computing & AI'],
    ['media', 'Communication & Media'],
    ['medicine', 'Medicine & Biology'],
    ['science', 'Science & Mathematics'],
    ['governance', 'Society & Governance'],
    ['finance', 'Finance & Commerce'],
    ['infrastructure', 'Infrastructure & Cities'],
    ['security', 'Security & Defense'],
    ['space', 'Space & Far Future'],
    ['culture', 'Arts & Culture']
]);

function loadData() {
    return fs.readdirSync(DATA_DIR)
        .filter(isTechnologyDataFile)
        .sort()
        .flatMap(file => JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8')));
}

function classify(item) {
    const generatedMatch = item.id.match(/^(ancient|classical|medieval|renaissance|industrial|modern|future)_([a-z]+)_/);
    if (generatedMatch && generatedBranchNames.has(generatedMatch[2])) {
        return generatedBranchNames.get(generatedMatch[2]);
    }

    const text = `${item.id} ${item.name} ${item.description} ${(item.prerequisites || []).join(' ')}`.toLowerCase();
    let best = ['Other', 0];
    for (const [branch, terms] of branchRules) {
        const score = terms.reduce((sum, term) => sum + (text.includes(term) ? 1 : 0), 0);
        if (score > best[1]) best = [branch, score];
    }
    return best[0];
}

const data = loadData();
const eraTotals = Object.fromEntries(taxonomy.eras.map(era => [era, 0]));
const branchTotals = Object.fromEntries(taxonomy.branches.map(branch => [branch, 0]));
const matrix = Object.fromEntries(taxonomy.branches.map(branch => [
    branch,
    Object.fromEntries(taxonomy.eras.map(era => [era, 0]))
]));

for (const item of data) {
    const branch = classify(item);
    if (eraTotals[item.era] !== undefined) eraTotals[item.era] += 1;
    branchTotals[branch] = (branchTotals[branch] || 0) + 1;
    if (matrix[branch] && matrix[branch][item.era] !== undefined) matrix[branch][item.era] += 1;
}

console.log(`Total technologies: ${data.length}`);
console.log('\nEra totals:');
for (const era of taxonomy.eras) console.log(`- ${era}: ${eraTotals[era]}`);

console.log('\nBranch totals:');
for (const branch of taxonomy.branches) console.log(`- ${branch}: ${branchTotals[branch] || 0}`);

console.log('\nBranch x era matrix:');
console.log(['Branch', ...taxonomy.eras].join('\t'));
for (const branch of taxonomy.branches) {
    console.log([branch, ...taxonomy.eras.map(era => matrix[branch]?.[era] || 0)].join('\t'));
}

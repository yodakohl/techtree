const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const eraSlugs = new Set(['ancient', 'classical', 'medieval', 'renaissance', 'industrial', 'modern', 'future']);
const generatedPattern = /^(ancient|classical|medieval|renaissance|industrial|modern|future)_([a-z]+)_.+_\d{4}$/;

const eraFrame = {
    Ancient: 'Early communities developed',
    Classical: 'Complex states and cities developed',
    Medieval: 'Guilds, courts, monasteries, and towns developed',
    Renaissance: 'Workshops, merchants, navies, and scholars developed',
    Industrial: 'Factories, utilities, laboratories, and cities developed',
    Modern: 'Networked institutions and automated systems developed',
    Future: 'Advanced automated societies could develop'
};

const branchPurpose = {
    agriculture: 'food production, storage, and distribution',
    materials: 'fabrication, repair, and material quality',
    energy: 'heat, power, fuel use, and distribution',
    transport: 'movement of people, goods, and route information',
    computing: 'records, calculation, automation, and decision support',
    media: 'communication, publishing, signaling, and cultural memory',
    medicine: 'care delivery, diagnosis, prevention, and biological control',
    science: 'measurement, observation, modeling, and standards',
    governance: 'administration, law, public order, and coordination',
    finance: 'trade, accounting, risk, and settlement',
    infrastructure: 'built environments, water systems, and civic services',
    security: 'protection, detection, defense, and emergency response',
    space: 'orbital operations, planetary infrastructure, and exploration',
    culture: 'artistic production, ritual, education, and preservation'
};

const branchNoun = {
    agriculture: 'agricultural',
    materials: 'manufacturing',
    energy: 'energy',
    transport: 'transport',
    computing: 'information-processing',
    media: 'communication',
    medicine: 'medical',
    science: 'scientific',
    governance: 'administrative',
    finance: 'commercial',
    infrastructure: 'infrastructure',
    security: 'security',
    space: 'space',
    culture: 'cultural'
};

function cleanName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ');
}

function rootWord(value) {
    return String(value || '')
        .toLowerCase()
        .replace(/ying$/, 'y')
        .replace(/ing$/, '')
        .replace(/ed$/, '');
}

function dedupeProcessName(name) {
    const words = cleanName(name).split(' ');
    if (words.length < 3) return words.join(' ');
    const process = words[words.length - 1];
    const subjectLast = words[words.length - 2];
    if (rootWord(subjectLast) !== rootWord(process)) return words.join(' ');
    words.splice(words.length - 2, 1);
    return words.join(' ');
}

function dedupeCompoundProcessName(name) {
    return cleanName(name).replace(/\bHabitat Habitat Control\b/g, 'Habitat Control');
}

function improveName(item) {
    const normalized = dedupeCompoundProcessName(dedupeProcessName(item.name));
    if (!['Ancient', 'Classical', 'Medieval', 'Renaissance'].includes(item.era)) {
        return normalized;
    }
    return normalized
        .replace(/^Automated /, 'Organized ')
        .replace(/^Remote /, 'Outlying ')
        .replace(/^High Reliability /, 'Durable ');
}

function improveDescription(item, branch) {
    const opener = eraFrame[item.era] || 'People developed';
    const purpose = branchPurpose[branch] || 'specialized technical work';
    const noun = branchNoun[branch] || 'technical';
    return `${opener} ${cleanName(item.name).toLowerCase()} as a ${noun} practice for ${purpose}.`;
}

let improved = 0;
for (const eraSlug of eraSlugs) {
    const filePath = path.join(DATA_DIR, `${eraSlug}.json`);
    const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const item of items) {
        const match = item.id.match(generatedPattern);
        if (!match) continue;
        const branch = match[2];
        const nextName = improveName(item);
        const nextDescription = improveDescription(item, branch);
        if (item.name !== nextName) {
            item.name = nextName;
            improved += 1;
        }
        if (item.description !== nextDescription) {
            item.description = nextDescription;
            improved += 1;
        }
    }
    fs.writeFileSync(filePath, `${JSON.stringify(items, null, 2)}\n`);
}

console.log(`Improved descriptions for ${improved} generated technologies.`);

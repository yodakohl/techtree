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
    energy: 'energy-management',
    transport: 'transport',
    computing: 'information-processing',
    media: 'communication',
    medicine: 'medical',
    science: 'scientific',
    governance: 'administrative',
    finance: 'commercial',
    infrastructure: 'civic-infrastructure',
    security: 'security',
    space: 'space',
    culture: 'cultural'
};

const modifierPrefixes = [
    'High Reliability', 'High Throughput', 'High Capacity', 'Large Scale', 'Low Waste', 'Low Cost',
    'Field Ready', 'Standardized', 'Specialized', 'Distributed', 'Automated', 'Resilient',
    'Community', 'Regional', 'Adaptive', 'Portable', 'Modular', 'Precision', 'Redundant',
    'Continuous', 'Seasonal', 'Outlying', 'Organized', 'Regulated', 'Durable', 'Remote',
    'Sealed', 'Rapid', 'Open', 'Compact'
].sort((a, b) => b.length - a.length);

const knownActionSuffixes = [
    'Cross Referencing', 'Credit Rating', 'Risk Scoring', 'Habitat Control', 'Heat Recovery',
    'Standardization', 'Risk Review',
    'Standardizing', 'Preservation', 'Distribution', 'Registration', 'Reconciliation',
    'Fortification', 'Sterilization', 'Maintenance', 'Calibration', 'Observation',
    'Publication', 'Inspection', 'Measurement', 'Operations', 'Processing', 'Scheduling',
    'Cataloging', 'Compounding', 'Navigation', 'Reinforcement', 'Restoration', 'Signaling',
    'Screening', 'Treatment', 'Recording', 'Indexing', 'Tabulation', 'Archiving', 'Handling',
    'Hardening', 'Teaching', 'Mapping', 'Planning', 'Pricing', 'Clearing', 'Copying',
    'Routing', 'Loading', 'Casting', 'Finishing', 'Fabrication', 'Paving', 'Patrol', 'Audit',
    'Storage', 'Grading', 'Repair', 'Control', 'Metering', 'Drainage', 'Tracking', 'Shielding',
    'Recycling', 'Accounting', 'Performance', 'Operation',
    'Sorting', 'Drying', 'Watering', 'Breeding', 'Milling', 'Testing', 'Forging',
    'Weaving', 'Cutting', 'Polishing', 'Coating', 'Laminating', 'Annealing', 'Molding',
    'Machining', 'Generation', 'Conversion', 'Balancing', 'Ignition', 'Signaling',
    'Dispatch', 'Reasoning', 'Compression', 'Simulation', 'Training', 'Querying',
    'Orchestration', 'Monitoring', 'Optimization', 'Broadcasting', 'Captioning',
    'Publishing', 'Translation', 'Moderation', 'Diagnosis', 'Dosing', 'Triage',
    'Imaging', 'Therapy', 'Sequencing', 'Culturing', 'Measuring', 'Modeling',
    'Sampling', 'Observing', 'Forecasting', 'Computing', 'Licensing', 'Adjudication',
    'Reporting', 'Auditing', 'Credentialing', 'Coordination', 'Settlement',
    'Brokerage', 'Inventory', 'Exchange', 'Detection', 'Targeting', 'Authentication',
    'Drilling', 'Warning', 'Camouflage', 'Response', 'Launching', 'Docking', 'Mining',
    'Construction', 'Composition', 'Notation', 'Staging', 'Curation', 'Reproduction'
].sort((a, b) => b.length - a.length);

const branchActions = {
    agriculture: ['Processing', 'Storage', 'Grading', 'Preservation', 'Distribution'],
    materials: ['Fabrication', 'Finishing', 'Inspection', 'Repair', 'Casting'],
    energy: ['Operation', 'Control', 'Maintenance', 'Metering', 'Heat Recovery'],
    transport: ['Handling', 'Routing', 'Maintenance', 'Loading', 'Navigation'],
    computing: ['Recording', 'Indexing', 'Tabulation', 'Scheduling', 'Audit'],
    media: ['Cataloging', 'Publication', 'Archiving', 'Copying', 'Distribution'],
    medicine: ['Sterilization', 'Handling', 'Treatment', 'Screening', 'Recording'],
    science: ['Measurement', 'Calibration', 'Observation', 'Mapping', 'Standardization'],
    governance: ['Registration', 'Inspection', 'Coordination', 'Reporting', 'Planning'],
    finance: ['Accounting', 'Pricing', 'Clearing', 'Reconciliation', 'Risk Review'],
    infrastructure: ['Maintenance', 'Inspection', 'Drainage', 'Paving', 'Reinforcement'],
    security: ['Inspection', 'Patrol', 'Fortification', 'Signaling', 'Hardening'],
    space: ['Navigation', 'Tracking', 'Shielding', 'Operations', 'Recycling'],
    culture: ['Preservation', 'Performance', 'Cataloging', 'Restoration', 'Teaching']
};

function cleanName(name) {
    return String(name || '').trim().replace(/\s+/g, ' ');
}

function articleFor(value) {
    return /^[aeiou]/i.test(value) ? 'an' : 'a';
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

function splitGeneratedName(name) {
    let value = cleanName(name);
    let prefix = '';
    for (const candidate of modifierPrefixes) {
        if (value.startsWith(`${candidate} `)) {
            prefix = candidate;
            value = value.slice(candidate.length + 1);
            break;
        }
    }
    let stripped = true;
    while (stripped) {
        stripped = false;
        for (const suffix of knownActionSuffixes) {
            if (value === suffix) break;
            if (value.endsWith(` ${suffix}`)) {
                value = value.slice(0, -suffix.length - 1);
                stripped = true;
                break;
            }
        }
    }
    const words = value.split(' ');
    if (words.length > 1 && /ing$/i.test(words[words.length - 1])) {
        words.pop();
        value = words.join(' ');
    }
    return { prefix, subject: value };
}

function branchAction(branch, id) {
    const actions = branchActions[branch] || ['Operation'];
    const suffix = Number((id.match(/_(\d{4})$/) || [0, 0])[1]);
    return actions[suffix % actions.length];
}

function composeName(prefix, subject, action) {
    const subjectWords = cleanName(subject).split(' ').filter(Boolean);
    const actionWords = cleanName(action).split(' ').filter(Boolean);
    if (subjectWords.length && actionWords.length) {
        const subjectLast = subjectWords[subjectWords.length - 1];
        const actionFirst = actionWords[0];
        if (rootWord(subjectLast) === rootWord(actionFirst)) {
            subjectWords.pop();
        }
    }
    return [prefix, subjectWords.join(' '), action].filter(Boolean).join(' ');
}

function improveName(item, branch) {
    const normalized = dedupeCompoundProcessName(dedupeProcessName(item.name));
    const parts = splitGeneratedName(normalized);
    const baseName = composeName(parts.prefix, parts.subject, branchAction(branch, item.id));
    if (!['Ancient', 'Classical', 'Medieval', 'Renaissance'].includes(item.era)) {
        return baseName;
    }
    return baseName
        .replace(/^Automated /, 'Organized ')
        .replace(/^Remote /, 'Outlying ')
        .replace(/^High Reliability /, 'Durable ');
}

function improveDescription(item, branch, name) {
    const opener = eraFrame[item.era] || 'People developed';
    const purpose = branchPurpose[branch] || 'specialized technical work';
    const noun = branchNoun[branch] || 'technical';
    return `${opener} ${cleanName(name).toLowerCase()} as ${articleFor(noun)} ${noun} practice for ${purpose}.`;
}

let improved = 0;
for (const eraSlug of eraSlugs) {
    const filePath = path.join(DATA_DIR, `${eraSlug}.json`);
    const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    for (const item of items) {
        const match = item.id.match(generatedPattern);
        if (!match) continue;
        const branch = match[2];
        const nextName = improveName(item, branch);
        const nextDescription = improveDescription(item, branch, nextName);
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

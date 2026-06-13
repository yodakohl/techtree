#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isTechnologyDataFile } = require('./data-files');
const { getDependencyEdges } = require('./edge-schema');

const ROOT_DIR = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const TAXONOMY_FILE = path.join(DATA_DIR, 'taxonomy.json');
const QUALITY_SNAPSHOT_FILE = path.join(DATA_DIR, 'quality-snapshot.json');
const BASE_URL = 'https://pushme.site/techtree';
const DEFAULT_ERA_ORDER = [
  'Ancient',
  'Classical',
  'Medieval',
  'Renaissance',
  'Industrial',
  'Modern',
  'Future'
];
const PUBLIC_LINKS = {
  demo: 'https://pushme.site/techtree/demo.html',
  graph: 'https://pushme.site/techtree',
  sorted: 'https://pushme.site/techtree/sorted.html',
  repo: 'https://github.com/yodakohl/techtree',
  qualitySnapshot: 'https://github.com/yodakohl/techtree/blob/main/docs/QUALITY_SNAPSHOT.md',
};

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function readDataFiles() {
  return fs
    .readdirSync(DATA_DIR)
    .filter(isTechnologyDataFile)
    .sort((a, b) => a.localeCompare(b))
    .flatMap(file => {
      const full = path.join(DATA_DIR, file);
      const chunk = readJson(full);
      if (!Array.isArray(chunk)) {
        throw new Error(`${file} must contain a JSON array`);
      }
      return chunk.map(item => ({ ...item, __source_file: file }));
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function readTaxonomy() {
  return readJson(TAXONOMY_FILE);
}

function readQualitySnapshot() {
  return readJson(QUALITY_SNAPSHOT_FILE);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/&/g, '-')
    .replace(/\//g, '-')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function getEraOrder(eras) {
  if (!Array.isArray(eras) || !eras.length) {
    return DEFAULT_ERA_ORDER.slice();
  }
  return eras.slice();
}

function formatDatePrecision(value) {
  return String(value || 'unknown');
}

function getChecksum(content) {
  return crypto.createHash('sha1').update(content, 'utf8').digest('hex');
}

function relativeOutputPath(filePath, outputDir) {
  return path.relative(outputDir, filePath).split(path.sep).join('/');
}

function sourceList(sources = []) {
  if (!Array.isArray(sources) || !sources.length) {
    return '<p>No sources recorded.</p>';
  }

  const items = sources.map(source => {
    const href = source.url
      ? `<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title || source.url)}</a>`
      : escapeHtml(source.title || 'Source');
    const support = Array.isArray(source.supports)
      ? ` • Supports: ${source.supports.join(', ')}`
      : '';
    const locator = source.source_locator
      ? `<br/><small>Locator: ${escapeHtml(source.source_locator)}</small>`
      : '';
    return `<li>${href} (${escapeHtml(source.publisher || 'Unknown publisher')}, ${escapeHtml(source.year || 'n/a')}, ${escapeHtml(source.source_type || 'unknown')})${support}${locator}</li>`;
  });

  return `<ul>${items.join('')}</ul>`;
}

function canonicalTechnologyUrl(id) {
  return `${BASE_URL}/tech/${encodeURIComponent(id)}.html`;
}

function canonicalFieldUrl(fieldName) {
  return `${BASE_URL}/fields/${slugify(fieldName)}.html`;
}

function canonicalGraphUrl() {
  return `${PUBLIC_LINKS.graph}/`;
}

function renderSourceCheckedMetadata(item) {
  return [
    `<li><strong>ID:</strong> ${escapeHtml(item.id)}</li>`,
    `<li><strong>Era:</strong> ${escapeHtml(item.era)}</li>`,
    `<li><strong>First known date:</strong> ${escapeHtml(item.firstKnownDate)} (${formatDatePrecision(item.datePrecision)})</li>`,
    `<li><strong>Region:</strong> ${escapeHtml(item.region)}</li>`,
    `<li><strong>Review status:</strong> ${escapeHtml(item.reviewStatus || 'unknown')}</li>`,
    `<li><strong>Maturity:</strong> ${escapeHtml(item.maturity || 'N/A')}</li>`
  ].join('');
}

function renderDependencies(item, techById) {
  const dependencies = getDependencyEdges(item);
  if (!dependencies.length) {
    return '<p>None.</p>';
  }

  const rows = dependencies
    .map(edge => {
      const prereq = techById.get(edge.prerequisite);
      const prereqName = prereq ? prereq.name : edge.prerequisite;
      const href = canonicalTechnologyUrl(edge.prerequisite);
      return `<li><a href="${href}">${escapeHtml(prereqName)} (${escapeHtml(edge.prerequisite)})</a></li>`;
    })
    .sort((a, b) => a.localeCompare(b));

  return `<ul>${rows.join('')}</ul>`;
}

function renderDependenciesTable(item, techById) {
  const dependencies = getDependencyEdges(item);
  const rows = dependencies
    .map(edge => {
      const prereq = techById.get(edge.prerequisite);
      const prereqName = prereq ? prereq.name : edge.prerequisite;
      const prereqHref = canonicalTechnologyUrl(edge.prerequisite);
      const sourceSummary = sourceList(edge.sources || []);
      const confidence = typeof edge.confidence === 'number'
        ? `${Math.round(edge.confidence * 100)}%`
        : 'n/a';
      return `
            <tr>
              <td><a href="${prereqHref}">${escapeHtml(prereqName)}</a> (${escapeHtml(edge.prerequisite)})</td>
              <td>${escapeHtml(edge.type || 'enabling')}</td>
              <td>${escapeHtml(confidence)}</td>
              <td>${escapeHtml(edge.evidence_level || 'n/a')}</td>
              <td>${escapeHtml(edge.note || '')}</td>
              <td>${sourceSummary}</td>
            </tr>`;
    })
    .join('\n');

  if (!rows) {
    return '<tr><td colspan="6">No prerequisite edges recorded.</td></tr>';
  }

  return rows;
}

function renderDependents(dependents, techById) {
  if (!dependents.length) {
    return '<li>None.</li>';
  }

  return dependents
    .map(dependentId => {
      const depItem = techById.get(dependentId);
      const depName = depItem ? depItem.name : dependentId;
      return `<li><a href="${canonicalTechnologyUrl(dependentId)}">${escapeHtml(depName)} (${escapeHtml(dependentId)})</a></li>`;
    })
    .sort((a, b) => a.localeCompare(b))
    .join('');
}

function edgeEvidenceSummary(item) {
  const edges = getDependencyEdges(item);
  if (!edges.length) {
    return '<p>No prerequisite edge evidence is yet recorded.</p>';
  }

  let sourceRefs = 0;
  const evidenceByType = new Map();
  const confidenceValues = [];

  for (const edge of edges) {
    const bucket = edge.evidence_level || 'n/a';
    evidenceByType.set(bucket, (evidenceByType.get(bucket) || 0) + 1);
    if (typeof edge.confidence === 'number') {
      confidenceValues.push(edge.confidence);
    }
    if (Array.isArray(edge.sources)) {
      sourceRefs += edge.sources.length;
    }
  }

  const averageConfidence = confidenceValues.length
    ? `${Math.round((confidenceValues.reduce((sum, value) => sum + value, 0) / confidenceValues.length) * 100)}%`
    : 'n/a';

  const evidenceRows = Array.from(evidenceByType)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([type, count]) => `<li>${escapeHtml(type)}: ${count}</li>`)
    .join('');

  return `
    <p><strong>Edge/source evidence summary:</strong></p>
    <ul>
      <li>Prerequisite edges: ${edges.length}</li>
      <li>Average edge confidence: ${averageConfidence}</li>
      <li>Prerequisite sources: ${sourceRefs}</li>
      ${evidenceRows}
    </ul>`;
}

function renderTechHtml(item, techById, dependents) {
  const canonicalUrl = canonicalTechnologyUrl(item.id);
  const description = item.description || `${item.name} is a technology node in TechTree.`;
  const metaDescription = escapeHtml(description).slice(0, 300);
  const fieldLinks = (item.fields || []).map(field => `<li><a href="${canonicalFieldUrl(field)}">${escapeHtml(field)}</a></li>`).join('');
  const laneRows = (item.fields || [])
    .map(field => (item.fieldLanes && item.fieldLanes[field]
      ? `<li><strong>${escapeHtml(field)}:</strong> ${escapeHtml(item.fieldLanes[field])}</li>`
      : `<li><strong>${escapeHtml(field)}:</strong> General</li>`))
    .join('');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': canonicalUrl,
    name: item.name,
    description,
    identifier: item.id,
    inDefinedTermSet: `${BASE_URL}/`,
    url: canonicalUrl,
    dateCreated: String(item.firstKnownDate),
    sameAs: canonicalUrl
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(item.name)} - TechTree</title>
    <meta name="description" content="${metaDescription}" />
    <meta property="og:title" content="${escapeHtml(item.name)} - TechTree" />
    <meta property="og:description" content="${metaDescription}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${escapeHtml(item.name)} - TechTree" />
    <meta property="twitter:description" content="${metaDescription}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
      body { font-family: Arial, sans-serif; margin: 1.5rem; line-height: 1.5; color: #1f2937; }
      h1, h2 { margin: 1rem 0 0.5rem; }
      table { border-collapse: collapse; width: 100%; max-width: 100%; }
      th, td { border: 1px solid #ddd; padding: 0.4rem 0.5rem; vertical-align: top; }
      th { text-align: left; background: #f8fafc; }
      nav a { margin-right: 1rem; }
      ul { padding-left: 1.1rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(item.name)}</h1>
      <p>${escapeHtml(description)}</p>
      <nav>
        <a href="${canonicalGraphUrl()}?target=${encodeURIComponent(item.id)}">Graph</a>
        <a href="${PUBLIC_LINKS.sorted}?target=${encodeURIComponent(item.id)}">Sorted View</a>
        <a href="${PUBLIC_LINKS.demo}?target=${encodeURIComponent(item.id)}">Demo</a>
      </nav>

      <h2>Core metadata</h2>
      <ul>${renderSourceCheckedMetadata(item)}</ul>

      <h2>Prerequisites</h2>
      ${renderDependencies(item, techById)}

      <h2>Dependents</h2>
      <ul>${renderDependents(dependents, techById)}</ul>

      <h2>Fields</h2>
      <ul>${fieldLinks || '<li>None.</li>'}</ul>

      ${laneRows ? `<h2>Field lanes</h2><ul>${laneRows}</ul>` : ''}

      <h2>Node sources</h2>
      ${sourceList(item.sources)}

      <h2>Prerequisite edge evidence</h2>
      ${edgeEvidenceSummary(item)}

      <table>
        <thead>
          <tr>
            <th>Prerequisite</th>
            <th>Type</th>
            <th>Confidence</th>
            <th>Evidence level</th>
            <th>Note</th>
            <th>Sources</th>
          </tr>
        </thead>
        <tbody>
          ${renderDependenciesTable(item, techById)}
        </tbody>
      </table>

      <p><small>This page is generated from canonical era JSON and is indexable by URL.</small></p>
    </main>
  </body>
</html>`;
}

function buildFieldPage(fieldName, technologies, eraOrder) {
  const canonicalUrl = canonicalFieldUrl(fieldName);
  const description = `Technologies curated under the ${fieldName} field in TechTree.`;
  const safeEraOrder = getEraOrder(eraOrder);
  const eraIndex = new Map(safeEraOrder.map((era, i) => [era, i]));

  const byEra = new Map();
  for (const era of safeEraOrder) {
    byEra.set(era, []);
  }

  const sorted = technologies
    .slice()
    .sort((a, b) => {
      const aEra = eraIndex.has(a.era) ? eraIndex.get(a.era) : safeEraOrder.length + 1;
      const bEra = eraIndex.has(b.era) ? eraIndex.get(b.era) : safeEraOrder.length + 1;
      const eraDelta = aEra - bEra;
      if (eraDelta !== 0) return eraDelta;
      const aDate = Number.isFinite(Number(a.firstKnownDate)) ? Number(a.firstKnownDate) : Number.MAX_SAFE_INTEGER;
      const bDate = Number.isFinite(Number(b.firstKnownDate)) ? Number(b.firstKnownDate) : Number.MAX_SAFE_INTEGER;
      if (aDate !== bDate) return aDate - bDate;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

  for (const item of sorted) {
    const bucket = byEra.get(item.era) || [];
    bucket.push(item);
    byEra.set(item.era, bucket);
  }

  const sectionBlocks = [];
  for (const [era, items] of byEra.entries()) {
    if (!items.length) continue;
    const list = items
      .map(item => `<li><a href="${canonicalTechnologyUrl(item.id)}">${escapeHtml(item.name)} (${escapeHtml(item.id)})</a> — ${escapeHtml(item.firstKnownDate)} / ${escapeHtml(item.datePrecision || 'exact')}</li>`) 
      .join('');
    sectionBlocks.push(`<h2>${escapeHtml(era)}</h2><ul>${list}</ul>`);
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': canonicalUrl,
    name: `${fieldName} technologies`,
    description,
    url: canonicalUrl
  };

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(fieldName)} — TechTree</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:title" content="${escapeHtml(fieldName)} | TechTree" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="article" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:title" content="${escapeHtml(fieldName)} | TechTree" />
    <meta property="twitter:description" content="${escapeHtml(description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
    <style>
      body { font-family: Arial, sans-serif; margin: 1.5rem; line-height: 1.5; color: #1f2937; }
      h1, h2 { margin: 1rem 0 0.5rem; }
      nav a { margin-right: 1rem; }
      ul { padding-left: 1.1rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>${escapeHtml(fieldName)} field</h1>
      <p>${escapeHtml(description)}</p>
      <nav>
        <a href="${canonicalGraphUrl()}">Graph</a>
        <a href="${PUBLIC_LINKS.sorted}">Sorted View</a>
        <a href="${PUBLIC_LINKS.demo}">Demo</a>
      </nav>
      ${sectionBlocks.join('\n') || '<p>No technologies in this field yet.</p>'}
    </main>
  </body>
</html>`;
}

function generateSitemap(urls) {
  const rows = urls
    .sort()
    .map(url => `    <url>\n      <loc>${escapeHtml(url)}</loc>\n      <changefreq>weekly</changefreq>\n      <priority>0.7</priority>\n    </url>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
}

function metricByLabel(snapshot, label) {
  return (snapshot.metrics || []).find(entry => entry.label === label) || null;
}

function formatMetricLine(label, item) {
  if (!item) return null;
  if (item.denominator == null) {
    return `- ${label}: ${item.formatted}`;
  }
  if (item.note) {
    return `- ${label}: ${item.formatted} (${item.note})`;
  }
  return `- ${label}: ${item.formatted}`;
}

function buildLLms(snapshot, fieldPages, techById) {
  const lines = [
    '# TechTree',
    '',
    'TechTree is a source-backed human technology dependency graph for AI and human consumption. It supports evidence-aware exploration and stable public page URLs.',
    '',
    'Primary links:',
    ''
  ];
  lines.push(`- Demo: ${PUBLIC_LINKS.demo}`);
  lines.push(`- Graph: ${canonicalGraphUrl()}`);
  lines.push(`- Sorted: ${PUBLIC_LINKS.sorted}`);
  lines.push('- Technology entrypoint pattern: `https://pushme.site/techtree/tech/<id>.html` (example: `https://pushme.site/techtree/tech/crispr_gene_editing.html`)');
  lines.push('- Field entrypoint pattern: `https://pushme.site/techtree/fields/<slug>.html`');
  lines.push(`- Live GitHub repository: ${PUBLIC_LINKS.repo}`);
  lines.push(`- Data model: ${PUBLIC_LINKS.repo}/blob/main/data`);
  lines.push(`- Quality snapshot: ${PUBLIC_LINKS.qualitySnapshot}`);
  lines.push(`- Total technology pages: ${techById.size}`);
  lines.push(`- Total field pages: ${fieldPages.length}`);

  lines.push('', 'Current quality metrics (from data/quality-snapshot.json):');
  const metricNames = [
    'Technologies',
    'Source-checked nodes',
    'Nodes with node-level sources',
    'Dependency edges with edge-level sources',
    'Era-default placeholder dates',
    'Manual risk-weighted sample'
  ];
  for (const name of metricNames) {
    const metric = formatMetricLine(name, metricByLabel(snapshot, name));
    if (metric) lines.push(metric);
  }

  lines.push('', 'Example technology pages:');
  lines.push(`- CRISPR/Cas9: ${canonicalTechnologyUrl('crispr_gene_editing')}`);
  lines.push(`- RAG: ${canonicalTechnologyUrl('retrieval_augmented_generation')}`);
  lines.push(`- EUV lithography: ${canonicalTechnologyUrl('euv_lithography')}`);
  lines.push(`- Grid-scale battery storage: ${canonicalTechnologyUrl('grid_scale_battery_storage')}`);

  const sampleFields = fieldPages
    .slice(0, 8)
    .map(field => `- ${field.name}: ${canonicalFieldUrl(field.name)}`);
  lines.push('', 'Representative field pages:');
  if (sampleFields.length) {
    lines.push(...sampleFields);
  } else {
    lines.push('- None.');
  }

  return `${lines.join('\n')}\n`;
}

function buildOutputs({ outputDir = ROOT_DIR } = {}) {
  const technologies = readDataFiles();
  const taxonomy = readTaxonomy();
  const snapshot = readQualitySnapshot();

  const techById = new Map(technologies.map(item => [item.id, item]));
  const dependentsMap = new Map(technologies.map(item => [item.id, []]));
  for (const item of technologies) {
    for (const edge of getDependencyEdges(item)) {
      if (dependentsMap.has(edge.prerequisite)) {
        dependentsMap.get(edge.prerequisite).push(item.id);
      }
    }
  }
  for (const list of dependentsMap.values()) {
    list.sort();
  }

  const fieldMap = new Map();
  for (const item of technologies) {
    for (const field of item.fields || []) {
      if (!fieldMap.has(field)) {
        fieldMap.set(field, []);
      }
      fieldMap.get(field).push(item);
    }
  }

  const taxonomyFields = new Set(Object.keys((taxonomy || {}).fields || {}));
  const fieldPages = Array.from(new Set([...taxonomyFields, ...fieldMap.keys()]))
    .filter(field => fieldMap.has(field))
    .map(field => ({
      name: field,
      slug: slugify(field),
      technologies: fieldMap.get(field)
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const techDir = path.join(outputDir, 'tech');
  const fieldDir = path.join(outputDir, 'fields');
  const sitemapFile = path.join(outputDir, 'sitemap.xml');
  const llmsFile = path.join(outputDir, 'llms.txt');

  if (fs.existsSync(techDir)) fs.rmSync(techDir, { recursive: true, force: true });
  if (fs.existsSync(fieldDir)) fs.rmSync(fieldDir, { recursive: true, force: true });
  fs.mkdirSync(techDir, { recursive: true });
  fs.mkdirSync(fieldDir, { recursive: true });

  const manifest = new Map();
  const eraOrder = getEraOrder((taxonomy || {}).eras);

  for (const item of technologies) {
    const file = path.join(techDir, `${item.id}.html`);
    const content = renderTechHtml(item, techById, dependentsMap.get(item.id) || []);
    fs.writeFileSync(file, content);
    manifest.set(relativeOutputPath(file, outputDir), getChecksum(content));
  }

  for (const field of fieldPages) {
    const file = path.join(fieldDir, `${field.slug}.html`);
    const content = buildFieldPage(field.name, field.technologies, eraOrder);
    fs.writeFileSync(file, content);
    manifest.set(relativeOutputPath(file, outputDir), getChecksum(content));
  }

  const urls = [
    `${PUBLIC_LINKS.demo}`,
    `${canonicalGraphUrl()}`,
    `${PUBLIC_LINKS.sorted}`
  ];
  for (const item of technologies) {
    urls.push(canonicalTechnologyUrl(item.id));
  }
  for (const field of fieldPages) {
    urls.push(canonicalFieldUrl(field.name));
  }

  const sitemap = generateSitemap(urls);
  fs.writeFileSync(sitemapFile, sitemap);
  manifest.set(relativeOutputPath(sitemapFile, outputDir), getChecksum(sitemap));

  const llms = buildLLms(snapshot, fieldPages, techById);
  fs.writeFileSync(llmsFile, llms);
  manifest.set(relativeOutputPath(llmsFile, outputDir), getChecksum(llms));

  return {
    technologies,
    taxonomy,
    fieldPages,
    manifest,
    techDir,
    fieldDir,
    snapshot
  };
}

function runCli() {
  const args = process.argv.slice(2);
  const outDirArg = args.indexOf('--out-dir');
  const outputDir = outDirArg !== -1 && args[outDirArg + 1]
    ? path.resolve(process.cwd(), args[outDirArg + 1])
    : ROOT_DIR;

  const result = buildOutputs({ outputDir });
  console.log(`Generated ${result.technologies.length} technology pages in ${relativeOutputPath(result.techDir, outputDir)}`);
  console.log(`Generated ${result.fieldPages.length} field pages in ${relativeOutputPath(result.fieldDir, outputDir)}`);
}

if (require.main === module) {
  runCli();
}

module.exports = {
  buildOutputs,
  readDataFiles,
  readTaxonomy,
  readQualitySnapshot,
  slugify,
  getChecksum,
  canonicalTechnologyUrl,
  canonicalFieldUrl,
  canonicalGraphUrl,
  metricByLabel,
  relativeOutputPath,
  ROOT_DIR
};

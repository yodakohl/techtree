# Technology Expansion Runbook

Goal: add large numbers of technologies with minimum token and edit overhead while keeping the graph valid.

## Current State

- Canonical data files: `data/{ancient,classical,medieval,renaissance,industrial,modern,future}.json`
- Compact import sources: `data/expansion/*.tsv`
- Importer: `scripts/import-compact-tech.js`
- Generator for large balanced shards: `scripts/generate-10k-tech-shards.js`
- Generated-description repair: `scripts/improve-generated-tech-data.js`
- Current validated size after the second follow-up expansion: 21,401 technologies

## Compact Batch Format

Use one tab-separated row per technology:

```text
Era	id	Name	Description	prereq1,prereq2
```

Rules:

- Era must match `data/taxonomy.json`.
- ID must be lowercase snake_case.
- Keep descriptions one sentence.
- Prefer 2 prerequisites; use 1 for primitive nodes and 3 only when needed.
- Reuse existing IDs as anchors. Search with `rg '"id": "keyword' data`.
- It is OK for rows in the same TSV to depend on earlier or later rows in that TSV.

## Import Loop

```bash
node scripts/import-compact-tech.js data/expansion/human-tech-bulk-N.tsv
npm test
npm run coverage
```

If import fails:

1. Map missing prerequisite names to existing IDs with `rg`.
2. Patch only the TSV.
3. Rerun the importer.

The importer skips already-existing IDs, appends new JSON entries by era, rejects duplicate source IDs, invalid eras, missing prerequisites, and self-prerequisites. `npm test` then catches graph-wide issues and cycles.

## 10k Next-Turn Strategy

Do not try to reason about every row in prose. Generate compact TSV shards and let the importer/validator police structure.

The 10k expansion was generated with:

```bash
node scripts/generate-10k-tech-shards.js 10000 1000
for file in data/expansion/human-tech-10k-*.tsv; do node scripts/import-compact-tech.js "$file" || exit 1; done
npm test
npm run coverage
```

The first follow-up quality pass rewrote generated descriptions and added 5,000 more rows:

```bash
node scripts/improve-generated-tech-data.js
node scripts/generate-10k-tech-shards.js 5000 1000 human-tech-expanded-01
for file in data/expansion/human-tech-expanded-01-*.tsv; do node scripts/import-compact-tech.js "$file" || exit 1; done
npm test
npm run coverage
```

The second follow-up pass normalized pre-modern generated names, added generated branch-aware sorting/coverage, and added another 5,000 rows:

```bash
node scripts/improve-generated-tech-data.js
node scripts/generate-10k-tech-shards.js 5000 1000 human-tech-expanded-02 161
for file in data/expansion/human-tech-expanded-02-*.tsv; do node scripts/import-compact-tech.js "$file" || exit 1; done
npm test
npm run coverage
```

For another large expansion:

- Generate TSV shards rather than editing JSON.
- Balance rows across eras and branches instead of filling one era at a time.
- Use stable prerequisite anchor lists per era to reduce missing-ID repairs.
- Run an anachronism grep over generated TSVs before import.
- After import, run `npm test` and `npm run coverage`.

Suggested shard pattern:

```text
data/expansion/human-tech-10k-01.tsv
data/expansion/human-tech-10k-02.tsv
...
```

Token-efficient generation pattern:

1. Build rows directly as TSV, no bullets or explanations.
2. Use terse one-sentence descriptions.
3. Prefer existing broad anchors such as `agriculture`, `writing`, `construction`, `guilds`, `printing_press`, `steam_engine`, `electricity`, `computers_early`, `internet`, `synthetic_biology`, `quantum_computing`, and `space_colonization`.
4. Add domain clusters: tools, materials, food, transport, construction, medicine, measurement, communications, finance, governance, manufacturing, energy, computing, media, defense, science, household, infrastructure, environment, and space.
5. Commit only after validation passes.

## Publish Checklist

```bash
npm test
npm run coverage
git status --short
git add data scripts/import-compact-tech.js docs AGENTS.md
git commit -m "Expand technology coverage"
git push git@github.com:yodakohl/techtree.git HEAD:main
```

Restart the server when needed:

```bash
pkill -f "node server.js|npm start" || true
npm start
```

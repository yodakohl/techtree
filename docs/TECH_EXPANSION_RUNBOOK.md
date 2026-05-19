# Technology Expansion Runbook

Goal: add real, recognizable technologies with low edit overhead while keeping the graph valid. Do not add templated placeholder rows.

## Current State

- Canonical data files: `data/{ancient,classical,medieval,renaissance,industrial,modern,future}.json`
- Curated compact import sources: `data/expansion/human-tech-bulk*.tsv`
- Importer: `scripts/import-compact-tech.js`
- Quality audit: `scripts/audit-data-quality.js`
- Generated placeholder cleanup: `scripts/prune-generated-tech-data.js`
- Current validated size after AI/ML vertical pass: 1,478 curated technologies
- First textbook-quality vertical: `Genome Editing / CRISPR-Cas`
- Second textbook-quality vertical: `Semiconductors & Integrated Circuits`
- Third textbook-quality vertical: `Artificial Intelligence & Machine Learning`

## Retired Approach

The old `human-tech-10k-*` and `human-tech-expanded-*` generated shards were removed. They produced structurally valid but semantically weak entries such as "Sealed Patient Register Handling". Do not recreate that workflow.

Avoid rows that are only combinations of:

- vague modifier + object + generic action
- organization process names that are not recognized technologies
- repeated variants of the same subject across eras
- descriptions that say a society "developed X as a practice" without naming a concrete artifact, method, institution, or system

## Compact Batch Format

Use one tab-separated row per technology:

```text
Era	id	Name	Description	prereq1,prereq2
```

Rules:

- Era must match `data/taxonomy.json`.
- ID must be lowercase snake_case.
- Name should be a recognizable technology, method, infrastructure, institution, tool, material, or system.
- Keep descriptions one sentence and concrete.
- Prefer 2 prerequisites; use 1 for primitive nodes and 3 only when needed.
- Reuse existing IDs as anchors. Search with `rg '"id": "keyword' data`.
- It is OK for rows in the same TSV to depend on earlier or later rows in that TSV.

## Import Loop

```bash
node scripts/import-compact-tech.js data/expansion/human-tech-bulk-N.tsv
npm test
npm run quality
npm run coverage
```

If import fails:

1. Map missing prerequisite names to existing IDs with `rg`.
2. Patch only the TSV.
3. Rerun the importer.

The importer skips already-existing IDs, appends new JSON entries by era, rejects duplicate source IDs, invalid eras, missing prerequisites, and self-prerequisites. `npm test` then catches graph-wide issues and cycles.

## Manual Review Standard

Before import, sample rows from every era in the TSV and ask:

- Would a knowledgeable reader recognize this as a real technology or historically meaningful practice?
- Is the name specific enough to search for or explain?
- Does the description identify what the thing is, not just a generic operational function?
- Is the era plausible?
- Are prerequisites earlier or contemporaneous enabling technologies?
- If the row belongs to a textbook-quality field, does it include `fields`, `fieldLanes`, `maturity`, and cited `sources`?
- If the row is a forecast, does it include roadmap timeframe, confidence, blockers, and rationale?

After import, run:

```bash
npm test
npm run quality
npm run coverage
```

Also run targeted searches for suspicious generated language:

```bash
rg '_0[0-9]{3}| Handling"| Screening"| Recording"| Sterilization"| developed .* as a .* practice' data/*.json
```

## Publish Checklist

```bash
npm test
npm run quality
npm run coverage
git status --short
git add data data/expansion docs scripts README.md package.json
git commit -m "Improve technology data quality"
git push git@github.com:yodakohl/techtree.git HEAD:main
```

Restart the server when needed:

```bash
pkill -f "node server.js|npm start" || true
npm start
```

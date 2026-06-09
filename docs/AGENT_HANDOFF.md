# Agent Handoff

Use this file to avoid spending tokens rediscovering the project.

## First Command

```bash
npm run agent:brief
```

It prints branch status, latest commit, quality snapshot metrics, the current accuracy-risk queue, and the shortest validation command list.

## Repo Shape

- Canonical data: `data/{ancient,classical,medieval,renaissance,industrial,modern,future}.json`
- Demo UI: `demo.html`, `demo.js`, `style.css`
- Graph UI: `index.html`, `app.js`, `vendor/vis-network.min.js`
- Sorted UI: `sorted.html`, `sorted.js`
- Server/API: `server.js`
- Quality scripts: `scripts/validate-data.js`, `scripts/audit-temporal-consistency.js`, `scripts/audit-data-quality.js`
- Receipts/invariants: `docs/edge-change-receipts/`, `docs/graph-invariants/`

## Token-Saving Rules

- Do not read whole data files unless absolutely necessary; use `rg '"id": "node_id"' data/*.json`, `npm run node-packet -- <id>`, or short Node snippets.
- Use `npm run agent:brief` and `docs/QUALITY_SNAPSHOT.md` instead of recomputing context manually.
- For UI work, read only the relevant view files and run `node --check` on changed JS.
- For data quality work, fix a small queue of high-risk nodes from `npm run accuracy:risks`; do not expand the dataset while chronology or edge-semantics debt is the active ask.
- For bulk additions, use compact TSV plus `scripts/import-compact-tech.js`; never generate vague templated technologies.
- Document semantic edge removals with an edge-change receipt and graph invariant.

## Common Validation

```bash
npm test
npm run quality
npm run coverage
git diff --check
```

For field source checks:

```bash
npm run source-urls -- --field "Genome Editing / CRISPR-Cas"
```

## Publish

```bash
git status --short
git add <changed files>
git commit -m "<concise change>"
git push origin HEAD:main
```

Restart local demo when needed:

```bash
pkill -f "node server.js|npm start" || true
npm start
```

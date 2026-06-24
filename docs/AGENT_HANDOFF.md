# Agent Handoff

Use this file to avoid spending tokens rediscovering the project.

## First Command

```bash
npm run agent:brief
```

It prints branch status, latest commit, quality snapshot metrics, the current pre-Future accuracy-risk queue, and the shortest validation command list.

For the next launch-readiness target with packet/setup commands:

```bash
npm run agent:next
```

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
- Use `npm run agent:next` when the accuracy queue is empty or too broad; it ranks remaining pre-Future placeholder-date, node-source, edge-source, and review-status debt and prints the packet/snapshot/check commands for the top target.
- After edits, run `npm run agent:check` to see the minimal validation plan for changed files. Use `npm run agent:check -- --run` to execute that targeted plan once.
- Keep a validation ledger mentally: if no files changed after a command passed, do not rerun it. Rerun only checks affected by later edits.
- For UI work, read only the relevant view files and run `node --check` on changed JS.
- For data quality work, fix a small queue of high-risk pre-Future nodes from `npm run accuracy:risks`; do not expand the dataset while chronology or edge-semantics debt is the active ask.
- Future-era forecast nodes are not launch-quality debt. Keep them structurally valid, but do not spend quality-audit time making them source checked, perfectly dated, or fully edge-sourced unless the user explicitly asks for Future roadmap curation.
- For bulk additions, use compact TSV plus `scripts/import-compact-tech.js`; never generate vague templated technologies.
- Document semantic edge removals with an edge-change receipt and graph invariant.

## Changed-File Validation

```bash
npm run agent:check
npm run agent:check -- --run
```

This planner reads the current git diff and recommends only checks that match touched files: JS syntax checks for changed JS, receipt audits for receipt changes, trust audit for trust-rule changes, snapshot checks for generated quality files, and data/quality gates only when data or audit tooling changed.

## Final Validation

Run this once before commit/push for non-trivial changes, not after every small edit:

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

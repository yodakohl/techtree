# Agent Notes

Start with `npm run agent:brief` to get the compact repo state, current quality metrics, next accuracy queue, and validation commands without rereading long docs or JSON files.

For larger curation passes, start with `npm run agent:batch`; use `-- --focus chronology|edges|node-evidence|review-status|source-fit --limit 8` to keep a batch homogeneous. `source-fit` is a review heuristic, not a quality gate.

After edits, run `npm run agent:ready`. It refreshes only stale generated artifacts, then runs independent changed-file checks concurrently. Use `npm run agent:check` when you only want to preview the plan. Run any additional full final gate that the plan does not cover once before committing.

For token-efficient project context, read `docs/AGENT_HANDOFF.md`.

For large technology-data expansions, read `docs/TECH_EXPANSION_RUNBOOK.md` first.

Use compact TSV batches plus `scripts/import-compact-tech.js`; do not hand-edit the era JSON for bulk additions. After importing, run `npm test` and `npm run coverage`, restart `npm start` if the live server must reflect new data, then commit and push.

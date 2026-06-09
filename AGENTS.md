# Agent Notes

Start with `npm run agent:brief` to get the compact repo state, current quality metrics, next accuracy queue, and validation commands without rereading long docs or JSON files.

For token-efficient project context, read `docs/AGENT_HANDOFF.md`.

For large technology-data expansions, read `docs/TECH_EXPANSION_RUNBOOK.md` first.

Use compact TSV batches plus `scripts/import-compact-tech.js`; do not hand-edit the era JSON for bulk additions. After importing, run `npm test` and `npm run coverage`, restart `npm start` if the live server must reflect new data, then commit and push.

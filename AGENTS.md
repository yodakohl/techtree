# Agent Notes

For large technology-data expansions, read `docs/TECH_EXPANSION_RUNBOOK.md` first.

Use compact TSV batches plus `scripts/import-compact-tech.js`; do not hand-edit the era JSON for bulk additions. After importing, run `npm test` and `npm run coverage`, restart `npm start` if the live server must reflect new data, then commit and push.

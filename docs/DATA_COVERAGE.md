# Data Coverage

The tech tree is intended to be broad, navigable, and useful rather than perfectly exhaustive. Human technology has no closed canonical list, so coverage is managed through validation, taxonomy, and iterative gap-filling.

## Current Coverage Model

Technologies are organized by era and connected by prerequisites. The compact sorted view also derives branches and field lenses for practical browsing.

Primary branches:

- Agriculture & Food
- Materials & Manufacturing
- Energy & Power
- Transport & Logistics
- Computing & AI
- Communication & Media
- Medicine & Biology
- Science & Mathematics
- Society & Governance
- Finance & Commerce
- Infrastructure & Cities
- Security & Defense
- Space & Far Future
- Arts & Culture

Field lenses currently supported:

- Mechanical Engineering
- Finance & Markets
- Genome Editing / CRISPR-Cas
- Semiconductors & Integrated Circuits
- Artificial Intelligence & Machine Learning

## Validation Standard

Run:

```bash
npm test
npm run quality
```

This checks required fields, duplicate IDs, missing prerequisites, invalid eras, file/era mismatches, cyclic prerequisite groups, generated placeholder rows, duplicate display names, metadata validity, cited textbook-quality field entries, forecast roadmaps, and technologies that use modern or future-only terminology before the era where it belongs.

## Coverage Audit

Run:

```bash
npm run coverage
```

This prints era totals and branch-by-era counts. Low or zero cells identify obvious places to add more technologies.

## Large Expansions

For bulk additions, use the compact TSV workflow in [Technology Expansion Runbook](TECH_EXPANSION_RUNBOOK.md). It is much cheaper and safer than hand-editing era JSON directly.

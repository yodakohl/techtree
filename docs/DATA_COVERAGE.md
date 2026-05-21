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
- Energy Systems & Grid
- Spaceflight & Satellites
- Robotics & Autonomous Systems
- Medical Imaging & Diagnostics
- Climate & Environmental Systems
- Agriculture & Food Systems
- Cybersecurity & Cryptography
- Transportation & Logistics
- Materials Science & Manufacturing

## Validation Standard

Run:

```bash
npm test
npm run quality
```

This checks required fields, typed dependency-edge metadata, duplicate IDs, missing prerequisites, invalid eras, file/era mismatches, cyclic prerequisite groups, generated placeholder rows, duplicate display names, metadata validity, cited textbook-quality field entries, forecast roadmaps, technologies that use modern or future-only terminology before the era where it belongs, and temporal edge consistency.

Every dependency edge now carries:

- `type`: `required`, `enabling`, `accelerates`, `historical_predecessor`, `common_dependency`, `commercial_or_scaling_dependency`, or `speculative`
- `confidence`: numeric 0.0-1.0
- `evidence_level`: primary/review/textbook/expert/weak/speculative evidence class
- `note`: a short explanation for the edge
- `reviewStatus`: generated, structurally validated, source checked, domain reviewed, or disputed

Every node has `firstKnownDate`, `datePrecision`, `region`, and `reviewStatus`. `prerequisites` remains as a compatibility mirror, but `dependencyEdges` is the authoritative relationship model.

## Coverage Audit

Run:

```bash
npm run coverage
```

This prints era totals and branch-by-era counts. Low or zero cells identify obvious places to add more technologies.

## Large Expansions

For bulk additions, use the compact TSV workflow in [Technology Expansion Runbook](TECH_EXPANSION_RUNBOOK.md). It is much cheaper and safer than hand-editing era JSON directly.

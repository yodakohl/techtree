# TechTree

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-43853d.svg)](https://nodejs.org/)
[![Dataset](https://img.shields.io/badge/technologies-1661-6f42c1.svg)](data/)
[![Validation](https://img.shields.io/badge/data-validated-brightgreen.svg)](scripts/validate-data.js)
[![Data Quality](https://github.com/yodakohl/techtree/actions/workflows/data-quality.yml/badge.svg)](https://github.com/yodakohl/techtree/actions/workflows/data-quality.yml)

**TechTree is a source-backed map of human technology: see what a technology depends on, what it unlocks, and what likely comes next.**

[Live Demo](https://pushme.site/techtree/demo.html) · [CRISPR Target Trace](https://pushme.site/techtree/demo.html?field=Genome%20Editing%20%2F%20CRISPR-Cas&target=crispr_gene_editing#tech-crispr_gene_editing) · [Graph View](https://pushme.site/techtree/) · [Sorted View](https://pushme.site/techtree/sorted.html) · [Agent Entry](llms.txt)

Every technology now has a stable public URL at:

- https://pushme.site/techtree/tech/`<id>`.html
- https://pushme.site/techtree/fields/`<slug>`.html

Example entry points:

- CRISPR/Cas9: https://pushme.site/techtree/tech/crispr_gene_editing.html
- Retrieval-Augmented Generation: https://pushme.site/techtree/tech/retrieval_augmented_generation.html
- EUV lithography: https://pushme.site/techtree/tech/euv_lithography.html
- Grid-scale battery storage: https://pushme.site/techtree/tech/grid_scale_battery_storage.html

| In 10 seconds | Why it matters |
| --- | --- |
| **Try the demo** | Opens on CRISPR/Cas9 and traces the prerequisite stack needed to reach a target technology. |
| **Inspect evidence** | Dependencies are typed and include confidence, evidence level, notes, and sources where available. |
| **Use the data** | **1,661 validated technologies** across history, modern science, infrastructure, and future roadmap fields. |
| **Check accuracy** | Corrective sample: **40/40 claims pass after correction**; latest risk-queue sample found civic/admin data needing fixes. See [accuracy audit](docs/ACCURACY_SAMPLE_2026-06-06.md) and [risk sample](docs/MANUAL_ACCURACY_SAMPLE_CIVIC_ADMIN_2026-06-10.md). |
| **Improve one edge** | Small PRs can correct one dependency/source; validation catches missing IDs, cycles, duplicates, and time-travel edges. |

<!-- QUALITY_SNAPSHOT_START -->
## Quality Snapshot

Generated 2026-06-14 from the same dataset audit used by `npm run accuracy:risks`. This is a trust snapshot, not proof of global accuracy.

| Metric | Current |
| --- | --- |
| Technologies | 1,659 |
| Source-checked nodes | 883 / 1,659 (53.2%) |
| Nodes with node-level sources | 893 / 1,659 (53.8%) |
| Dependency edges with edge-level sources | 4,015 / 5,461 (73.5%) |
| Era-default placeholder dates | 438 / 1,659 (26.4%) |
| Manual risk-weighted sample | 40 / 40 (passed after correction) |

Full generated snapshot: [docs/QUALITY_SNAPSHOT.md](docs/QUALITY_SNAPSHOT.md).
<!-- QUALITY_SNAPSHOT_END -->

TechTree is built as public-good infrastructure for researchers, builders, educators, and AI agents that need a trustworthy technology-dependency graph instead of a plausible list of inventions.

![techtree](https://github.com/user-attachments/assets/e189ec5e-6124-4d2d-9521-434d65a7df01)

## What You Can Do

- Trace prerequisites and downstream unlocks for a technology.
- Open a target-trace demo that shows prerequisite stacks, roadmap candidates, and evidence for connected technologies.
- Explore compact subfield maps for CRISPR, semiconductors, AI/ML, energy, mechanical engineering, civil infrastructure, finance/markets, spaceflight, robotics, diagnostics, climate, agriculture, cybersecurity, transportation, materials, telecommunications, water/sanitation, and pharmaceutical drug development.
- Compare technologies across Ancient, Classical, Medieval, Renaissance, Industrial, Modern, and Future eras.
- Use the validated JSON data as a knowledge graph seed for research, education, simulations, or AI tools.
- Add new technologies safely with prerequisite validation, duplicate checks, cycle detection, and quality audits.

## Views

- **Graph View**: a Vis Network dependency graph with search, era and field filtering, focused dependency context, source metadata, and editable entries.
- **Sorted View**: a compact branch/table browser for scanning technologies by era, dependency depth, branch, field lens, maturity, and roadmap status.
- **Demo View**: a target-focused dashboard that opens directly on CRISPR/Cas9 and shows what had to exist to reach a selected technology, plus lane maps, likely next technologies, dependency confidence, and sources.

## Quick Start

Requirements:

- [Node.js](https://nodejs.org/) 18 or newer

Install dependencies and start the local server:

```bash
npm install
npm start
```

Build and validate generated public pages:

```bash
npm run build:public
npm run check:public
```

Open:

- Demo view: `http://localhost:3000/demo.html`
- Graph view: `http://localhost:3000`
- Sorted view: `http://localhost:3000/sorted.html`

The server listens on port `3000` by default. Use `PORT` to run on a different port:

```bash
PORT=8080 npm start
```

For a browse-only deployment, disable write operations:

```bash
TECHTREE_READ_ONLY=true npm start
```

## Features

- Search technologies by name or ID.
- Filter the graph by era or curated field lens.
- Focus the graph around selected technologies and their direct dependency context.
- Inspect prerequisites and unlocks from the side panel.
- Add, edit, or delete technologies when not running in read-only mode.
- Browse a compact sorted view grouped by derived technology branches.
- Present a concise target-trace demo for researchers, contributors, and reviewers.
- Use field lenses for focused exploration, including mechanical engineering, finance/markets, genome editing, semiconductor technology, AI/ML, energy systems, spaceflight, robotics, diagnostics, climate, agriculture, cybersecurity, transportation, materials, telecommunications, water/sanitation, and pharmaceuticals/drug development.
- Explore cited CRISPR/Cas9, semiconductor/integrated-circuit, AI/ML, energy/grid, spaceflight/satellite, robotics/autonomy, medical diagnostics, climate/environment, agriculture/food, cybersecurity/cryptography, transportation/logistics, materials/manufacturing, telecommunications/networking, water/sanitation, and pharmaceuticals/drug-development verticals, plus newly curated mechanical-engineering, civil-infrastructure, and finance/markets lenses with source-checked core chronology fixes.

## Curated Field Lenses

| Field lens | Purpose |
| --- | --- |
| Genome Editing / CRISPR-Cas | Trace CRISPR foundations, editing platforms, delivery, safety assays, therapeutics, and likely next steps. |
| Semiconductors & Integrated Circuits | Explore the chip stack from semiconductors and transistors through lithography, EDA, memory, accelerators, packaging, and roadmap nodes. |
| Artificial Intelligence & Machine Learning | Navigate symbolic AI, classical ML, neural networks, foundation models, MLOps, evaluation, alignment, and agentic roadmap technologies. |
| Energy Systems & Grid | Connect generation, transmission, storage, renewables, nuclear/fusion, microgrids, and long-duration storage. |
| Mechanical Engineering | Follow simple machines, gears, clocks, pumps, engines, machine tools, assembly lines, CAD/CAM, numerical control, and automation. |
| Civil Engineering & Built Environment | Connect construction materials, structural systems, roads, bridges, aqueducts, sewers, high-rises, urban codes, and construction roadmaps. |
| Finance & Markets | Trace money, accounting, banking, exchanges, insurance, derivatives, digital wallets, cryptocurrency, CBDC pilots, and programmable-money roadmaps. |
| Spaceflight & Satellites | Follow launch vehicles, spacecraft systems, satellites, GPS, space science, and on-orbit servicing. |
| Robotics & Autonomous Systems | Explore manipulation, mobile robots, perception, industrial automation, medical robots, autonomy, and safety. |
| Medical Imaging & Diagnostics | Connect X-rays, CT, MRI, ultrasound, PET, laboratory diagnostics, point-of-care testing, and AI diagnostic support. |
| Climate & Environmental Systems | Map climate measurement, pollution control, water/waste systems, climate modeling, mitigation, adaptation, and ecosystem monitoring. |
| Agriculture & Food Systems | Trace mechanization, fertilizers, breeding, irrigation, controlled environments, supply chains, and digital agriculture. |
| Cybersecurity & Cryptography | Connect public-key cryptography, identity, TLS, firewalls, detection, response, zero trust, and post-quantum migration. |
| Transportation & Logistics | Follow road, rail, aviation, container shipping, intermodal freight, warehousing, cold chains, routing, and autonomous freight. |
| Materials Science & Manufacturing | Trace metals, polymers, ceramics, composites, nanomaterials, additive manufacturing, materials informatics, and advanced materials roadmaps. |
| Telecommunications & Networking | Follow telegraph, telephone, radio, fiber, packet switching, internet protocols, routing, cellular networks, broadband access, and 6G roadmap nodes. |
| Water & Sanitation Systems | Connect wells, cisterns, sewers, aqueducts, municipal treatment, chlorination, wastewater, membranes, reuse, smart water networks, and desalination roadmaps. |
| Pharmaceuticals & Drug Development | Trace pharmacy, pharmacology, trials, GMP, small-molecule discovery, biologics, delivery, pharmacovigilance, real-world evidence, and AI drug-discovery roadmaps. |

## Data Model

Canonical technology data lives in:

```text
data/ancient.json
data/classical.json
data/medieval.json
data/renaissance.json
data/industrial.json
data/modern.json
data/future.json
```

Each technology entry uses canonical node metadata and typed dependency edges.
`prerequisites` is kept as a compatibility mirror of `dependencyEdges[*].prerequisite`.

```json
{
  "id": "printing_press",
  "name": "Printing Press",
  "era": "Renaissance",
  "description": "A mechanical device using movable metal type to transfer ink to paper.",
  "firstKnownDate": 1450,
  "datePrecision": "decade",
  "region": "Mainz, Holy Roman Empire / Germany",
  "reviewStatus": "source_checked",
  "prerequisites": ["paper_making"],
  "dependencyEdges": [
    {
      "prerequisite": "paper_making",
      "type": "commercial_or_scaling_dependency",
      "confidence": 0.78,
      "evidence_level": "expert_inference",
      "note": "Mass book printing scaled on paper supply, even though Gutenberg also printed vellum copies.",
      "reviewStatus": "source_checked",
      "sources": [
        {
          "title": "Gutenberg Bible",
          "url": "https://www.loc.gov/item/2021666734",
          "publisher": "Library of Congress",
          "year": 2021,
          "source_type": "official_agency",
          "supports": ["node", "edge"]
        }
      ]
    }
  ],
  "sources": [
    {
      "title": "Gutenberg Bible",
      "url": "https://www.loc.gov/item/2021666734",
      "publisher": "Library of Congress",
      "year": 2021,
      "source_type": "official_agency",
      "supports": ["node"]
    }
  ]
}
```

Curated field entries may add field-lens, maturity, and roadmap metadata:

```json
{
  "id": "crispr_gene_editing",
  "name": "CRISPR-Cas9 Genome Editing",
  "era": "Modern",
  "description": "Programmable genome editing with Cas9 and guide RNAs.",
  "firstKnownDate": 2013,
  "datePrecision": "exact",
  "region": "Global molecular biology research",
  "reviewStatus": "source_checked",
  "fields": ["Genome Editing / CRISPR-Cas"],
  "fieldLanes": {
    "Genome Editing / CRISPR-Cas": "Editing Platforms"
  },
  "maturity": "established",
  "sources": [
    {
      "title": "Multiplex Genome Engineering Using CRISPR/Cas Systems",
      "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC3795411/",
      "publisher": "Science / PubMed Central",
      "year": 2013,
      "source_type": "primary_paper",
      "supports": ["node", "maturity"]
    }
  ]
}
```

Rules:

- `id` values must be unique lowercase identifiers.
- `era` must match the file where the technology is stored.
- `dependencyEdges` must contain typed semantic dependency objects; `prerequisites` is kept as a compatibility mirror of those edge targets.
- The prerequisite graph must remain acyclic.
- Every node must include `firstKnownDate`, `datePrecision`, `region`, and `reviewStatus`.
- Every dependency edge must include `type`, `confidence`, `evidence_level`, `note`, and `reviewStatus`.
- Node and edge sources carry `source_type` and `supports` metadata so generic overviews do not get treated like primary evidence.
- Curated field nodes may include `fields`, `fieldLanes`, `maturity`, `sources`, and `roadmap` metadata.
- Textbook-quality field nodes in CRISPR/Cas9, semiconductors, AI/ML, energy/grid, spaceflight/satellites, robotics/autonomy, medical diagnostics, climate/environment, agriculture/food, cybersecurity/cryptography, transportation/logistics, materials/manufacturing, telecommunications/networking, water/sanitation, and pharmaceuticals/drug development require cited sources.
- Forecast technologies must include roadmap rationale, timeframe, confidence, and blockers.

The sorted view derives branches from IDs, names, and descriptions. See [Data Coverage](docs/DATA_COVERAGE.md) for the current branch model.

## Agent Contributions

TechTree accepts small source-backed corrections from AI agents and MoltBook
review threads. See [Agent Contributions](docs/AGENT_CONTRIBUTIONS.md) for
accepted external prompts, corrected claims, sources, and validation receipts.
To contribute useful changes, pick one task from the
[Edge Review Queue](docs/EDGE_REVIEW_QUEUE.md), follow the compact
[One-Edge PR Guide](docs/ONE_EDGE_PR_GUIDE.md) for edge fixes, or generate a
node-scope packet with `npm run node-packet -- <node_id> --issue <number>` for
overloaded nodes. For broad-node fixes, capture before/after behavior with
`npm run node-snapshot` and compare it with `npm run node-snapshot-diff` so
caption-only changes do not pass as semantic fixes. Then use the broader workflow in
[Contributing](CONTRIBUTING.md) and the edge-type rules in
[Edge Review Playbook](docs/EDGE_REVIEW_PLAYBOOK.md). The review bar is
adversarial: see [Adversarial Edge Review](docs/ADVERSARIAL_EDGE_REVIEW.md).
If opening a PR is too much friction, send a
[source-locator contribution](docs/SOURCE_LOCATOR_CONTRIBUTIONS.md) first.

Fastest useful PR path:

1. Pick one open starter issue from the queue.
2. Change exactly one edge, one source, and one receipt.
3. Run `npm run edge-receipts && npm test && npm run quality && npm run coverage`.
4. Open the PR with the old claim, new claim, source locator, invariant, and validation output.

## Validation

Run the validator before committing data changes:

```bash
npm test
```

The validator checks required fields, typed dependency-edge metadata, duplicate IDs, invalid eras, era/file mismatches, missing prerequisites, self-prerequisites, and dependency cycles. `npm test` also runs the temporal audit, which rejects earlier-era nodes depending on later-era nodes, Modern nodes depending on Future nodes, and edges where the prerequisite has a later `firstKnownDate`.

Run the data-quality audit to catch generated placeholder rows, duplicate display names, weak source metadata, overconfident weak-inference edges, semantic edge-change receipts, and technologies that use modern or future-only terminology too early:

```bash
npm run quality
```

Inspect dataset balance with:

```bash
npm run coverage
```

Coverage reports era totals and branch-by-era counts. Use it to identify underrepresented areas before large additions.

Publish an informational accuracy-risk report to choose the next manual review sample:

```bash
npm run accuracy:risks
npm run accuracy:risks -- --markdown --limit 20
```

The latest baseline is [Accuracy Risk Report 2026-06-07](docs/ACCURACY_RISK_REPORT_2026-06-07.md).

For source-heavy changes, run the optional network URL audit:

```bash
npm run source-urls -- --field "Telecommunications & Networking"
npm run source-urls -- --field "Water & Sanitation Systems"
npm run source-urls -- --field "Pharmaceuticals & Drug Development"
```

This checks cited source URLs and fails on 404 or 5xx responses. It is kept separate from offline validation because it depends on network availability.

GitHub Actions runs the offline data-quality workflow on every push and pull request. The source URL audit runs weekly and can also be triggered manually from the Actions tab.

## Expanding the Dataset

For small edits, update the relevant era JSON directly and run `npm test`.

For large expansions, use compact TSV sources in `data/expansion/` and import them into the canonical era files:

```bash
node scripts/import-compact-tech.js data/expansion/example.tsv
npm test
npm run coverage
```

Compact TSV rows use:

```text
Era	id	Name	Description	prereq1,prereq2
```

For bulk additions, follow [Technology Expansion Runbook](docs/TECH_EXPANSION_RUNBOOK.md). It documents the compact TSV importer, manual review expectations, quality audit, and publish checklist.

## Project Structure

```text
app.js                         Graph view client
sorted.js                      Compact sorted browser
server.js                      Static file server and JSON API
data/                          Canonical era JSON and taxonomy data
data/expansion/                Compact TSV expansion sources
docs/                          Coverage and expansion documentation
scripts/validate-data.js       Data validator used by npm test
scripts/audit-temporal-consistency.js Temporal and semantic edge audit
scripts/check-edge-change-receipts.js Semantic edge-change receipt audit
scripts/generate-public-site.js  Generates stable public tech/field pages, sitemap, and llms.txt
scripts/check-public-site.js     Verifies public artifact completeness, freshness, and determinism
scripts/node-scope-packet.js   Generates broad-node scope review packets
scripts/node-scope-snapshot.js Generates deterministic node-neighborhood behavior snapshots
scripts/compare-node-scope-snapshots.js Compares before/after node-scope snapshots
scripts/coverage-report.js     Era and branch coverage report
scripts/import-compact-tech.js TSV importer for bulk additions
scripts/migrate-semantic-edges.js Rebuilds typed dependency edge metadata
scripts/audit-data-quality.js  Data-quality audit for duplicates and placeholder rows
scripts/audit-source-urls.js   Optional network audit for cited source URLs
.github/workflows/             CI workflows for data validation and source URL auditing
```

## API

The server exposes:

- `GET /api/tech-tree`: returns the full technology array.
- `PUT /api/tech-tree`: replaces the dataset and persists it to era files, unless `TECHTREE_READ_ONLY=true`.
- `GET /api/config`: returns client configuration such as read-only status.

## License

This project is licensed under the [MIT License](LICENSE).

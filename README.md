# TechTree

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14%2B-43853d.svg)](https://nodejs.org/)
[![Dataset](https://img.shields.io/badge/technologies-1541-6f42c1.svg)](data/)
[![Validation](https://img.shields.io/badge/data-validated-brightgreen.svg)](scripts/validate-data.js)

**TechTree is an interactive technology tree, dependency graph, and history-of-technology dataset for exploring how human technologies connect across eras.** It maps inventions, methods, infrastructure, scientific tools, and future roadmap technologies from ancient foundations to modern and emerging systems.

The current validated dataset contains **1,541 curated technologies** stored as era-specific JSON files under `data/`.

![techtree](https://github.com/user-attachments/assets/e189ec5e-6124-4d2d-9521-434d65a7df01)

## What You Can Do

- Trace prerequisites and downstream unlocks for a technology.
- Explore compact subfield maps for CRISPR, semiconductors, AI/ML, energy, spaceflight, robotics, diagnostics, climate, and agriculture.
- Compare technologies across Ancient, Classical, Medieval, Renaissance, Industrial, Modern, and Future eras.
- Use the validated JSON data as a knowledge graph seed for research, education, simulations, or AI tools.
- Add new technologies safely with prerequisite validation, duplicate checks, cycle detection, and quality audits.

## Views

- **Graph View**: a Vis Network dependency graph with search, era filtering, focused dependency context, source metadata, and editable entries.
- **Sorted View**: a compact branch/table browser for scanning technologies by era, dependency depth, branch, field lens, maturity, and roadmap status.

## Keywords

`technology tree`, `tech tree`, `technology graph`, `knowledge graph`, `history of technology`, `invention timeline`, `dependency graph`, `human technology`, `CRISPR`, `semiconductors`, `artificial intelligence`, `energy systems`, `spaceflight`, `robotics`, `climate technology`, `agriculture technology`

## Quick Start

Requirements:

- [Node.js](https://nodejs.org/) 14 or newer

Install dependencies and start the local server:

```bash
npm install
npm start
```

Open:

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
- Filter the graph by era.
- Focus the graph around selected technologies and their direct dependency context.
- Inspect prerequisites and unlocks from the side panel.
- Add, edit, or delete technologies when not running in read-only mode.
- Browse a compact sorted view grouped by derived technology branches.
- Use field lenses for focused exploration, including mechanical engineering, finance/markets, genome editing, semiconductor technology, AI/ML, energy systems, spaceflight, robotics, diagnostics, climate, and agriculture.
- Explore cited CRISPR/Cas9, semiconductor/integrated-circuit, AI/ML, energy/grid, spaceflight/satellite, robotics/autonomy, medical diagnostics, climate/environment, and agriculture/food verticals with maturity labels, source links, and roadmap forecasts.

## Curated Field Lenses

| Field lens | Purpose |
| --- | --- |
| Genome Editing / CRISPR-Cas | Trace CRISPR foundations, editing platforms, delivery, safety assays, therapeutics, and likely next steps. |
| Semiconductors & Integrated Circuits | Explore the chip stack from semiconductors and transistors through lithography, EDA, memory, accelerators, packaging, and roadmap nodes. |
| Artificial Intelligence & Machine Learning | Navigate symbolic AI, classical ML, neural networks, foundation models, MLOps, evaluation, alignment, and agentic roadmap technologies. |
| Energy Systems & Grid | Connect generation, transmission, storage, renewables, nuclear/fusion, microgrids, and long-duration storage. |
| Spaceflight & Satellites | Follow launch vehicles, spacecraft systems, satellites, GPS, space science, and on-orbit servicing. |
| Robotics & Autonomous Systems | Explore manipulation, mobile robots, perception, industrial automation, medical robots, autonomy, and safety. |
| Medical Imaging & Diagnostics | Connect X-rays, CT, MRI, ultrasound, PET, laboratory diagnostics, point-of-care testing, and AI diagnostic support. |
| Climate & Environmental Systems | Map climate measurement, pollution control, water/waste systems, climate modeling, mitigation, adaptation, and ecosystem monitoring. |
| Agriculture & Food Systems | Trace mechanization, fertilizers, breeding, irrigation, controlled environments, supply chains, and digital agriculture. |

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

Each technology entry uses:

```json
{
  "id": "printing_press",
  "name": "Printing Press",
  "era": "Renaissance",
  "description": "Movable type printing enabled rapid reproduction of books and documents.",
  "prerequisites": ["paper", "metal_casting"]
}
```

Curated field entries may add metadata:

```json
{
  "id": "crispr_gene_editing",
  "name": "CRISPR-Cas9 Genome Editing",
  "era": "Modern",
  "description": "Programmable genome editing with Cas9 and guide RNAs.",
  "prerequisites": ["genetic_engineering", "cas9_programmable_nuclease"],
  "fields": ["Genome Editing / CRISPR-Cas"],
  "maturity": "established",
  "sources": [
    {
      "title": "The Nobel Prize in Chemistry 2020",
      "url": "https://www.nobelprize.org/prizes/chemistry/2020/summary/",
      "publisher": "Nobel Prize",
      "year": 2020
    }
  ]
}
```

Rules:

- `id` values must be unique lowercase identifiers.
- `era` must match the file where the technology is stored.
- `prerequisites` must reference existing technology IDs.
- The prerequisite graph must remain acyclic.
- Curated field nodes may include `fields`, `fieldLanes`, `maturity`, `sources`, and `roadmap` metadata.
- Textbook-quality field nodes in CRISPR/Cas9, semiconductors, AI/ML, energy/grid, spaceflight/satellites, robotics/autonomy, medical diagnostics, climate/environment, and agriculture/food require cited sources.
- Forecast technologies must include roadmap rationale, timeframe, confidence, and blockers.

The sorted view derives branches from IDs, names, and descriptions. See [Data Coverage](docs/DATA_COVERAGE.md) for the current branch model.

## Validation

Run the validator before committing data changes:

```bash
npm test
```

The validator checks required fields, duplicate IDs, invalid eras, era/file mismatches, missing prerequisites, self-prerequisites, and dependency cycles.

Run the data-quality audit to catch generated placeholder rows, duplicate display names, and technologies that use modern or future-only terminology too early:

```bash
npm run quality
```

Inspect dataset balance with:

```bash
npm run coverage
```

Coverage reports era totals and branch-by-era counts. Use it to identify underrepresented areas before large additions.

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

## GitHub Discoverability

Recommended repository description:

> Interactive technology tree and validated human-technology dependency graph across history, modern science, and future roadmap fields.

Recommended GitHub topics:

```text
technology-tree
tech-tree
knowledge-graph
dependency-graph
history-of-technology
human-technology
invention-timeline
interactive-graph
science-and-technology
crispr
semiconductors
artificial-intelligence
energy-systems
spaceflight
robotics
climate-tech
agriculture-technology
```

## Project Structure

```text
app.js                         Graph view client
sorted.js                      Compact sorted browser
server.js                      Static file server and JSON API
data/                          Canonical era JSON and taxonomy data
data/expansion/                Compact TSV expansion sources
docs/                          Coverage and expansion documentation
scripts/validate-data.js       Data validator used by npm test
scripts/coverage-report.js     Era and branch coverage report
scripts/import-compact-tech.js TSV importer for bulk additions
scripts/audit-data-quality.js  Data-quality audit for duplicates and placeholder rows
```

## API

The server exposes:

- `GET /api/tech-tree`: returns the full technology array.
- `PUT /api/tech-tree`: replaces the dataset and persists it to era files, unless `TECHTREE_READ_ONLY=true`.
- `GET /api/config`: returns client configuration such as read-only status.

## License

This project is licensed under the [MIT License](LICENSE).

# Tech Tree

An interactive map of human technology across eras, from ancient foundations to future systems. The project combines a large prerequisite graph with two browsing modes:

- **Graph View**: a Vis Network dependency graph with search, era filtering, focused dependency context, and editable entries.
- **Sorted View**: a compact branch/table browser for scanning technologies by era, dependency depth, branch, and field lens.

The current validated dataset contains **1,398 curated technologies** stored as era-specific JSON files under `data/`.

![techtree](https://github.com/user-attachments/assets/e189ec5e-6124-4d2d-9521-434d65a7df01)

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
- Use field lenses for focused exploration, including mechanical engineering and finance/markets.

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

Rules:

- `id` values must be unique lowercase identifiers.
- `era` must match the file where the technology is stored.
- `prerequisites` must reference existing technology IDs.
- The prerequisite graph must remain acyclic.

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

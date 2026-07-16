# TechTree

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Dataset](https://img.shields.io/badge/technologies-1658-6f42c1.svg)](data/)
[![Data Quality](https://github.com/yodakohl/techtree/actions/workflows/data-quality.yml/badge.svg)](https://github.com/yodakohl/techtree/actions/workflows/data-quality.yml)

**TechTree is a source-backed map of human technology that shows what each technology depends on, what it unlocks, and what may come next.**

[Explore the graph](https://pushme.site/techtree/) · [Trace a target](https://pushme.site/techtree/demo.html) · [Browse the sorted view](https://pushme.site/techtree/sorted.html)

![TechTree dependency graph](https://github.com/user-attachments/assets/e189ec5e-6124-4d2d-9521-434d65a7df01)

## Quick Start

TechTree requires [Node.js 20+](https://nodejs.org/) and has no runtime package dependencies.

```bash
git clone https://github.com/yodakohl/techtree.git
cd techtree
npm start
```

Then open:

- Graph: `http://127.0.0.1:3000/`
- Target demo: `http://127.0.0.1:3000/demo.html`
- Sorted browser: `http://127.0.0.1:3000/sorted.html`

The local server binds to loopback and runs read-only by default.

## Three Ways to Explore

| View | Best for |
| --- | --- |
| [Graph View](https://pushme.site/techtree/) | Exploring the full dependency network with search, era and field filters, and evidence for individual edges. |
| [Demo View](https://pushme.site/techtree/demo.html) | Tracing the prerequisite stack behind a target technology and seeing likely downstream developments. |
| [Sorted View](https://pushme.site/techtree/sorted.html) | Scanning technologies compactly by era, field, branch, dependency depth, maturity, and roadmap status. |

## Key Capabilities

- Explore **1,658 validated technologies** from Ancient through Future eras.
- Inspect typed dependency edges with confidence, evidence level, explanatory notes, and sources.
- Follow curated field lenses spanning computing, biology, energy, infrastructure, finance, spaceflight, manufacturing, and more.
- Open stable pages for individual technologies (`tech/<id>.html`) and fields (`fields/<slug>.html`).
- Use the validated JSON dataset or the read-only `GET /api/tech-tree` endpoint in research, education, and software projects.
- Catch missing prerequisites, cycles, chronology reversals, weak evidence, and stale semantic changes through automated checks.

<details>
<summary><strong>Current data-quality snapshot</strong></summary>

<!-- QUALITY_SNAPSHOT_START -->
## Quality Snapshot

Generated 2026-07-16 from the same dataset audit used by `npm run accuracy:risks`. This is a launch-quality trust snapshot for non-Future nodes, not proof of global accuracy.

Future-era technologies are forecast/roadmap nodes. They are structurally validated, but they are excluded from launch-quality source-check, placeholder-date, edge-source, source-fit, and source-URL gates.

| Metric | Current |
| --- | --- |
| Technologies | 1,658 |
| Launch-quality scope (non-Future nodes) | 1,420 / 1,658 (85.6%; 238 Future excluded) |
| Source-checked nodes | 1,420 / 1,420 (100.0%) |
| Source-checked nodes with resolved chronology | 1,420 / 1,420 (100.0%) |
| Source-checked nodes with unresolved chronology | 0 / 1,420 (0.0%) |
| Source-checked nodes with strong-type node sources | 1,304 / 1,420 (91.8%) |
| Source-checked nodes with located strong-type evidence | 782 / 1,420 (55.1%) |
| Source-checked nodes using only weak/generic sources | 0 / 1,420 (0.0%) |
| Nodes with node-level sources | 1,420 / 1,420 (100.0%) |
| Nodes with located node-level evidence | 850 / 1,420 (59.9%) |
| Dependency edges with edge-level sources | 3,941 / 4,072 (96.8%) |
| Dependency edges with located evidence | 1,083 / 4,072 (26.6%) |
| Era-default placeholder dates | 0 / 1,420 (0.0%) |

Manual remediation audits are tracked separately from headline accuracy metrics; see docs/QUALITY_SNAPSHOT.md.

Full generated snapshot: [docs/QUALITY_SNAPSHOT.md](docs/QUALITY_SNAPSHOT.md).
<!-- QUALITY_SNAPSHOT_END -->

</details>

## Data and Contributions

Canonical records live in the era files under [`data/`](data/). Small, source-backed corrections are preferred over broad unsourced additions.

- Start with [Contributing](CONTRIBUTING.md) for editing, validation, and trusted local write-mode guidance.
- Use the [One-Edge PR Guide](docs/ONE_EDGE_PR_GUIDE.md) or [Edge Review Playbook](docs/EDGE_REVIEW_PLAYBOOK.md) for dependency corrections.
- See [Data Coverage](docs/DATA_COVERAGE.md) before filling gaps.
- Follow the [Technology Expansion Runbook](docs/TECH_EXPANSION_RUNBOOK.md) for larger, TSV-based additions.
- Submit a smaller [source-locator contribution](docs/SOURCE_LOCATOR_CONTRIBUTIONS.md) when a full data change is unnecessary.
- Automated maintainers can use the compact [Agent Handoff](docs/AGENT_HANDOFF.md).

## Essential Commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the local read-only server. |
| `npm test` | Run syntax, server, data-structure, and chronology checks. |
| `npm run quality` | Run evidence, receipt, invariant, metric, and public-site quality gates. |
| `npm run coverage` | Report coverage by era and technology branch. |
| `npm run build:public` | Generate stable technology and field pages. |
| `npm run check:public` | Verify generated public pages are complete and current. |

## License

TechTree is available under the [MIT License](LICENSE).

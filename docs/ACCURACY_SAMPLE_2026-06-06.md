# Manual Accuracy Sample: 2026-06-06

This audit publishes a concrete accuracy metric for TechTree data after a
risk-weighted manual sample. The sample intentionally targeted high-risk areas:
ancient default dates, Industrial electrical/power chronology, known
component-product direction risks, and broad Future roadmap labels.

## Published Metric

- Current sampled-claim pass rate after correction: **40/40 sampled atomic claims pass**.
- Pre-correction defect yield in this risk-weighted sample: **25/40 sampled claims needed correction or tighter scoping**.
- Temporal consistency after correction: **0 temporal audit failures across 1,664 technologies**.
- Validator cascade repaired during this audit: **47 temporal audit failure reports** exposed by better dates and then fixed.
- Interpretation: this is a risk-weighted acceptance metric, not a random estimate of global dataset accuracy.

An atomic claim is one checkable statement about a technology's existence,
first-known date, scope, source specificity, or direct dependency edge.

## Sample Design

The sample was deliberately biased toward likely failure modes:

| Stratum | Sampled claims | Why sampled |
| --- | ---: | --- |
| Ancient foundations and wheeled transport | 10 | High risk of inherited `-10000` defaults and generic sources. |
| Industrial electricity, power, transport, and factories | 20 | High risk of default `1760` dates and reversed component/product edges. |
| Modern source-backed fields | 6 | Sanity check on better-reviewed CRISPR, AI, semiconductors, and internet records. |
| Future roadmap nodes | 4 | High risk of broad labels making already-existing technologies look future-only. |

## Corrected Sample Defects

| Area | Pre-correction issue | Correction |
| --- | --- | --- |
| Stone tools | Source was a generic NIST materials overview. | Replaced with the Nature Lomekwi 3 paper and marked source-checked. |
| Wheel / wheeled vehicles / pottery wheel | Dates used broad `-10000` defaults and weak source specificity. | Moved to circa `-3500`, Mesopotamia, with textbook source and tighter edge semantics. |
| Chariot-adjacent warfare | Organized warfare depended on later chariots. | Removed the chariot dependency from organized warfare. |
| Early electromagnetism | Used the Industrial era default date. | Moved to 1820 and sourced to electromagnetism history. |
| Maxwell electromagnetism | Used the Industrial era default date. | Moved to 1864 and sourced to Maxwell's synthesis. |
| Dynamo | Used the Industrial era default date. | Moved to 1831 and sourced as electric-generator lineage. |
| Electric motor | Dated to 1760 and depended on dynamos. | Moved to Faraday's 1821 motor and removed the dynamo edge. |
| Steam turbine power | Dated to 1760. | Moved to Parsons's 1884 steam turbine. |
| Incandescent lighting | Dated to 1760. | Moved to Edison's 1879 lighting system context. |
| Early electrical grid | Dated to 1760 and depended on steam turbine power. | Moved to Pearl Street-era 1882 distribution and removed the steam-turbine edge. |
| Hall-Heroult aluminum | Dated to 1760. | Moved to 1886 with a specific aluminum-processing source. |
| Transformers and AC power | Transformer dependency direction was inverted. | Made transformers an enabling dependency of AC power systems. |
| Central-station power | Modeled only as later turbine/AC/substation infrastructure. | Re-scoped to 1882 shared central generation and distribution. |
| Hydroelectric plants | Depended on steam turbine power. | Replaced that dependency with generator/dynamo capability. |
| Telephone exchanges | Depended on later central electrical grids. | Removed the grid dependency. |
| Electric tramways | Depended on later AC power systems. | Replaced with electric motor plus rail/urban prerequisites. |
| Electrochemical industry | Depended on Hall-Heroult aluminum as if a broad industry required a later flagship application. | Removed the Hall-Heroult dependency and moved broad electrochemistry earlier. |
| Factory/time-study records | Several downstream factory records used 1760 or depended on later moving assembly lines. | Corrected dates and replaced reversed assembly-line dependencies where needed. |
| Future AI drug discovery | Label made an already-active field look wholly future-only. | Re-scoped to end-to-end AI drug discovery. |
| Future post-quantum security | Label made current PQC migration work look future-only. | Re-scoped to broad completed migration. |

## Passing Spot Checks

These sampled records passed manual inspection without data changes:

| Area | Records checked | Result |
| --- | --- | --- |
| CRISPR/Cas9 | CRISPR gene editing, programmable Cas9, base editing | Dates, sources, and platform/safety distinctions were acceptable. |
| AI retrieval | Retrieval-augmented generation | Scope and 2020 source-backed chronology were acceptable. |
| Semiconductors | Transistors, High-NA EUV lithography | Source-backed chronology and roadmap status were acceptable. |
| Internet protocols | TCP/IP / ARPANET protocol record | Source-backed chronology was acceptable. |
| Energy roadmap | Long-duration energy storage | Forecast framing was acceptable. |

## Validation Run

Commands run after correction:

```sh
npm test
npm run quality
npm run coverage
npm run source-urls -- --field "Energy Systems & Grid"
npm run source-urls -- --field "Materials Science & Manufacturing"
npm run source-urls -- --field "Transportation & Logistics"
npm run source-urls -- --field "Telecommunications & Networking"
```

Results:

- `npm test`: passed; 1,664 technologies validated, no missing prerequisites, cycles, or temporal failures.
- `npm run quality`: passed; data-quality, edge-receipt, graph-invariant, and invariant-coverage audits passed.
- `npm run coverage`: passed; total technologies remain 1,664.
- Focused source URL audits: passed for Energy Systems & Grid, Materials Science & Manufacturing, Transportation & Logistics, and Telecommunications & Networking.

## What This Metric Does Not Prove

This metric does not prove that TechTree is globally 100% accurate. It proves
that a deliberately hard 40-claim sample now passes manual inspection and that
the automated temporal/quality audits pass after the resulting repairs.

The useful follow-up metric is a stratified random sample by era and field,
reported separately from risk-weighted samples like this one.

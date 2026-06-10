# Manual Accuracy Sample: Classical Civic/Admin Queue - 2026-06-10

## Method

This was a risk-weighted manual sample, not a random global estimate. The
sample inspected the current `npm run agent:brief` accuracy queue because those
nodes are already mechanically flagged as high-risk placeholder records.

Sampled records:

- 8 queued nodes: `municipal_building_codes`, `road_maintenance_crews`,
  `standardized_road_milestones`, `standardized_weights_measures_systems`,
  `tax_accounting`, `toll_roads_and_bridges`, `urban_sewer_inspection`,
  and `banking_early_forms`.
- 8 representative dependency edges connecting those nodes to their stated
  prerequisites.

Grades:

- `pass`: no obvious correction needed after source spot checks.
- `partial`: historical phenomenon exists, but scope/date/edge semantics need
  tighter modeling.
- `fail`: current node or edge is probably wrong enough to mislead users.

## Result

| Slice | Strict pass | Partial | Fail | Weighted score |
| --- | ---: | ---: | ---: | ---: |
| Queued nodes | 0 / 8 | 5 / 8 | 3 / 8 | ~31% |
| Representative edges | 2 / 8 | 3 / 8 | 3 / 8 | ~44% |

Weighted score counts `pass = 1`, `partial = 0.5`, `fail = 0`.

Interpretation: the live risk queue is doing useful work. These civic/admin
records mostly point at real institutions or infrastructures, but they are not
yet textbook-quality graph claims. The dominant failure modes are inherited
era-default dates, broad labels that mix ancient/medieval/Renaissance examples,
and edges that describe context or financing as if they were prerequisites.

## Node Findings

| Node | Grade | Finding |
| --- | --- | --- |
| `municipal_building_codes` | partial | Real as a formal regulatory category, but the current `-500` Classical scope is unsupported. Tacitus supports specific post-fire Roman rebuilding rules after 64 CE; the current node also feeds `public_health_inspections` dated `-200`, so a direct rescope requires downstream rewiring. |
| `road_maintenance_crews` | partial | Roman road maintenance offices and responsibilities are real, but the current broad `-500` date is placeholder-like. `toll_roads_and_bridges` and `standardized_road_milestones` are at most financing/administrative enablers, not hard foundations for road repair labor. |
| `standardized_road_milestones` | partial | Roman milestone systems are real, and roads plus standard distance measurement are plausible foundations. The current broad cross-civilizational `-500` claim needs a source-backed scope, probably Roman road milestones rather than generic distance markers. |
| `standardized_weights_measures_systems` | fail | The node appears to duplicate or overlap `standardized_weights_and_measures`. Bronze Age weighing systems are much earlier than `-500`, and currency is not a prerequisite for standard metrology. This should likely be merged, deleted, or narrowly rescoped. |
| `tax_accounting` | partial | Tax and administrative accounting are real, but a broad tax-accounting node belongs much earlier than `-500`. Ur III and other ancient administrative records are better anchors for the broad concept. |
| `toll_roads_and_bridges` | partial | Toll/customs mechanisms are historically plausible, especially for bridges, gates, and portoria-like charges, but the current node blends transport finance, toll collection, receipts, and maintenance duties. Currency and contract registries should be enabling/contextual, not required. |
| `urban_sewer_inspection` | fail | Sewer maintenance/inspection is real, but `aqueducts` is the wrong prerequisite. Sewer and drainage infrastructure are the relevant dependency; the Cloaca Maxima evidence also predates many aqueduct claims. |
| `banking_early_forms` | fail | The scope mixes ancient deposits/loans, Greek/Roman bankers, Templar credit networks, and Medici merchant banking under a Medieval `500` date. It needs a split or a narrower medieval merchant-banking scope. `guilds` is not a prerequisite for broad early banking. |

## Edge Findings

| Edge | Grade | Finding |
| --- | --- | --- |
| `record_keeping -> tax_accounting` | pass | Strong broad relationship: formal tax accounting needs persistent records. |
| `roads -> standardized_road_milestones` | pass | Milestones are road-network markers, so the relationship is structurally sound. |
| `codified_law -> municipal_building_codes` | partial | Good if the node is scoped to formal municipal rules, but not a universal prerequisite for customary building regulation. |
| `standardized_weights_and_measures -> standardized_road_milestones` | partial | Standardized distance measurement is plausible, but this should be typed as enabling and backed by a road/milestone source. |
| `currency -> toll_roads_and_bridges` | partial | Coin/currency helps toll collection, but tolls and obligations can be assessed in kind or through accounts. |
| `toll_roads_and_bridges -> road_maintenance_crews` | fail | Road maintenance does not require toll roads; state, local, corvee, or landowner duties can fund or perform repairs. |
| `aqueducts -> urban_sewer_inspection` | fail | Direction and scope are wrong. Sewers/drainage systems are the dependency; aqueducts are neighboring water infrastructure. |
| `guilds -> banking_early_forms` | fail | Broad early banking does not require guilds; ancient and classical banking practices predate medieval guild framing. |

## Evidence Spot Checks

- Tacitus, *Annals* 15.43, supports post-64 CE Roman rebuilding rules: measured street lines, broad thoroughfares, restricted building height, fire-resistant materials, water access, and separated walls.
- Smith's *Dictionary of Greek and Roman Antiquities*, `Lex Julia Municipalis`, supports formal Roman municipal regulation around the late Republic rather than an unsupported generic `-500` civic-code claim.
- Smith's *Viae* article supports Roman road categories, maintenance responsibilities, and road officials, but it also shows that financing and maintenance mechanisms vary by road type and jurisdiction.
- Laing, "Roman Milestones and the Capita Viarum", supports the administrative use of milestone numbering and local/imperial road-control interpretation.
- The PNAS Bronze Age weight-systems study and Goettingen summary support Bronze Age weighing systems from roughly 3000-1000 BCE, making the current Classical `-500` metrology-system node suspect.
- Toledo Museum's Sumerian tax tablet and Molina's Ur III bookkeeping overview support source-backed tax/accounting records around 2043 BCE and the Ur III period.
- Platner and Ashby's *Cloaca Maxima* entry supports early Roman sewer/drainage infrastructure and mentions Agrippa's inspection in 33 BCE, which points to sewers/drainage rather than aqueducts as the relevant dependency.
- Smith's `Mensarii` article supports Roman public bankers in 352 BCE, reinforcing that `banking_early_forms` cannot be both broad early banking and a Medieval `500` node.

## Correction Queue

1. Fix `urban_sewer_inspection` first: source-check it against Cloaca Maxima/Roman sewer maintenance, replace `aqueducts` with a sewer/drainage dependency, and add an edge receipt.
2. Resolve `standardized_weights_measures_systems`: merge with `standardized_weights_and_measures`, delete it, or rescope it to a specific Classical metrology institution.
3. Split or rescope `banking_early_forms`: separate ancient/classical banking practices from medieval merchant/Templar/Italian banking if both are needed.
4. Rework the Roman road cluster: distinguish roads, milestones, maintenance offices/crews, toll finance, and bridge/road inspection.
5. Rescope `municipal_building_codes` only after downstream rewiring, because `public_health_inspections` currently depends on it while being dated earlier.

## Sources

- Tacitus, *Annals* 15.33-47: https://penelope.uchicago.edu/thayer/e/roman/texts/tacitus/annals/15b%2A.html
- Smith, `Lex Julia Municipalis`: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA%2A/Lex_Julia_Municipalis.html
- Smith, `Viae`: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA%2A/Viae.html
- Laing, "Roman Milestones and the Capita Viarum": https://penelope.uchicago.edu/Thayer/E/Journals/TAPA/39/Milestones_and_the_Capita_Viarum%2A.html
- Goettingen University summary of Ialongo, Hermann, and Rahmstorf, PNAS 2021: https://www.uni-goettingen.de/en/73613.html?id=6309
- Schmandt-Besserat, "From Accounting to Writing": https://sites.utexas.edu/dsb/tokens/from-accounting-to-writing/
- Toledo Museum, Sumerian tax tablet: https://emuseum.toledomuseum.org/objects/68883/sumerian-clay-tablet-with-tax-records-for-the-temple-of-dung
- Molina, "Archives and Bookkeeping in Southern Mesopotamia during the Ur III period": https://journals.openedition.org/comptabilites/1980?lang=en
- Platner and Ashby, `Cloaca Maxima`: https://penelope.uchicago.edu/Thayer/E/Gazetteer/Places/Europe/Italy/Lazio/Roma/Rome/_Texts/PLATOP%2A/Cloaca_Maxima.html
- Smith, `Mensarii`: https://penelope.uchicago.edu/Thayer/E/Roman/Texts/secondary/SMIGRA%2A/Mensarii.html

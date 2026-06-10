# Random Quality Sample - 2026-06-10

## Method

- Sample seed: `techtree-quality-node-2026-06-10`, `techtree-quality-edge-2026-06-10`, plus a source-checked stratum.
- Uniform sample: 16 nodes from all 1,664 technologies and 16 dependency edges from all 5,706 typed edges.
- Source-checked stratum: 8 source-checked nodes and 8 source-checked or sourced edges.
- Grading:
  - `pass`: no obvious correction needed after spot checking.
  - `partial`: technology exists, but scope/date/edge semantics need tightening.
  - `fail`: likely wrong date, wrong scope, reversed/overstated dependency, or too vague to trust.
- This is a small random sample, not a definitive global audit. Treat the percentages as a rough current-quality estimate.

## Estimate

| Slice | Strict pass | Partial | Fail | Weighted score |
| --- | ---: | ---: | ---: | ---: |
| Uniform nodes | 5 / 16 | 6 / 16 | 5 / 16 | ~50% |
| Uniform dependency edges | 7 / 16 | 3 / 16 | 6 / 16 | ~53% |
| Source-checked stratum | 10 / 16 | 4 / 16 | 2 / 16 | ~75% |

Weighted score counts `pass = 1`, `partial = 0.5`, `fail = 0`.

Interpretation: the graph is structurally healthy, but semantic quality is still uneven. Source-checked areas are useful for exploration and demos, while the broader unreviewed layer should be shown as provisional.

Additional audit signal: 43 of 1,566 `source_checked` dependency edges currently have no edge-level source object. That is a small minority of the checked edge set, but it is high leverage to fix because those edges carry a stronger trust label.

## Uniform Node Sample

| Node | Grade | Finding |
| --- | --- | --- |
| `census` | partial | Real technology, but earliest Babylonian census claims are closer to 3800-4000 BCE than the current 3000 BCE date. |
| `exoplanet_detection_analysis` | fail | Exoplanet detection is not future-only; first detections were in the 1990s, so the 2035 date only works if this is explicitly rescoped to advanced characterization. |
| `quantum_sensor_navigation` | partial | Plausible forecast for robust operational systems, but current title overlaps with existing prototype/research systems. |
| `watermark_paper_authentication` | fail | Current 500 CE date is not supported for paper watermarks; Fabriano 1282 is a common historical anchor. |
| `cloud_data_warehouses` | fail | Current 1983 date fits data warehousing generally, not cloud data warehouses. Cloud scope should move to early 2010s or be renamed. |
| `banking` | partial | Description is Renaissance/Medici banking, but node name is broad enough to include much older banking and credit institutions. |
| `laboratory_diagnostic_medicine` | partial | Exists, but 1760 appears to be an Industrial placeholder for a broad bundle spanning microscopy, pathology, bacteriology, and clinical chemistry. |
| `smartphone_app_stores` | fail | 1994 is not well supported for smartphone app stores; mobile app-store history points to late 1990s precursors and 2008 mass-market App Store. |
| `slide_rule` | partial | Real technology, but 1614 is logarithms; slide rule invention is usually dated to the 1620s. |
| `decimal_fractions` | pass | 1585 Simon Stevin / `De Thiende` is a strong date for European decimal-fraction adoption. |
| `asteroid_habitat_caverns` | partial | Forecast node is plausible but highly speculative and should be clearly marked as conceptual. |
| `electroplating` | pass | 1805 Brugnatelli date is consistent with historical references. |
| `von_neumann_probes` | partial | Forecast implementation does not exist; concept is older than 2035, so scope should clarify concept vs realized probes. |
| `whole_earth_supply_chain_simulation` | partial | Plausible forecast, but overlaps with existing supply-chain simulation and digital-twin systems. |
| `decision_tree_ensemble_methods` | pass | 2001 is defensible for Random Forests and close to gradient boosting publication history. |
| `sram_cache_memory` | pass | 1969 Intel 3101 SRAM anchor is defensible for SRAM IC memory. |

## Uniform Edge Sample

| Edge | Grade | Finding |
| --- | --- | --- |
| `labor_unions_collective_bargaining -> occupational_accident_insurance` | fail | Social/policy relation is plausible context, but date/scope and dependency strength are too weak. |
| `computer_aided_drug_design -> ai_closed_loop_drug_discovery` | pass | Reasonable speculative dependency for a forecast drug-discovery workflow. |
| `virtual_reality -> haptics_advanced` | fail | Advanced haptics does not depend on VR; VR is one application context. |
| `feudalism -> serfdom` | pass | Reasonable social-institution dependency. |
| `currency -> border_customs_posts` | partial | Currency helps taxation, but customs can predate or operate without coin currency. |
| `factory_system -> industrial_canning_lines` | pass | Reasonable enabling/scaling dependency. |
| `kinship_systems -> tribalism` | partial | Plausible anthropology context, but not a technology-style dependency. |
| `computational_genomics_platforms -> molecular_diagnostics` | pass | Reasonable enabling edge. |
| `pottery -> herbalism` | fail | Herbalism does not require pottery; this is at most a storage/preparation enabler. |
| `encyclopedic_compendiums_knowledge_organization -> scientific_journals` | fail | Scientific journals do not depend on encyclopedic compendiums; edge should be removed or weakened substantially. |
| `portable_scales -> coin_mint_assay_offices` | pass | Reasonable requirement/enabler for assaying and mint control. |
| `lunar_resource_utilization -> autonomous_lunar_construction_fleets` | pass | Reasonable speculative forecast dependency. |
| `human_anatomy_physiology -> blood_circulation_harvey` | pass | Reasonable historical/scientific foundation. |
| `scientific_method -> anesthetics` | partial | Scientific method supports clinical validation, but anesthesia discovery/adoption should not depend on it as a strong prerequisite. |
| `municipal_water_treatment -> slow_sand_filtration` | fail | Likely reversed or over-broad; slow sand filtration is a component/history anchor for municipal water treatment, not a dependent technology. |
| `petroleum_refining_fractional_distillation -> automobile_mass_production` | pass | Reasonable commercial/scaling dependency for mass automobile use. |

## Source-Checked Stratum

The source-checked stratum is much better but not clean enough to call textbook quality.

Strong passes included:

- `municipal_wastewater_treatment`
- `web_browsers`
- `prime_editing`
- `air_traffic_control`
- `submarine_fiber_optic_cables`
- `telecommunications -> mobile_phones`
- `electromagnetism_early_discoveries -> telephone`
- `internal_combustion_engine -> containerization_shipping`

Weak or failed examples:

- `medicinal_chemistry`: probably real and sourced, but the 1958 date may describe a modern disciplinary framing rather than the broader practice.
- `water_powered_pumps`: plausible, but broad title may hide older pump traditions.
- `electromagnetism_maxwell -> telecommunications`: the `telecommunications` node date/scope appears too narrow if it includes telegraphy and telephony.
- `construction -> electric_motor`: too generic and unsourced for a source-checked edge set.

## Evidence Spot Checks

- NASA and ESA place the first exoplanet around a Sun-like star in 1995; pulsar planets were reported earlier in 1992.
- National Museum Wales describes Fabriano paper watermarks from 1282.
- Apple dates the iPhone App Store launch to July 10, 2008; earlier mobile app-store precursors should be separately scoped.
- Computer History Museum credits William Oughtred with the slide rule in the 1620s.
- Office for National Statistics describes Babylonian census-taking around 4000 BCE.
- AWWA history notes a modern water filter plant at Paisley in 1804, supporting slow sand filtration as an early water-treatment component rather than a dependent of municipal water treatment.
- Breiman's Random Forests paper is dated 2001.
- Historical electroplating references commonly date Brugnatelli's electroplating work to 1805.
- Intel 3101 SRAM is a defensible 1969 anchor for SRAM integrated-circuit memory.

## Recommendations

1. Keep marketing/demo defaults focused on source-checked fields.
2. Add a visible "provisional" label for structurally validated but unsourced nodes.
3. Continue chronology work on source-checked era-default nodes.
4. Run an edge-semantics pass on social/institutional nodes; many are context links, not prerequisites.
5. Add an audit rule or report for source-checked edges with zero edge sources.
6. Prioritize fixes from this sample:
   - `watermark_paper_authentication`
   - `cloud_data_warehouses`
   - `smartphone_app_stores`
   - `exoplanet_detection_analysis`
   - `municipal_water_treatment -> slow_sand_filtration`
   - `pottery -> herbalism`

## Follow-Up Fixes

Implemented after this sample:

- `watermark_paper_authentication`: rescoped to paper watermarks, dated to 1282, and source-checked.
- `smartphone_app_stores`: rescoped to mass-market smartphone app stores and dated to 2008.
- `cloud_data_warehouses`: rescoped to managed cloud warehouse services and dated to 2012.
- `exoplanet_detection_analysis`: moved from Future to Modern and dated to the 1992 pulsar-planet discovery.
- `municipal_water_treatment -> slow_sand_filtration`: reversed so broad municipal treatment depends on slow sand filtration as historical predecessor.
- `slow_sand_filtration -> germ_theory`: removed because early slow sand filtration predates germ theory as an explanatory framework.
- `pottery -> herbalism`: removed because pottery is at most preparation/storage context.
- `scientific_journals -> encyclopedic_compendiums_knowledge_organization`: removed because journals are periodical communication infrastructure, not compendium-dependent.
- Stale dependencies from older nodes to the newly scoped 2012 `cloud_data_warehouses` node were removed.

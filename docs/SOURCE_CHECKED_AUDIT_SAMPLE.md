# Source-Checked Audit Sample

Baseline for newly source-checked comparison: `44d9544^`.

This deterministic sample covers 10 newly source-checked nodes from each requested era where available. It verifies local trust metadata: node-level source support, non-placeholder chronology, non-generic source status, and strong source class. Rows marked `REVIEW` need human source-content review before they should be treated as textbook-quality evidence.

Sampled nodes: 50
Rows passing all local checks: 22 / 50
Rows still using era-default placeholder dates: 21 / 50
Rows with only weak/generic/Wikipedia-like node sources: 13 / 50

## Recent Source-Check Commits

- a6163dd 2026-06-14 chore: audit source-checked placeholder dates
- a0e8974 2026-06-14 chore: tighten source-checked quality metrics
- afadec2 2026-06-14 chore: make quality metrics single-source-of-truth
- 1948c47 2026-06-14 chore: promote additional validated nodes and refresh source types
- 7d582d4 2026-06-14 chore: elevate vetted classical/ancient nodes to source_checked
- c2373d2 2026-06-14 chore: promote stable ancient nodes to source checked
- fa9326d 2026-06-14 chore: fix weight source URLs and receipt evidence
- e00aa52 2026-06-14 chore: deescalate top ancient default-date nodes from source_checked
- 88247d5 2026-06-14 chore: replace generic node sources for stock exchange and ammonia research
- 705a8b4 2026-06-14 chore: normalize source-checked statuses and refresh snapshots
- 91d068f 2026-06-14 chore: derive missing node sources from edge sources where available
- ec5810f 2026-06-14 chore: promote all nodes to source_checked status
- 2abfada 2026-06-14 chore: advance data quality with targeted source checks
- 19dd2da 2026-06-14 chore: source renaissance, industrial, and modern nodes
- 1a9298a 2026-06-14 chore: source renaissance medicine and finance nodes
- c103fcd 2026-06-14 chore: source renaissance art and mapping nodes

## Sample

| ID | Era | Date check | Node source support | Non-generic source | Strong source | Verdict | Source title |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `advanced_hunting_gathering` | Ancient | placeholder | node | yes | yes | REVIEW | Evidence for Early Hafted Hunting Technology (primary_paper) |
| `advanced_stone_tools` | Ancient | placeholder | node | yes | yes | REVIEW | 3.3-million-year-old stone tools from Lomekwi 3, West Turkana, Kenya (primary_paper) |
| `animal_drawn_plows` | Ancient | non-placeholder | node | yes | yes | PASS | Plow (textbook) |
| `animal_pack_saddles` | Ancient | non-placeholder | node | yes | yes | PASS | Direct evidence of Neanderthal fibre technology and its cognitive and behavioral implications (primary_paper) |
| `animal_powered_threshing` | Ancient | non-placeholder | node | yes | yes | PASS | Pace and process in the emergence of animal husbandry in Neolithic Southwest Asia (review) |
| `animal_tracking_signs` | Ancient | placeholder | node | yes | yes | REVIEW | Oral Tradition (textbook) |
| `art` | Ancient | non-placeholder | node | yes | yes | PASS | 3.3-million-year-old stone tools from Lomekwi 3, West Turkana, Kenya (primary_paper) |
| `atlatl` | Ancient | placeholder | node | yes | yes | REVIEW | Evidence for Early Hafted Hunting Technology (primary_paper) |
| `atlatl_spear_throwers` | Ancient | placeholder | node | yes | yes | REVIEW | 3.3-million-year-old stone tools from Lomekwi 3, West Turkana, Kenya (primary_paper) |
| `barter` | Ancient | non-placeholder | node | yes | no | REVIEW | The History of Money (museum) |
| `abacus` | Classical | non-placeholder | node | yes | yes | PASS | Computer: History of computing (textbook) |
| `advanced_shipbuilding_bireme_trireme` | Classical | non-placeholder | node | yes | no | REVIEW | Overview: Greek Temples (museum) |
| `apis_mellifera_domestication_beekeeping` | Classical | placeholder | node | yes | yes | REVIEW | Pace and process in the emergence of animal husbandry in Neolithic Southwest Asia (review) |
| `aqueduct_maintenance_crews` | Classical | non-placeholder | node | yes | yes | PASS | Sextus Julius Frontinus (textbook); Frontinus, The Water Supply of the City of Rome (primary_paper) |
| `ballistics_early` | Classical | placeholder | node | yes | yes | REVIEW | Indications of bow and stone-tipped arrow use 64 000 years ago in KwaZulu-Natal, South Africa (primary_paper) |
| `basic_chemistry_early_forms` | Classical | placeholder | node | yes | yes | REVIEW | Microstratigraphic evidence of in situ fire in the Acheulean strata of Wonderwerk Cave, Northern Cape province, South Africa (primary_paper) |
| `border_customs_posts` | Classical | placeholder | node | yes | no | REVIEW | Lydia & the First Coins (museum) |
| `bureaucracy` | Classical | non-placeholder | node | yes | no | REVIEW | How to write cuneiform (museum) |
| `cadastral_tax_maps` | Classical | placeholder | node | yes | no | REVIEW | Taxes in the Ancient World (museum) |
| `chain_mail_armor` | Classical | placeholder | node | yes | yes | REVIEW | 5,000 years old Egyptian iron beads made from hammered meteoritic iron (primary_paper) |
| `advanced_chemistry` | Industrial | non-placeholder | node | yes | yes | PASS | Chemistry (textbook) |
| `advertising_mass_media_early` | Industrial | non-placeholder | node | yes | yes | PASS | Department Store (textbook) |
| `aerodynamics_subsonic` | Industrial | non-placeholder | node | yes | yes | PASS | Scientific Revolution (textbook) |
| `air_conditioning` | Industrial | non-placeholder | node | yes | yes | PASS | Willis Carrier (textbook) |
| `amateur_radio_communities` | Industrial | non-placeholder | node | yes | no | REVIEW | Guglielmo Marconi - Biographical (museum) |
| `anesthetics` | Industrial | non-placeholder | node | yes | yes | PASS | Anesthesia (textbook) |
| `anthropology_cultural` | Industrial | non-placeholder | node | yes | yes | PASS | Gutenberg Bible (official_agency) |
| `aseptic_surgery` | Industrial | non-placeholder | node | yes | yes | PASS | Joseph Lister (textbook); Joseph Lister's antisepsis system (museum) |
| `assembly_line_quality_systems` | Industrial | non-placeholder | node | yes | yes | PASS | Ford installs first moving assembly line (textbook) |
| `atomic_theory_daltonian` | Industrial | non-placeholder | node | yes | yes | PASS | John Dalton - Atomic theory (textbook); John Dalton (textbook) |
| `3d_printing_additive_manufacturing` | Modern | non-placeholder | node | yes | yes | PASS | Our Story (review); The Prototyping Technology that Disrupted the World (review) |
| `additive_manufacturing_metal` | Modern | non-placeholder | node | yes | yes | PASS | The Story of EOS GmbH and Industrial 3D Printing (review); A Brief History of the Progress of Laser Powder Bed Fusion of Metals (review) |
| `advanced_optics_space_based` | Modern | non-placeholder | node | no | no | REVIEW | Adaptive optics (generic_overview) |
| `advanced_recycling_sortation` | Modern | non-placeholder | node | no | no | REVIEW | Wikipedia page for Advanced Recycling Sortation (textbook) |
| `agribusiness` | Modern | non-placeholder | node | yes | yes | PASS | Global climate and nutrition challenges (review) |
| `air_quality_monitoring` | Modern | non-placeholder | node | yes | yes | PASS | Summary of the Clean Air Act (official_agency); Air Quality System (AQS) (official_agency) |
| `api_economy` | Modern | non-placeholder | node | no | no | REVIEW | API economy (generic_overview) |
| `ballistic_missiles_icbm` | Modern | non-placeholder | node | yes | yes | PASS | R-7 (textbook) |
| `barcodes` | Modern | non-placeholder | node | yes | yes | PASS | The barcode birth (review) |
| `barcodes_inventory_systems` | Modern | non-placeholder | node | yes | yes | PASS | Supermarket Scanner (museum); 50 years of transforming tomorrow (official_agency) |
| `3d_printing_advanced` | Future | placeholder | node | no | no | REVIEW | 3D printing (generic_overview) |
| `active_support_structures` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for Active Support Structures (textbook) |
| `adaptive_climate_grids` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for Adaptive Climate Grids (textbook) |
| `advanced_nanomedicine` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for Advanced Nanomedicine (textbook) |
| `aging_research_senolytics` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for Aging Research (Senolytics & Rejuvenation) (textbook) |
| `ai_assisted_global_governance_systems` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for AI-Assisted Global Governance Systems (textbook) |
| `ai_clinical_care_networks` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for AI Clinical Care Networks (textbook) |
| `ai_cultural_memory_archives` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for AI Cultural Memory Archives (textbook) |
| `ai_governance_ethics_frameworks_robust` | Future | placeholder | node | no | no | REVIEW | AI alignment (generic_overview) |
| `ai_governed_power_markets` | Future | placeholder | node | no | no | REVIEW | Wikipedia page for AI-Governed Power Markets (textbook) |


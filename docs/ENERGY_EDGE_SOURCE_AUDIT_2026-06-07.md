# Energy Edge Source Audit: 2026-06-07

Field: `Energy Systems & Grid`

Result: 24 previously unsourced dependency edges reviewed; 23 retained with edge-level sources and one removed as an over-broad dependency. Current field coverage is 111 / 111 dependency edges with edge-level sources.

This audit improves source coverage and edge semantics. It is not proof that every Energy edge is globally correct.

| Dependent | Prerequisite | Action |
| --- | --- | --- |
| `alternating_current_power` | `electricity` | Source-checked with Britannica AC; kept as `enabling`. |
| `alternating_current_power` | `electrical_grid_early_distribution` | Source-checked with Britannica AC; kept as `historical_predecessor`. |
| `power_transformers` | `copper_wiring_production` | Source-checked with Britannica transformer; strengthened to `required`. |
| `power_transformers` | `advanced_metallurgy_medieval` | Source-checked with Britannica transformer; demoted to `common_dependency`. |
| `nuclear_fission` | `quantum_physics` | Source-checked with DOE fission; kept as `enabling`. |
| `nuclear_fission` | `scientific_method` | Source-checked with DOE fission; kept as `enabling`. |
| `nuclear_fission` | `advanced_chemistry` | Source-checked with DOE fission; kept as `enabling`. |
| `nuclear_fission` | `construction` | Removed; generic construction belongs on reactor/facility nodes, not fission itself. |
| `nuclear_fission` | `relativity_special_general` | Source-checked with DOE fission; softened to `common_dependency`. |
| `nuclear_fission` | `isotope_separation` | Source-checked with EIA fuel-cycle material; retyped to `commercial_or_scaling_dependency`. |
| `nuclear_fusion_research` | `nuclear_fission` | Source-checked with DOE fusion; retyped to `historical_predecessor`. |
| `nuclear_fusion_research` | `quantum_physics` | Source-checked with DOE fusion; kept as `enabling`. |
| `nuclear_fusion_research` | `construction` | Source-checked with DOE FES; retyped to `commercial_or_scaling_dependency`. |
| `nuclear_fusion_research` | `particle_accelerators` | Source-checked with DOE FES; kept as `enabling`. |
| `nuclear_fusion_research` | `superconductors_early` | Source-checked with DOE fusion technology; retyped to `commercial_or_scaling_dependency`. |
| `nuclear_fusion_research` | `plasma_physics` | Source-checked with DOE FES; strengthened to `required`. |
| `solar_power` | `electricity` | Source-checked with APS Bell Labs solar-cell history; strengthened to `required` for solar-electric scope. |
| `solar_power` | `scientific_method` | Source-checked with APS; kept as `enabling`. |
| `solar_power` | `electronics` | Source-checked with IEA solar deployment context; retyped to `commercial_or_scaling_dependency`. |
| `solar_power` | `semiconductors` | Source-checked with APS; kept as `required`. |
| `solar_power` | `quantum_physics` | Source-checked with APS; kept as `enabling`. |
| `solar_photovoltaics` | `semiconductors` | Source-checked with DOE PV basics; kept as `required`. |
| `solar_photovoltaics` | `solar_power` | Source-checked with IEA solar context; retyped to `historical_predecessor`. |
| `solar_photovoltaics` | `photolithography` | Source-checked with a silicon solar-cell metallization review; demoted from `required` to `commercial_or_scaling_dependency`. |

Receipts added for the semantic/topology changes that most affect graph interpretation:

- `2026-06-07-power-transformers-metallurgy-contextual`
- `2026-06-07-nuclear-fission-construction-removal`
- `2026-06-07-nuclear-fission-isotope-separation-scaling`
- `2026-06-07-fusion-superconductors-scaling`
- `2026-06-07-solar-power-electronics-scaling`
- `2026-06-07-solar-photovoltaics-photolithography-scaling`

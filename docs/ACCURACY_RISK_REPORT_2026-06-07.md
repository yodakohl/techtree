# Accuracy Risk Report: 2026-06-07

Generated with:

```sh
npm run accuracy:risks -- --markdown --limit 12
```

This is an informational risk report. It does not estimate global truth
accuracy; it identifies where manual review is likely to pay off next.

## Summary

| Metric | Value |
| --- | --- |
| Technologies | 1,664 |
| Nodes with node-level sources | 534/1,664 (32.1%) |
| Source-checked nodes | 491/1,664 (29.5%) |
| Source-checked nodes without sources | 0 |
| Source-checked nodes with only weak sources | 0 |
| Pre-1900 source-checked nodes with only generic sources | 0 |
| Era-default dates | 1,025/1,664 (61.6%) |
| Source-checked era-default dates | 99/491 (20.2%) |
| Dependency edges with edge-level sources | 1,485/5,780 (25.7%) |

## Era Default Date Debt

| Era | Nodes | Era-default date | Source-checked | Source-checked default date |
| --- | --- | --- | --- | --- |
| Ancient | 200 | 128 (64.0%) | 19 | 4 |
| Classical | 181 | 165 (91.2%) | 14 | 6 |
| Medieval | 160 | 142 (88.8%) | 6 | 0 |
| Renaissance | 150 | 148 (98.7%) | 5 | 3 |
| Industrial | 234 | 132 (56.4%) | 57 | 13 |
| Modern | 497 | 71 (14.3%) | 352 | 38 |
| Future | 242 | 239 (98.8%) | 38 | 35 |

## Next Manual Review Queue

| Priority | Node | Era | Date | Risks |
| --- | --- | --- | --- | --- |
| 70 | `agriculture` | Ancient | -10000 | source_checked_era_default_date |
| 70 | `irrigation` | Ancient | -10000 | source_checked_era_default_date |
| 70 | `plow` | Ancient | -10000 | source_checked_era_default_date |
| 70 | `water_carrying_techniques` | Ancient | -10000 | source_checked_era_default_date |
| 70 | `aqueducts` | Classical | -500 | source_checked_era_default_date |
| 70 | `concrete_road_surfaces` | Classical | -500 | source_checked_era_default_date |
| 70 | `philosophy` | Classical | -500 | source_checked_era_default_date |
| 70 | `qanat_water_supply` | Classical | -500 | source_checked_era_default_date |
| 70 | `roads` | Classical | -500 | source_checked_era_default_date |
| 70 | `water_filtration_sand_charcoal` | Classical | -500 | source_checked_era_default_date |
| 70 | `printing_press` | Renaissance | 1400 | source_checked_era_default_date |
| 70 | `probability_statistics_inference` | Renaissance | 1400 | source_checked_era_default_date |

## Interpretation

The previous manual sample removed the most obvious generic-source risk for
pre-1900 source-checked nodes. The dominant remaining risk is chronology debt:
many nodes still carry an era default date, including 99 nodes already marked
`source_checked`.

The next manual audit should start with source-checked era-default dates because
those records are most likely to look trustworthy in the UI while still carrying
coarse or inherited chronology.

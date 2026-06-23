# Random Quality Sample: 2026-06-23

This was a manual source-fit spot check over a deterministic random sample, not
a global accuracy estimate.

- Sample seed: `manual-quality-sample-2026-06-23-v1`
- Population: `source_checked` nodes with at least one node-level source
- Sample size: 8
- Method: inspect node packet, local source locator metadata, and cited source
  content for claim/date/source fit.

## Summary

- Strong pass: 5 / 8
- Fixed in this pass: 2 / 8
- Follow-up needed: 1 / 8

## Sample Results

| Node | Verdict | Notes |
| --- | --- | --- |
| `vacuum_technology_early` | Pass | AIP and Britannica support the 1855 Geissler mercury air pump anchor and later low-pressure tube context. Broad-node risk remains because the node has many dependents, but the cited chronology fits. |
| `gene_therapy_early` | Pass | NHGRI directly supports NIH gene therapy beginning on September 14, 1990, including retroviral vector transfer into cultured T cells. |
| `scientific_illustration_printing` | Pass after metadata fix | Britannica and NLM support the 1543 Vesalius printed-anatomy anchor; source locators were present under non-standard `locator` keys and were converted to `source_locator`. |
| `armored_cavalry_stirrups` | Pass | Britannica supports stirrup function, Asian steppe origins, Avar transmission context, and western European 8th-century shock-cavalry use. |
| `crystal_growth_techniques` | Pass after metadata fix | IEEE ETHW supports the 1916 Czochralski process and Computer History Museum now points to the specific grown-junction transistor page rather than the generic Silicon Engine landing page. |
| `confidential_computing` | Fixed | The previous 1983 date and generic NIST SP 800-53 source did not pin the named field. Re-anchored to the 2019 Linux Foundation Confidential Computing Consortium formation, CCC definition, and NIST IR 8320E. |
| `mechanical_clock_dials` | Fixed by downgrade | The Escapement source supports 13th-century mechanical clock mechanisms, not public dials or clock faces. Downgraded from `source_checked` to `structurally_validated` pending a direct dial source. |
| `genetic_engineering` | Follow-up | Sources support recombineering and later genome-editing method families, but the broad node and 1970s chronology should get a dedicated source-fit pass before being treated as fully settled. Added locators, but did not rescope or redate in this sample. |

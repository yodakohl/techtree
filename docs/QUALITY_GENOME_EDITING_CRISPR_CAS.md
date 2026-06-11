# Quality Snapshot: Genome Editing / CRISPR-Cas

Generated: 2026-06-10

This is a field-specific trust snapshot for the `Genome Editing / CRISPR-Cas` lens. It is a local quality gate for this field, not proof that the whole TechTree graph has the same trust level.

## Gate Results

| Metric | Current | Target | Status |
|---|---:|---:|---|
| Nodes with node-level sources | 28/28 (100.0%) | >= 95% | PASS |
| Edges with edge-level sources | 92/92 (100.0%) | >= 80% | PASS |
| Source-checked era-default dates | 0 | 0 | PASS |
| Required edges with formal receipts | 13/13 (100.0%) | 100% | PASS |
| Broad nodes with scope notes | 16/16 (100.0%) | 100% | PASS |
| All field nodes with scope notes | 28/28 (100.0%) | extra guardrail | PASS |
| Future nodes with timeframe, blockers, confidence | 3/3 (100.0%) | 100% | PASS |

## Boundary

- Field lens: `Genome Editing / CRISPR-Cas`
- Nodes: 28
- Dependency edges inside field nodes: 92
- Required edges: 13
- Source types on field nodes: museum: 4, official_agency: 6, primary_paper: 21, review: 14, textbook: 1

## Required Edge Receipts

- `base_editing` -> `cas9_programmable_nuclease`: `2026-06-10-base-editing-cas9-nuclease.json`
- `base_editing` -> `protein_engineering`: `2026-05-28-base-editing-protein-engineering.json`
- `crispr_gene_editing` -> `cas9_programmable_nuclease`: `2026-05-28-crispr-gene-editing-cas9-programmable-nuclease.json`
- `crispr_gene_editing` -> `pam_recognition_constraint`: `2026-05-29-crispr-gene-editing-pam-recognition-constraint.json`
- `ex_vivo_crispr_cell_therapy` -> `crispr_gene_editing`: `2026-06-10-ex-vivo-crispr-cell-therapy-crispr-editing.json`
- `pam_recognition_constraint` -> `cas9_programmable_nuclease`: `2026-06-10-pam-recognition-cas9-nuclease.json`
- `pam_specificity_engineering` -> `crispr_gene_editing`: `2026-06-10-pam-specificity-crispr-editing.json`
- `pam_specificity_engineering` -> `pam_recognition_constraint`: `2026-06-10-pam-specificity-pam-recognition.json`
- `pam_specificity_engineering` -> `protein_engineering`: `2026-06-10-pam-specificity-protein-engineering.json`
- `single_guide_rna_design` -> `cas9_programmable_nuclease`: `2026-05-29-single-guide-rna-design-cas9-programmable-nuclease.json`
- `talens` -> `protein_engineering`: `2026-05-31-talens-protein-engineering.json`
- `zinc_finger_nucleases` -> `protein_engineering`: `2026-05-31-zinc-finger-nucleases-protein-engineering.json`
- `zinc_finger_nucleases` -> `recombinant_dna_genetic_engineering`: `2026-06-01-zinc-finger-nucleases-recombinant-dna.json`

## Future Nodes

- `clinical_prime_editing` (Clinical Prime Editing): timeframe 2030-2038; forecastConfidence 0.42; blockers: clinically validated prime-editor delivery; editing-efficiency and bystander-edit control; long-term safety and genotoxicity evidence; regulatory demonstration beyond preclinical proof of concept
- `in_vivo_crispr_therapeutics` (In Vivo CRISPR Therapeutics): timeframe 2028-2035; forecastConfidence 0.52; blockers: safe tissue-specific delivery; durable benefit-risk evidence; off-target and immunogenicity monitoring; manufacturing and dose-control scale-up
- `tissue_targeted_editor_delivery` (Tissue-Targeted Editor Delivery): timeframe 2028-2038; forecastConfidence 0.45; blockers: cell-type targeting specificity; immune and repeat-dosing constraints; payload size and biodistribution limits; scalable delivery manufacturing

## Scope Notes

- `base_editing`: Covers nucleotide base editors that combine Cas targeting with deaminase chemistry; excludes prime editing and double-strand-break HDR editing.
- `cas12_cas13_editing_platforms`: Covers Cas12 and Cas13 editing or targeting platforms adjacent to Cas9 editing; excludes every CRISPR effector not used for programmable editing.
- `cas9_programmable_nuclease`: Covers Cas9 as an RNA-guided programmable nuclease platform for DNA targeting and cleavage; excludes all Cas enzymes and non-editing CRISPR biology.
- `casgevy_exa_cel`: Covers the approved exa-cel/Casgevy CRISPR therapy for sickle cell disease and beta-thalassemia; excludes all CRISPR medicines and all cell therapies.
- `clinical_prime_editing`: Covers therapeutic clinical use of prime editors; excludes research-only prime editing and approved non-prime CRISPR therapies.
- `crispr_adaptive_immunity`: Covers bacterial and archaeal CRISPR-Cas adaptive immunity as the discovery basis for genome-editing systems; excludes all prokaryotic immunity.
- `crispr_delivery_aav_lnp_rnp`: Covers AAV, lipid nanoparticle, and ribonucleoprotein delivery routes for CRISPR editors; excludes general drug delivery and non-CRISPR gene therapy delivery.
- `crispr_gene_editing`: Covers CRISPR-Cas9 genome editing in cells and organisms using guide-directed Cas9 activity; excludes CRISPR diagnostics and non-Cas9 editing platforms.
- `crispr_off_target_profiling`: Covers assays and computational methods for detecting unintended CRISPR edits; excludes general genotoxicity testing and all sequencing quality control.
- `crispri_crispra`: Covers dead-Cas transcriptional repression and activation platforms; excludes nuclease-active genome editing and epigenome editing broadly.
- `dna_repair_nhej_hdr`: Covers NHEJ and HDR repair pathways as mechanisms harnessed after editor-induced DNA lesions; excludes the full DNA repair field.
- `dna_synthesis_oligonucleotides`: Covers synthetic DNA oligonucleotides and short guide/template sequences used in genome-editing workflows; excludes whole-genome synthesis and industrial DNA manufacturing platforms.
- `ex_vivo_crispr_cell_therapy`: Covers CRISPR editing of cells removed from a patient before reinfusion; excludes in vivo editing and non-CRISPR cell therapies.
- `genetic_engineering`: Covers recombinant-DNA and genome-manipulation methods upstream of programmable editing; excludes all biotechnology and all breeding technologies.
- `in_vivo_crispr_therapeutics`: Covers direct in-body delivery of CRISPR editors as therapeutics; excludes ex vivo cell therapy and established non-CRISPR gene therapy.
- `pam_recognition_constraint`: Covers PAM recognition as a Cas nuclease target-site constraint; excludes broader DNA motif recognition and general transcription-factor binding.
- `pam_specificity_engineering`: Covers engineered Cas variants with altered PAM compatibility; excludes all Cas protein engineering and off-target specificity engineering.
- `pooled_crispr_screens`: Covers pooled guide-library perturbation screens read out by selection or sequencing; excludes arrayed screens and non-CRISPR genetic screens.
- `prime_editing`: Covers prime editor platforms using pegRNA and reverse transcriptase to write small sequence changes; excludes base editors and clinical deployment.
- `protein_engineering`: Covers engineering protein domains, enzymes, and variants needed for programmable nucleases and editors; excludes all protein therapeutics and general enzyme industrialization.
- `rna_interference`: Covers RNA interference as a gene-silencing platform adjacent to CRISPR screens and therapeutics; excludes all RNA regulation mechanisms.
- `single_guide_rna_design`: Covers engineered single-guide RNA architecture and target-sequence design for Cas9 editing; excludes guide design for every CRISPR effector family.
- `synthetic_biology`: Covers engineered biological circuits and systems as a CRISPR application context; excludes all bioengineering and industrial biotechnology.
- `systems_biology`: Covers network-scale analysis relevant to interpreting perturbation screens and cellular responses; excludes the full systems biology field.
- `talens`: Covers TALEN programmable genome-editing nucleases as a predecessor editing platform; excludes natural TALE biology and non-editing transcriptional tools.
- `tissue_targeted_editor_delivery`: Covers delivery systems that route genome editors to specific tissues or cell types; excludes generic viral-vector or LNP delivery without targeting specificity.
- `viral_vectors`: Covers viral delivery vehicles for gene-transfer and genome-editor payloads; excludes wild-type virology and all vaccine-vector uses.
- `zinc_finger_nucleases`: Covers engineered zinc-finger nuclease genome-editing tools; excludes zinc-finger transcription factors and natural zinc-finger biology.

## Verification Commands

`npm run edge-receipts`

`npm run audit:crispr`

`npm test`

`npm run quality`

`npm run coverage`

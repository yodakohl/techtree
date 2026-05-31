# Agent Contributions

Public log of source-backed corrections prompted by AI-agent or MoltBook review.

The first contribution unit is intentionally small: identify one falsifiable
claim, provide or prompt a source-backed correction, and let the maintainer
convert it into a validated data change.

Accepted outside PRs that include a source-backed edge claim, receipt, and
validation output are credited here. The first accepted PR from the current
one-edge challenge will be recorded as the first outside agent contribution.

## Guardrail Improvements

### 2026-05-29: Edge topology-replacement guard

- External prompt: `neo_konsi_s2bw` on MoltBook challenged whether the
  `crispr_gene_editing -> pam_specificity_engineering` edge should mean
  "cannot perform the task without it" or only "cannot perform the task well
  without it."
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/54
- Change: `npm run edge-receipts` now supports `replaced_edge` on topology
  changes and verifies that the old edge no longer exists in the current graph.
  This catches fixes that add a better edge while leaving the misleading old
  edge in place.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-29: Edge demotion-preservation guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that demoting bogus
  `required` edges is only safe if the receipt proves which concrete mechanism
  or context edges still carry the dependent technology.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/53
- Change: `npm run edge-receipts` now requires `demotion_preserves` for
  semantic retypes from `required` to a non-`required` edge type, and verifies
  that each preserved edge still exists with the expected type.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt relationship-compatibility guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that a receipt could
  cite a pristine source while pairing a weak support relationship with a strong
  edge type.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/51
- Change: `npm run edge-receipts` now checks that
  `source_shape.support_relationship` is compatible with `new_claim.type`, so
  a `required` edge cannot be justified by chronology or generic method-use
  support.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt source-shape guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that a semantic edge
  receipt could still launder weak evidence if it only required a URL-shaped
  source object.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/46
- Change: `npm run edge-receipts` now requires a `source_shape` object with
  source type, locator, claim summary, and support rationale, and checks that
  the receipt source type matches the cited edge source.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

### 2026-05-28: Edge receipt support-relationship guard

- External prompt: `neo_konsi_s2bw` on MoltBook flagged that
  `source_support_rationale` could still merely restate the source claim unless
  it named the exact support relationship.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/48
- Change: `npm run edge-receipts` now requires a finite
  `source_shape.support_relationship` value and rejects rationales that are too
  similar to the source summary or new edge note.
- Validation:
  - `npm run edge-receipts`
  - `npm test`
  - `npm run quality`

## Accepted Corrections

### 2026-05-31: TALENs protein-engineering evidence upgrade

- Strategy follow-up: issue #59 used an unfinished MoltBook edge challenge to
  test a case where a hard edge might survive the modal-scope test.
- GitHub issue: https://github.com/yodakohl/techtree/issues/59
- Old claim: `talens -> protein_engineering` was a `required` edge but still
  relied on `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. TALENs are transcription activator-like effector DNA-binding
  proteins with customized repeat arrays fused to FokI nuclease domains, so the
  platform depends on engineered protein architecture.
- Invariant preserved: this is a hard component-architecture dependency, unlike
  the broad-field edges that were demoted.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/21493687/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-31: Synthetic-biology genetic-engineering edge retype

- Strategy follow-up: issue #58 tested the modal-scope rule on another broad
  field relationship after #57 showed when a `required` edge can be preserved
  by narrowing node scope.
- GitHub issue: https://github.com/yodakohl/techtree/issues/58
- Old claim: `synthetic_biology -> genetic_engineering` was a `required` edge,
  implying the broad genetic-engineering field was necessary across all of the
  broad synthetic-biology node.
- Corrected claim: the edge is now `enabling` with `review` evidence. Genetic
  engineering remains a major toolkit and predecessor context, but synthetic
  biology also covers DNA synthesis, systems modeling, standardized parts,
  circuits, pathways, and broader design-and-assembly work.
- Invariant changed deliberately: broad field context is not treated as a hard
  prerequisite when the source supports toolkit/context rather than necessity.
- Source:
  - https://www.nature.com/articles/nrg2775
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: Single-guide RNA Cas9 architecture evidence upgrade

- External prompt: `neo_konsi_s2bw` on MoltBook sharpened the rule for
  overbroad hard edges: `required` should pass a modal-scope test across the
  dependent node's actual scope.
- GitHub issue: https://github.com/yodakohl/techtree/issues/57
- Old claim: `single_guide_rna_design -> cas9_programmable_nuclease` was a
  `required` edge but still relied on `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence. The node text is scoped to Cas9-compatible single-guide RNA design,
  and the 2012 Jinek et al. paper supports the architecture relationship:
  engineered single RNA chimeras combine guide/scaffold features to program
  Cas9 cleavage.
- Invariant preserved: this is not a claim about all CRISPR guide-RNA design
  across every Cas effector family; it is a hard architecture edge for the
  Cas9-scoped sgRNA node.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/22745249/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: Genetic-engineering recombinant-DNA edge retype

- Internal follow-up: issue #55 asked whether a broad `genetic_engineering`
  umbrella node should hard-depend on the narrower
  `recombinant_dna_genetic_engineering` method family.
- GitHub issue: https://github.com/yodakohl/techtree/issues/55
- Old claim: `genetic_engineering -> recombinant_dna_genetic_engineering` was
  a `required` edge, implying recombinant-DNA construction was necessary for
  every method covered by the broad genetic-engineering node.
- Corrected claim: the edge is now `historical_predecessor` with `review`
  evidence. Recombinant-DNA methods remain a foundational traditional method
  family, while broad genetic engineering can also include later editing and
  delivery approaches.
- Invariant changed deliberately: broad field context is not treated as a hard
  method-family prerequisite.
- Sources:
  - https://www.nature.com/articles/35093556
  - https://www.ncbi.nlm.nih.gov/books/NBK424553/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

### 2026-05-29: CRISPR-Cas9 PAM dependency split

- External prompt: `neo_konsi_s2bw` on MoltBook identified the core ambiguity
  in issue #54: engineered PAM specificity may improve targeting scope, but
  ordinary CRISPR-Cas9 editing only has a hard dependency on PAM compatibility.
- GitHub issue: https://github.com/yodakohl/techtree/issues/54
- Old claim: `crispr_gene_editing -> pam_specificity_engineering` was a
  `required` edge, implying later engineered PAM-specificity variants were a
  hard prerequisite for CRISPR-Cas9 genome editing.
- Corrected claim: `crispr_gene_editing` now requires
  `pam_recognition_constraint`, a separate source-backed node for the basic
  Cas9 target-DNA PAM constraint. `pam_specificity_engineering` now represents
  later engineered PAM-specificity variants built on CRISPR-Cas9, PAM
  recognition, and protein engineering.
- Invariant preserved: CRISPR-Cas9 editing still has a hard PAM dependency, but
  the prerequisite is the basic recognition constraint rather than a later
  optimization technology.
- Sources:
  - https://www.nature.com/articles/nature13579
  - https://www.nature.com/articles/nature14592
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-29: CRISPR-Cas9 genetic-engineering edge retype

- Internal follow-up: the CRISPR edge audit identified
  `crispr_gene_editing -> genetic_engineering` as the next required edge still
  relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/52
- Old claim: `crispr_gene_editing -> genetic_engineering` was a `required`
  edge, implying the broad genetic-engineering field was a hard component or
  method prerequisite for CRISPR-Cas9 genome editing.
- Corrected claim: the edge is now `historical_predecessor` with `review`
  evidence. The review supports genetic engineering/genome engineering as the
  broader field context while the direct hard dependencies remain on Cas9,
  guide RNA, PAM targeting, and repair biology.
- Invariant changed deliberately: broad field context is not treated as a hard
  component dependency.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/24906146/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: CRISPR-Cas9 genome-editing Cas9 dependency source

- Internal follow-up: the CRISPR edge audit identified
  `crispr_gene_editing -> cas9_programmable_nuclease` as the next required
  edge still relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/50
- Old claim: `crispr_gene_editing -> cas9_programmable_nuclease` was a
  `required` edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, now with `primary_source`
  evidence from the 2013 genome-engineering papers that demonstrate Cas9 and
  guide RNAs as the method used for early CRISPR-Cas9 genome editing.
- Invariant preserved: programmable Cas9 nuclease remains a hard component
  dependency for the CRISPR-Cas9 genome-editing node; source specificity,
  confidence, and note quality improved.
- Sources:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC3795411/
  - https://pubmed.ncbi.nlm.nih.gov/23287722/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Programmable Cas9 protein-engineering edge retype

- Internal follow-up: the CRISPR edge audit identified
  `cas9_programmable_nuclease -> protein_engineering` as the next required edge
  still relying on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/49
- Old claim: `cas9_programmable_nuclease -> protein_engineering` was a
  `required` edge, implying protein engineering was a hard prerequisite for the
  original programmable Cas9 nuclease platform.
- Corrected claim: the edge is now `enabling` with `primary_source` evidence.
  Jinek et al. 2012 supports protein engineering as relevant to Cas9 domain
  characterization and later optimization, while the core platform is
  RNA-guided Cas9 activity rather than engineered Cas9 variants.
- Invariant changed deliberately: the graph no longer treats engineered Cas9
  protein variants as required for the 2012 programmable nuclease platform.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC6286148/
- Validation:
  - `node scripts/migrate-semantic-edges.js`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing protein-engineering dependency source

- Internal follow-up: the CRISPR edge audit identified
  `base_editing -> protein_engineering` as the next required edge still relying
  on `expert_inference`.
- GitHub issue: https://github.com/yodakohl/techtree/issues/47
- Old claim: `base_editing -> protein_engineering` was a `required` edge, but
  its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence because base editors are engineered protein fusions
  combining catalytic and DNA-targeting protein components.
- Invariant preserved: edge type stayed `required`; evidence class, confidence,
  note, and source specificity improved.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing CRISPR-Cas9 genome-editing retype

- External prompt: `neo_konsi_s2bw` challenged whether an edge-count
  improvement could hide ontology drift and asked for the smallest retype
  receipt that could block a bad `base_editing` edge change.
- MoltBook thread:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/45
- Old claim: `base_editing -> crispr_gene_editing` was a `required` edge,
  implying CRISPR-Cas9 genome editing as a hard component or method prerequisite
  for base editing.
- Corrected claim: the edge is now a `historical_predecessor` with
  `primary_source` evidence. Base editing remains directly dependent on
  `cas9_programmable_nuclease` as the hard component edge.
- Invariant changed deliberately: the graph no longer treats
  double-strand-break CRISPR-Cas9 genome editing as required for base editing.
- Guard added: `npm run edge-receipts` validates semantic edge-change receipts
  in `docs/edge-change-receipts/`.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run edge-receipts`
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Base editing Cas9 dependency source

- External prompt: `neo_konsi_s2bw` on MoltBook answered issue #44's
  no-PR microtask and recommended keeping
  `base_editing -> cas9_programmable_nuclease` as `required`.
- MoltBook reply:
  https://www.moltbook.com/post/9826aa03-c768-4589-b701-f182bf620fa6
- GitHub issue: https://github.com/yodakohl/techtree/issues/44
- Old claim: `base_editing -> cas9_programmable_nuclease` was a `required`
  edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence with a specific note that cytosine base editors use
  catalytically impaired Cas9 as the programmable DNA-targeting component fused
  to a deaminase.
- Invariant preserved: edge type stayed `required`; evidence class and source
  specificity improved.
- Source:
  - https://pmc.ncbi.nlm.nih.gov/articles/PMC4873371/
- Validation:
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-28: Ex vivo CRISPR therapy edge source

- External prompt: MoltBook comparative-receipt experiment produced issue #43
  from the new CRISPR edge audit.
- GitHub issue: https://github.com/yodakohl/techtree/issues/43
- Old claim: `ex_vivo_crispr_cell_therapy -> crispr_gene_editing` was a
  `required` edge, but its evidence level was still `expert_inference`.
- Corrected claim: the edge remains `required`, but is now supported as
  `primary_source` evidence with a specific note about CRISPR-Cas9 editing of
  patient-derived cells before reinfusion.
- Source:
  - https://pubmed.ncbi.nlm.nih.gov/33283989/
- Validation:
  - `npm run audit:crispr`
  - `npm test`
  - `npm run quality`
  - `npm run coverage`

### 2026-05-27: Instruction tuning and RLHF sources

- External prompt: TechTree issue asked agents to correct the bundled
  `instruction_tuning_rlhf` node's chronology and replace a weak web source
  with primary papers.
- GitHub issue: https://github.com/yodakohl/techtree/issues/42
- Old claim: `instruction_tuning_rlhf` had a generated `firstKnownDate: 2017`
  with `datePrecision: "decade"`, `reviewStatus: "structurally_validated"`,
  and a weak OpenAI web source.
- Corrected claim: `instruction_tuning_rlhf` now has `firstKnownDate: 2020`
  with `datePrecision: "exact"`, `reviewStatus: "source_checked"`, and
  primary-paper sources covering RLHF for language-model summarization,
  instruction tuning, and instruction-following with human feedback.
- Generated consistency update: `ai_safety_alignment_methods` now has a
  no-earlier-than-2020 generated date floor because it depends on
  `instruction_tuning_rlhf`.
- Sources:
  - https://arxiv.org/abs/2009.01325
  - https://arxiv.org/abs/2109.01652
  - https://arxiv.org/abs/2203.02155
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Foundation model chronology

- External prompt: MoltBook/TechTree follow-up issue asked agents to test
  whether Foundation Models should inherit a generic neural-network or
  Transformer-era first-known date.
- GitHub issue: https://github.com/yodakohl/techtree/issues/41
- Old claim: `foundation_models` had a generated `firstKnownDate: 2017` with
  `datePrecision: "decade"` after the Transformer chronology correction. The
  original issue was opened when it still inherited `1983`.
- Corrected claim: `foundation_models` now has `firstKnownDate: 2021` with
  `datePrecision: "exact"`, matching the node's source and the named
  foundation-model framing.
- Source:
  - https://arxiv.org/abs/2108.07258
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Transformer architecture chronology

- External prompt: MoltBook challenge thread asked agents to test whether
  Transformer Architectures should really have a `1983` first-known date.
- MoltBook challenge: https://www.moltbook.com/post/e4d8f642-755d-48ea-ae54-f7d5a4bb8e59
- GitHub issue: https://github.com/yodakohl/techtree/issues/40
- Old claim: `transformer_architectures` had `firstKnownDate: 1983` with
  `datePrecision: "decade"`.
- Corrected claim: `transformer_architectures` now has `firstKnownDate: 2017`
  with `datePrecision: "exact"`, matching the node's primary source,
  "Attention Is All You Need."
- Generated consistency update: downstream AI nodes that depend on Transformer
  Architectures now have no-earlier-than-2017 generated date floors. More
  precise dates for `foundation_models` and `instruction_tuning_rlhf` remain
  tracked separately.
- Source:
  - https://proceedings.neurips.cc/paper/2017/hash/3f5ee243547dee91fbd053c1c4a845aa-Abstract.html
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Artificial Intelligence & Machine Learning" --timeout-ms 15000 --concurrency 4`

### 2026-05-27: Cas12/Cas13 edge semantics

- External prompt: Ting_Fodder on MoltBook flagged the claim that Cas12/Cas13
  platforms require CRISPR-Cas9 genome editing as overly broad.
- GitHub issue: https://github.com/yodakohl/techtree/issues/39
- Old claim: `cas12_cas13_editing_platforms` required
  `crispr_gene_editing`.
- Corrected claim: `cas12_cas13_editing_platforms` now uses
  `crispr_adaptive_immunity` as a source-backed historical predecessor. The
  `rna_interference` edge was also downgraded to a historical predecessor for
  the Cas13/RNA-targeting part of the bundled node.
- Sources:
  - https://www.broadinstitute.org/publications/broad7290
  - https://www.broadinstitute.org/publications/broad125381
- Validation:
  - `npm test`
  - `npm run quality`
  - `npm run coverage`
  - `npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4`

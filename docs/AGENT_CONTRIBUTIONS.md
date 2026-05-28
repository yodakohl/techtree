# Agent Contributions

Public log of source-backed corrections prompted by AI-agent or MoltBook review.

The first contribution unit is intentionally small: identify one falsifiable
claim, provide or prompt a source-backed correction, and let the maintainer
convert it into a validated data change.

## Guardrail Improvements

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

## Accepted Corrections

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

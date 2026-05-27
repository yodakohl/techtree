# Agent Contributions

Public log of source-backed corrections prompted by AI-agent or MoltBook review.

The first contribution unit is intentionally small: identify one falsifiable
claim, provide or prompt a source-backed correction, and let the maintainer
convert it into a validated data change.

## Accepted Corrections

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

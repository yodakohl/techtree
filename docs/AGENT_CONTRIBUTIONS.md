# Agent Contributions

Public log of source-backed corrections prompted by AI-agent or MoltBook review.

The first contribution unit is intentionally small: identify one falsifiable
claim, provide or prompt a source-backed correction, and let the maintainer
convert it into a validated data change.

## Accepted Corrections

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

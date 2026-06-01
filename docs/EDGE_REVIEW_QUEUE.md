# Edge Review Queue

This queue is the shortest path from "interested agent" to useful TechTree PR.
Pick one issue, review exactly one dependency edge, and keep the PR scoped.

## Starter Issues

| Issue | Edge | Why it matters | Likely decision shape |
| --- | --- | --- | --- |
| [#63](https://github.com/yodakohl/techtree/issues/63) | `dna_sequencing -> pcr_polymerase_chain_reaction` | Sanger sequencing predates PCR, so PCR may be workflow/scaling context rather than a hard prerequisite for broad DNA sequencing. | Demote, remove, or source as required only if the scoped claim truly breaks without PCR. |
| [#64](https://github.com/yodakohl/techtree/issues/64) | `green_hydrogen -> grid_scale_battery_storage` | Green hydrogen needs electrolysis plus low-carbon electricity; grid batteries look like integration/scaling context, not a hard prerequisite. | Remove or retype to enabling/scaling if source support exists. |
| [#65](https://github.com/yodakohl/techtree/issues/65) | `through_silicon_vias -> advanced_semiconductor_packaging_2_5d_3d` | TSVs are often used by 3D/2.5D packaging, so the current direction may be wrong or too broad. | Replace direction, retype as context, or source the existing edge if correct. |

## Done Means

A starter PR is useful when it includes:

- the old edge claim and new edge claim
- one specific source URL plus locator
- the exact source relationship to the edge
- an adversarial check naming the strongest reason the PR could be wrong
- an edge-change receipt if the claim changes
- validation output from:

```bash
npm run edge-receipts
npm test
npm run quality
npm run coverage
```

If a source-heavy field changes, also run the relevant focused URL audit:

```bash
npm run source-urls -- --field "Field Name" --timeout-ms 15000 --concurrency 4
```

## What Not To Do

- Do not add broad unsourced technology batches.
- Do not fix multiple unrelated edges in one starter PR.
- Do not preserve a `required` edge unless the source passes the absence-breaks
  test: without the prerequisite, the scoped dependent technology cannot exist
  as described.
- Do not invent a replacement edge just because a receipt needs topology. Use
  `removed_edge: true` when the source rejects the direct dependency.

See [Adversarial Edge Review](ADVERSARIAL_EDGE_REVIEW.md) for the reviewer
checklist used to reject receipt-shaped but unsupported diffs.

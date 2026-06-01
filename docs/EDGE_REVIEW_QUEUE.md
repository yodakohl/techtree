# Edge Review Queue

This queue is the shortest path from "interested agent" to useful TechTree
work. A pull request is best, but a source-locator reply is also useful if it
makes a falsifiable edge decision. See
[Source-Locator Contributions](SOURCE_LOCATOR_CONTRIBUTIONS.md).

## Starter Issues

No starter issues are currently queued. Add the next suspicious single-edge
task when a review packet identifies a source-checkable dependency claim.

## Completed Starters

| Issue | Edge | Outcome |
| --- | --- | --- |
| [#65](https://github.com/yodakohl/techtree/issues/65) | `through_silicon_vias -> advanced_semiconductor_packaging_2_5d_3d` | Replaced direction. TSVs now enable 2.5D/3D advanced packaging rather than depending on the broad packaging category. |
| [#63](https://github.com/yodakohl/techtree/issues/63) | `dna_sequencing -> pcr_polymerase_chain_reaction` | Removed. Broad DNA sequencing predates PCR and includes non-PCR template routes. The pass also removed the time-reversed `recombinant_dna_genetic_engineering -> pcr_polymerase_chain_reaction` edge. |
| [#64](https://github.com/yodakohl/techtree/issues/64) | `green_hydrogen -> grid_scale_battery_storage` | Removed. Green hydrogen depends on electrolysis and low-emissions electricity; grid batteries are integration context rather than a direct prerequisite. |

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

## No-PR Path

If GitHub setup is the bottleneck, use this command to generate a packet and
post it into an external thread:

```bash
npm run edge-packet -- green_hydrogen grid_scale_battery_storage --issue 64
```

The minimum useful reply is a source URL, exact locator, edge decision, and
adversarial note.

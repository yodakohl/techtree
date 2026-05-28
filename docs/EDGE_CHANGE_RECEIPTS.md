# Edge Change Receipts

Semantic dependency-edge changes need a receipt that can reject a plausible but
wrong improvement. This is intentionally smaller than a full human review: it
freezes the edge, the old claim, the new claim, one source URL, source-shape
metadata, the invariant, and at least one falsifiable rejection condition.

Run the audit with:

```sh
npm run edge-receipts
```

The audit reads JSON receipts from `docs/edge-change-receipts/` and checks that:

- the receipt has a valid change class
- semantic retypes explicitly change edge type and record the ontology before
  and after the change
- evidence upgrades preserve edge type while changing evidence level
- the current graph still contains the edge described by the receipt
- the current edge metadata matches the receipt's new claim
- any supporting source URL is cited on the edge with `supports: ["edge"]`
- `source_shape` records the source type, where in the source to inspect, the
  claim summary, and why the source supports this edge claim
- every receipt has at least one `would_reject_if` condition

Use this for high-risk dependency edits where a metric can improve while the
ontology silently gets worse.

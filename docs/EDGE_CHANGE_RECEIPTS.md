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
- `source_shape` records the source type, support relationship, where in the
  source to inspect, the claim summary, and why the source supports this edge
  claim
- `source_support_rationale` is not just a restatement of the source summary or
  new edge note
- a `required` to non-`required` semantic retype lists `demotion_preserves`
  edges that still carry the dependent technology's concrete mechanism or
  field context, and those edges still exist with the expected types
- every receipt has at least one `would_reject_if` condition

Allowed `support_relationship` values:

- `describes_component_architecture`
- `demonstrates_method_dependency`
- `establishes_historical_lineage`
- `documents_application_use`
- `documents_approval_or_deployment`
- `supports_chronology`
- `reviews_field_relationship`

Relationship values are intentionally not interchangeable. `npm run
edge-receipts` enforces asymmetric compatibility with the edge type:

- `required`: `describes_component_architecture` or
  `documents_approval_or_deployment`
- `enabling`: `describes_component_architecture`,
  `demonstrates_method_dependency`, `documents_application_use`, or
  `reviews_field_relationship`
- `accelerates`: `documents_application_use` or `reviews_field_relationship`
- `historical_predecessor`: `establishes_historical_lineage`,
  `supports_chronology`, or `reviews_field_relationship`
- `common_dependency`: `supports_chronology` or `reviews_field_relationship`
- `commercial_or_scaling_dependency`: `describes_component_architecture`,
  `documents_application_use`, `documents_approval_or_deployment`, or
  `reviews_field_relationship`
- `speculative`: `supports_chronology` or `reviews_field_relationship`

Use this for high-risk dependency edits where a metric can improve while the
ontology silently gets worse.

For demotions from `required` to any non-`required` edge type, include
`demotion_preserves`:

```json
"demotion_preserves": [
  {
    "prerequisite": "cas9_programmable_nuclease",
    "type": "required",
    "reason": "Cas9 remains the programmable DNA-cutting component."
  }
]
```

This prevents a demotion receipt from merely making the graph more permissive.
The receipt must name the concrete edges that still carry the mechanism or
field context after the broad edge is weakened.

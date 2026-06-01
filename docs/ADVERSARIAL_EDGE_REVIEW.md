# Adversarial Edge Review

One-edge PRs are small enough to inspect, but small does not mean trustworthy.
The review question is not "did the receipt look complete?" The question is:

> Can this PR survive an adversarial reader checking the source against the
> exact edge verb?

Use this checklist before merging any semantic edge change.

## Reviewer Tests

1. **Absence-breaks test**
   - For `required`, removing the prerequisite must break the scoped dependent
     technology as described.
   - If the source only shows usefulness, adoption, cost reduction, or common
     practice, the edge is not `required`.

2. **Endpoint-scope test**
   - Check that the source supports this dependent node, this prerequisite node,
     and this direction.
   - Broad field nodes must not be used as hard prerequisites for narrower
     products unless the dependent node is explicitly scoped that way.

3. **Relationship-verb test**
   - The source must support the relationship verb, not just mention both
     endpoint nouns.
   - Component architecture, method dependency, deployment dependency, lineage,
     scaling, and shared context are different claims.

4. **Counterexample test**
   - Ask whether the dependent technology existed or can exist without the
     prerequisite.
   - A known earlier date for the dependent node, or a source-backed alternate
     path, is enough to reject a hard dependency.

5. **Receipt-binding test**
   - The receipt's `new_claim` or `new_claim_absent` must match the current
     graph state.
   - The source URL must be cited on the edge when `source_supports_edge` is
     `yes` or `partial`.
   - `would_reject_if` must contain a realistic condition that could overturn
     the decision.

## What Mechanical Validation Covers

`npm run edge-receipts` checks the graph/receipt binding:

- current edge metadata matches the receipt's new claim
- removed or replaced edges are absent when the receipt says so
- source type and support relationship are compatible with the edge type
- required-edge demotions name preserved mechanism/context edges
- source rationale is not just a restatement of the source summary or edge note

## What Mechanical Validation Does Not Cover

The audit does not prove the external source is interpreted correctly. A
plausible-looking receipt can still be wrong if the source locator does not
support the edge verb.

That is why each starter PR should include an adversarial note:

```markdown
## Adversarial Check

- Why this source licenses the edge verb:
- Strongest reason this PR could be wrong:
- What source or counterexample would overturn it:
```

If this section is hand-wavy, the PR is not ready.

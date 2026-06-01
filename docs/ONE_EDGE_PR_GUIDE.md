# One-Edge PR Guide

This is the smallest useful TechTree contribution: improve exactly one
dependency edge so another agent can reproduce the decision from the diff,
source, receipt, and validation output.

Use this when a GitHub issue asks for an edge review such as:

```text
dependent_technology -> prerequisite_technology
```

## Success Condition

A good one-edge PR answers one narrow question:

> If the prerequisite is absent, what exactly breaks?

The answer must be visible in the edge type, source metadata, edge note, and
receipt. Do not expand the dataset or fix adjacent issues in the same PR.

## Fast Path

1. Claim one open `data-quality` issue.
2. Inspect the dependent node, prerequisite node, and existing edge:

```bash
rg -n '"id": "dependent_technology"|"prerequisite": "prerequisite_technology"' data
```

3. Decide the edge type with the absence-breaks test:
   - `required`: absence breaks the scoped technology claim.
   - `enabling`: absence does not break the technology, but makes it weaker,
     narrower, less practical, or less capable.
   - `accelerates`: the edge mainly changes speed, cost, throughput, or
     adoption.
   - `historical_predecessor`: the prerequisite is lineage or prior field
     context, not a component.
   - `common_dependency`: both nodes share foundations but neither depends on
     the other.
   - `commercial_or_scaling_dependency`: the edge is about deployment,
     manufacturing, regulation, supply chain, or market scaling.
   - `speculative`: the relationship is not established enough to trust.
4. Find one source that supports the relationship verb, not just both endpoint
   nouns. Prefer a primary paper, patent, standard, approval document, review,
   textbook, official agency, or museum source.
5. Update only the relevant node edge and edge source.
6. Add an edge-change receipt under `docs/edge-change-receipts/` when the edge
   type, evidence level, confidence, source, or topology changes.
7. Run:

```bash
npm run edge-receipts
npm test
npm run quality
npm run coverage
```

For source-heavy field work, also run the relevant URL audit, for example:

```bash
npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4
```

## Source Test

The source must license the edge claim:

- Component architecture source -> can support `required`.
- Method or deployment source -> can support `required` if absence breaks the
  scoped technology.
- Review lineage source -> usually supports `historical_predecessor`.
- Adoption, throughput, or cost source -> usually supports `accelerates` or
  `commercial_or_scaling_dependency`.
- Generic overview source -> usually supports the node, not a specific hard
  dependency.

If the source only says "X uses Y sometimes," do not make the edge `required`.

## Receipt Shape

For semantic edge changes, include a receipt with:

```json
{
  "edge": {
    "dependent": "dependent_technology",
    "prerequisite": "prerequisite_technology"
  },
  "old_claim": {
    "type": "required",
    "evidence_level": "expert_inference"
  },
  "new_claim": {
    "type": "enabling",
    "evidence_level": "review"
  },
  "source_supports_edge": "yes",
  "source_url": "https://example.org/source",
  "source_shape": {
    "source_type": "review",
    "support_relationship": "reviews_field_relationship",
    "source_locator": "Abstract or section inspected.",
    "source_claim_summary": "What the source says.",
    "source_support_rationale": "Why that statement licenses this edge type."
  },
  "invariant_preserved_or_changed": "State what still carries the hard mechanism, or what changed.",
  "would_reject_if": [
    "A better source shows the old hard dependency is actually necessary."
  ],
  "validation_commands": [
    "npm run edge-receipts",
    "npm test",
    "npm run quality",
    "npm run coverage"
  ]
}
```

If a `required` edge is demoted, add `demotion_preserves` naming the remaining
required mechanism edge or explain why no hard mechanism edge should remain.

For topology replacements, add `replaced_edge` so validation proves the old
misleading edge was removed. For pure removals, set `removed_edge: true`,
replace `new_claim` with `new_claim_absent`, set `source_supports_edge` to
`"no"`, and use `refutes_dependency` in `source_shape.support_relationship`.

## PR Body

Use this minimal PR body:

```markdown
## Edge

`dependent_technology -> prerequisite_technology`

## Decision

- Old: `type / evidence_level / confidence`
- New: `type / evidence_level / confidence`

## Evidence

- Source:
- Source relationship:
- Why the source supports this edge type:

## Invariant

What still carries the hard mechanism, or what deliberately changed?

## Validation

- [ ] `npm run edge-receipts`
- [ ] `npm test`
- [ ] `npm run quality`
- [ ] `npm run coverage`
```

## Review Bar

The PR is ready when the reviewer can disagree with the source interpretation
without needing to trust the agent's prose. The diff should contain the claim,
the source should support the claim, and the commands should verify the graph.

# Edge Review Playbook

Use this playbook when reviewing one dependency edge. The goal is not to make a
plausible graph. The goal is to make a graph where a reader can tell what kind
of dependency is being claimed and why the source supports that exact claim.

## Core Question

For an edge `dependent -> prerequisite`, ask:

> If the prerequisite is absent, what exactly breaks?

That answer determines the edge type.

## Edge Types

Use `required` only when absence breaks the scoped technology claim. The source
must support a component, method, approval, or deployment dependency directly.
Example: CRISPR-Cas9 genome editing requires Cas9 nuclease activity and PAM
compatibility.

Use `enabling` when the prerequisite makes the technology practical, easier,
broader, safer, or more capable, but the dependent technology can still exist
without it.

Use `accelerates` when the prerequisite mainly improves adoption speed,
iteration speed, cost, throughput, or performance.

Use `historical_predecessor` when the prerequisite is a lineage or prior field,
not a component. Do not use this to hide a real hard dependency.

Use `common_dependency` when two technologies share foundations but one does not
meaningfully depend on the other.

Use `commercial_or_scaling_dependency` when the dependency is about deployment,
manufacturing, logistics, regulation, supply chain, or market scaling rather
than scientific feasibility.

Use `speculative` for future or weakly supported relationships that should not
be treated as established dependencies.

## Evidence Levels

Use `primary_source` when the edge is supported by a paper, patent, standard,
approval document, or direct historical source.

Use `review` or `textbook` when the source synthesizes the field and supports a
relationship such as lineage, common dependency, or broad enabling context.

Use `expert_inference` only when the claim is defensible but not yet tied to a
specific source. Treat `required` plus `expert_inference` as review debt.

Use `weak_inference` or `speculative` only when the relationship should be kept
visible but not trusted as established.

## Source Test

A source supports an edge only if it supports the relationship verb, not merely
both endpoint nouns.

For each source, record:

- `source_type`: primary paper, review, textbook, official agency, museum,
  generic overview, or weak web.
- `supports`: usually `edge`; use `node` or `maturity` only when the source does
  not support the dependency.
- `source_shape.support_relationship`: the exact way the source supports the
  edge, such as `describes_component_architecture` or
  `establishes_historical_lineage`.
- `source_support_rationale`: why that support relationship licenses the edge
  type.

Reject a receipt if the source only says "X mentions Y" while the edge says
"X requires Y."

## Scope Check

Before preserving a hard edge, compare the endpoint scopes. A broad field should
not usually depend on one narrower method family as `required`.

Example: `genetic_engineering -> recombinant_dna_genetic_engineering` is a
`historical_predecessor` edge when `genetic_engineering` means the broad field.
It would only be `required` if the dependent node were scoped narrowly to
recombinant-DNA construction.

## Demotions

When demoting `required` to a weaker edge type, include
`demotion_preserves`. It must name the remaining edge or edges that still carry
the concrete mechanism.

Good demotion:

```json
"demotion_preserves": [
  {
    "prerequisite": "cas9_programmable_nuclease",
    "type": "required",
    "reason": "Cas9 remains the programmable DNA-cutting component."
  }
]
```

Bad demotion: weakening a hard edge and leaving no required mechanism behind.

## Topology Replacements

Sometimes the old prerequisite node is the wrong scope. Do not relabel it in
place if that would erase a real later technology. Add or use the precise node,
move the edge, and include `replaced_edge` in the receipt.

Example:

```json
"edge": {
  "dependent": "crispr_gene_editing",
  "prerequisite": "pam_recognition_constraint"
},
"replaced_edge": {
  "dependent": "crispr_gene_editing",
  "prerequisite": "pam_specificity_engineering"
}
```

The invariant is: ordinary CRISPR-Cas9 editing needs PAM compatibility, not
later engineered PAM-specificity variants.

## One-Edge PR Shape

1. Name the exact old edge and claim.
2. Decide whether the endpoint nodes have the right scope.
3. Choose the edge type using the absence-breaks test.
4. Add or replace one source that supports the relationship verb.
5. Add a receipt under `docs/edge-change-receipts/` for semantic or topology
   changes.
6. Run validation:

```bash
npm run edge-receipts
npm run audit:crispr
npm test
npm run quality
npm run coverage
```

For source-heavy field changes, also run:

```bash
npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4
```

## Reviewer Checklist

- The edge note says what breaks or what improves.
- The source supports the edge verb, not just the endpoint topics.
- `required` edges are not broad-field, product-to-component, or future-to-past
  shortcuts.
- Later optimization technologies are not prerequisites for earlier base
  technologies.
- The receipt has at least one rejection condition that could falsify the
  change.

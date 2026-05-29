# Contributing to TechTree

TechTree needs small, source-backed corrections more than large unreviewed
expansions. The highest-value contribution is one disputed technology edge,
reviewed carefully enough that another agent or maintainer can reproduce the
decision.

## Best First Contribution

Pick one edge from an audit queue or GitHub issue and answer:

- Is the dependency real?
- Is the edge type correct?
- Is the evidence level supported by the cited source?
- Does the source support the edge, the node, maturity, or only background
  context?

Good first PRs usually change one edge, one source, and one receipt.

## One-Edge PR Checklist

1. Open or claim a GitHub issue for the exact edge, for example
   `crispr_gene_editing -> pam_specificity_engineering`.
2. Read the current dependent node, prerequisite node, and edge in `data/`.
3. Decide whether the edge should be:
   - `required`
   - `enabling`
   - `accelerates`
   - `historical_predecessor`
   - `common_dependency`
   - `commercial_or_scaling_dependency`
   - `speculative`
4. Add a specific source. Prefer primary papers, reviews, textbooks, official
   agencies, or museums over generic web overviews.
5. If the edge claim changes, add a JSON receipt in
   `docs/edge-change-receipts/`.
6. If a `required` edge is demoted, include `demotion_preserves` so the receipt
   proves which concrete mechanism or context edges remain.
7. Run validation:

```bash
npm run edge-receipts
npm test
npm run quality
npm run coverage
```

For source-heavy field work, also run:

```bash
npm run source-urls -- --field "Genome Editing / CRISPR-Cas" --timeout-ms 15000 --concurrency 4
```

## What We Will Reject

- Bulk additions without sources.
- Broad field nodes used as hard prerequisites for specific components without
  direct evidence.
- Product/application nodes used as prerequisites for their underlying
  components.
- Future or later technologies used as prerequisites for earlier technologies.
- Generic overview sources used to support specific historical or technical
  edge claims.
- Receipts where the source summary, rationale, and edge note all say the same
  thing in different words.

## Useful Agent Workflow

AI agents are welcome, but the bar is evidence, not prose. A useful agent PR
should include:

- the exact old claim
- the exact new claim
- one source URL
- the source relationship to the edge
- the invariant preserved or deliberately changed
- validation output

The final claim should be inspectable from the diff and commands, not from the
agent's confidence.

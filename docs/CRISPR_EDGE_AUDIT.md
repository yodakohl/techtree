# CRISPR-Cas Edge Audit

This audit is the first repo-side test of the comparative-receipt workflow from
the AI public works discussion.

Run it with:

```sh
npm run audit:crispr
```

For machine-readable output:

```sh
node scripts/audit-crispr-edge-quality.js --json
```

## What It Freezes

The audit surface is all `dependencyEdges` on nodes whose `fields` include
`Genome Editing / CRISPR-Cas`.

The script reports:

- baseline node and edge counts
- evidence-level counts
- edge-type counts
- hard blockers such as missing prerequisites or non-speculative time reversals
- review candidates, especially high-confidence `required` edges that still rely
  on `expert_inference`

## Current Purpose

This is a Task A artifact: it freezes an evaluation surface and baseline. It
does not claim the CRISPR-Cas data improved.

A useful follow-up PR should pick one review candidate and leave a receipt:

- old edge claim
- new edge claim
- source URL supporting the edge
- validation command output
- whether the edge remains `required`, becomes `enabling`, or should use another
  edge type
- for semantic retypes, a minimal edge-change receipt in
  `docs/edge-change-receipts/` that states the old ontology, new ontology,
  preserved or changed invariant, and rejection conditions

This keeps "improve CRISPR data quality" falsifiable instead of relying on a
general before/after claim.

# Graph Invariants

Graph invariants are adversarial postconditions for data corrections. They
name the causal behavior that must stay true after future imports, migrations,
or agent edits.

Use them when a correction needs more than "some diff happened":

- a named false path must be absent
- a nearby true path must remain present
- a typed edge must keep the intended relationship verb
- a source-backed date must not regress to a generated placeholder

Run all invariants against canonical JSON:

```bash
npm run graph-invariants
```

Run the same invariants against the served API after restarting the app:

```bash
npm run graph-invariants -- --api http://localhost:3000/api/tech-tree
```

Invariant files live in `docs/graph-invariants/`. Keep each file small and
falsifiable. A good invariant is not a restatement of the patch; it is the
smallest adversarial query that would fail if the graph rerouted the same
mistake through another node.

Good candidates for new invariant files are receipt-backed corrections that
removed or reversed a dependency edge. Preserve both sides of the intended
meaning: add at least one negative check for the false edge or path and one
positive check for the true nearby path that should remain.

Receipt-backed topology and semantic changes are tracked by:

```bash
npm run invariant-coverage
```

That audit fails when a removed edge, replaced edge, or semantic edge retype in
`docs/edge-change-receipts/` lacks a matching graph invariant.

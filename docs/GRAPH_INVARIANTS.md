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

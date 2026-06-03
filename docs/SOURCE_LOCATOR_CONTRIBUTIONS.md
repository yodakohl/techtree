# Source-Locator Contributions

External agents do not need to start with a pull request. A source-locator
reply is enough if it gives a maintainer a falsifiable edge or node-scope
decision.

Use this path when GitHub setup is the bottleneck.

## Minimum Useful Edge Reply

```text
Edge decision: required | enabling | accelerates | historical_predecessor | common_dependency | commercial_or_scaling_dependency | speculative | no edge
Source URL:
Source locator: section / abstract / figure / table inspected
Why this source licenses the edge verb:
Strongest reason this decision could be wrong:
What breaks if the prerequisite is absent:
```

The reply is not useful if it only says the project is important, the source is
interesting, or the edge "seems plausible." It must make a claim another agent
can dispute.

## Minimum Useful Node-Scope Reply

Use this when the suspected error is not one edge, but an overloaded node such
as a broad field being used as a product, component, manufacturing process, or
scaling dependency.

```text
Decision: split | keep-and-rescope | remove-specific-edge | add-specific-node | no change
Scope lock:
Wrong edge(s):
Source URL:
Source locator:
Why this source pins the scope:
Global ontology check:
Dependent nodes to rewire:
Strongest reason this decision could be wrong:
```

A node-scope reply is not useful if it fixes one local caption while leaving
neighboring prerequisites and dependents with the same confused boundary.

## Generate A Packet

Maintainers can generate a compact review packet for one edge:

```bash
npm run edge-packet -- green_hydrogen grid_scale_battery_storage --issue 64
```

For a broad or suspicious node, generate a node-scope packet:

```bash
npm run node-packet -- semiconductors --issue 66
```

Post the packet where agents are already discussing the work. Good replies can
then become credited GitHub issues, edge-change receipts, node-scope receipts,
or PRs.

## Credit

If a source-locator reply leads to a merged correction, credit the source in
`docs/AGENT_CONTRIBUTIONS.md` with:

- contributor handle
- original discussion link
- edge reviewed
- source URL and locator
- commit or PR URL

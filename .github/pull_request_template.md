## Change

- Type: `data | code | documentation | generated artifacts`
- Edge or node changed:
- Issue:

For one-edge corrections, follow `docs/ONE_EDGE_PR_GUIDE.md`.

## Evidence

For data changes:

- Source URL:
- Source type: `primary_paper | review | textbook | official_agency | museum | generic_overview | weak_web`
- Supports: `node | edge | roadmap | maturity`

## Semantic Claim

- Old claim:
- New claim:
- Invariant preserved or changed:

For `required` edge demotions, list the mechanism/context edges preserved:

- `dependent -> prerequisite` remains `type` because ...

## Adversarial Check

- Why this source licenses the edge verb:
- Strongest reason this PR could be wrong:
- What source or counterexample would overturn it:

## Validation

- [ ] `npm run agent:check -- --run`
- [ ] `npm run edge-receipts`
- [ ] `npm test`
- [ ] `npm run quality`
- [ ] `npm run coverage`
- [ ] `git diff --check`
- [ ] Source URL audit if source-heavy

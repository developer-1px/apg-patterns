# @interactive-os/interaction Interface Stability

This package is pre-1.0. The contract below is the intended package boundary
while the API is hardened against APG demo shell and product shell usage.

## Permanent Direction

- The root entry stays React-free.
- React support stays behind `@interactive-os/interaction/react`.
- The package coordinates ownership; it does not implement APG pattern
  internals.
- The package does not import `@interactive-os/aria`.
- Core decisions are inspectable data before mutation: route results, focus
  guard results, diagnostics snapshots, and restore targets.
- Browser event adapters are optional helpers around the pure routing and focus
  guard functions.

## Stable Concepts

- An interaction owner is the current scope allowed to interpret keys.
- Owner kinds are `pattern`, `temporary-control`, and `shell`.
- Temporary owners can restore the previous owner through declared restore keys.
- Native text targets are protected from pattern and shell shortcuts unless the
  shell explicitly opts into a different policy.
- Focus guard decisions report whether to restore the active owner, activate a
  declared target owner, allow native focus, or do nothing.
- Diagnostics explain active owner, owner stack, DOM focus, route reason,
  matched key rule, restore target, and focus guard action.

## Breaking Change Rule

Before 1.0, changes may still refine names and object shapes. Treat a change as
breaking when it removes an entrypoint, moves React into the root entry, removes
CommonJS or ESM output, removes declaration output, or makes the package depend
on `@interactive-os/aria`.

## Validation Gates

Use the package-local gate before treating a change as complete:

```bash
npm run check
```

From the repository root:

```bash
npm run check:interaction
```

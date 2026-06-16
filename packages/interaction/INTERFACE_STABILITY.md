# @interactive-os/interaction Interface Stability

This package is pre-1.0. The contract below is the intended package boundary
while the API is hardened against APG demo shell and product shell usage.

## Permanent Direction

- The root entry stays React-free.
- `@interactive-os/interaction/runtime` stays React-free and Zod-free.
- `@interactive-os/interaction/definition` owns Zod schemas, validation, and
  checked compile.
- `@interactive-os/interaction/apg` owns APG structural adapters. It stays
  outside the core runtime entrypoint and must remain React-free and Zod-free.
- React support stays behind `@interactive-os/interaction/react`.
- The package coordinates ownership; it does not implement APG pattern
  internals.
- The package does not import `@interactive-os/aria`.
- Core decisions are inspectable data before mutation: route results, focus
  guard results, diagnostics snapshots, and restore targets.
- Runtime-first owner shortcuts are the preferred first-use contract.
  Serializable owner definitions remain the validation, catalog, and generated
  definition contract.
- APG bridge helpers may accept APG-shaped structural contracts, but they stay
  in the interaction package and must not import `@interactive-os/aria`.
- Callback owners remain an adapter surface while the runtime and definition
  layers harden.
- Browser event adapters are optional helpers around the pure routing and focus
  guard functions.

## Public Surface Table

| Surface | Tier | Good | Still weak |
| --- | --- | --- | --- |
| `@interactive-os/interaction/runtime` | Permanent core | React-free, Zod-free, decision-oriented owner/route/focus APIs | Callback owner shortcuts are convenient but less serializable than owner definitions |
| `@interactive-os/interaction/definition` | Permanent validation/catalog | Serializable definitions, strict schemas, checked compile, schema boundary is explicit | Broad `kind` vocabulary still needs long-term naming pressure from real APG/product shells |
| `@interactive-os/interaction/apg` | Standard adapter | APG-shaped keyboard/focus contracts map to interaction owners without depending on `@interactive-os/aria` | Adapter shape is newer than the core runtime; keep it off the root/runtime aggregate while it hardens |
| `@interactive-os/interaction/react` | Framework adapter | React stays optional and out of the root/runtime entries | Hook ergonomics depend on more product-shell usage before calling it permanent |
| `@interactive-os/interaction` | Compatibility aggregate | React-free migration path for existing imports | Bundle-sensitive and 30-year API docs should prefer explicit subpaths |

## Stable Concepts

- An interaction owner is the current scope allowed to interpret keys.
- Owner kinds are `pattern`, `temporary-control`, and `shell`.
- Temporary owners can restore the previous owner through declared restore keys.
- Native text targets are protected from pattern and shell shortcuts unless the
  shell explicitly opts into a different policy.
- Zod schemas validate owner definitions, key rules, structured conditions,
  target policies, focus lifecycle, shell rules, action descriptors, and
  serializable action params.
- Matched routes expose the matched action descriptor so host shells can
  dispatch effects without reading callback closures.
- APG bridge owners route pattern keyboard ownership only; APG runtimes remain
  responsible for local pattern state transitions and semantic props.
- Platform-specific bindings are selected only when route input declares a
  platform; otherwise the base key rule is used. Runtime shortcut `primary`
  bindings compile to platform-specific Meta/Control rules.
- `code`, `preventDefault`, and `stopPropagation` are executable parts of a
  key rule, not documentation-only fields.
- Focus guard decisions report whether to restore the active owner, activate a
  declared target owner, allow native focus, or do nothing.
- Diagnostics explain active owner, owner stack, DOM focus, route reason,
  matched key rule, restore target, and focus guard action.

## Breaking Change Rule

Before 1.0, changes may still refine names and object shapes. Treat a change as
breaking when it removes an entrypoint, moves React into the root entry, removes
CommonJS or ESM output, removes declaration output, adds Zod to the runtime
subpath, or makes the package depend on `@interactive-os/aria`.

## Validation Gates

Use the package-local gate before treating a change as complete:

```bash
npm run check
```

From the repository root:

```bash
npm run check:interaction
```

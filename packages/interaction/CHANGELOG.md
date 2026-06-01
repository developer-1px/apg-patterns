# @interactive-os/interaction Changelog

## 0.1.0

### Runtime Entrypoint

- Added package-level build, exports, docs, and packed consumer smoke coverage.
- Added `./runtime` and `./definition` subpaths so Zod-free runtime usage can
  avoid Zod-backed definition schemas.
- Added trusted static definition compile APIs:
  `createInteractionOwner`, `compileInteractionOwnerUnchecked`, and
  `compileInteractionOwnersUnchecked`.
- Added runtime shortcut APIs: `createInteractionRouter`, `shellOwner`, and
  `temporaryControl`.
- Added command-palette-first runtime docs that model the closed state, shell
  shortcut opening, temporary-control activation, typed local actions, and
  restore.
- Added typed action helpers: `createInteractionActions`,
  `isInteractionAction`, `getInteractionAction`, and
  `getInteractionRouteAction`.
- Added primary modifier/platform helpers and DOM adapter platform options.
- Made key target classification safe when DOM constructors such as `Element`
  are not installed globally.

### Ownership Primitives

- Added React-free ownership registry, key routing, focus guard decisions,
  keyboard event adapters, and diagnostics.
- Added matched route metadata for action descriptors, prevent-default policy,
  stop-propagation policy, route reasons, restore targets, and owner ids.

### Definition Entrypoint

- Added Zod-backed serializable owner definition schemas, structured
  conditions, focus lifecycle descriptors, target policies, and compile
  adapters for the current owner registry.
- Added matched action descriptors and explicit platform-aware key routing
  inputs for declarative key rules.
- Aligned declarative `code`, `preventDefault`, `stopPropagation`, and
  owner `priority` fields with runtime behavior and test coverage.

### React

- Added optional React provider and hooks behind the `./react` subpath.

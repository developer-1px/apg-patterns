# Agent Notes

- This package is the canonical APG pattern package: serializable WAI-ARIA APG definitions, the React-free runtime, and React adapters.
- Keep runtime dependencies narrow. The core/root entries stay React-free; React belongs behind the React subpath and optional peer surface.
- Do not import or depend on legacy kernel or legacy APG facade packages. `npm run check:independence` enforces the exact package names and paths.
- New public pattern work should move as a full vertical slice: schema/data contract, definition, runtime behavior, React adapter or preset when applicable, demo/source metadata, API docs, and tests.
- Before finishing package-boundary work, run `npm run check:independence`, `npm run typecheck`, and the relevant tests. For release or public API changes, run `npm run check`.

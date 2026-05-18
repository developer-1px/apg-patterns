# Bug 082: Menubar submenu label id is manually reconstructed

- Category: demo-id
- Evidence: `demo/src/patterns/menu/Menubar.tsx:49`
- Impact: The submenu uses menubar-${ownerKey} instead of the runtime id resolver, so custom prefixes break aria-labelledby.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

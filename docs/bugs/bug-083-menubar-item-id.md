# Bug 083: Menubar demo item id is manually reconstructed

- Category: demo-id
- Evidence: `demo/src/patterns/menu/Menubar.tsx:68`
- Impact: The demo hardcodes menubar-${itemKey}, diverging from runtime ids when a custom prefix is supplied.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

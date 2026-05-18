# Bug 080: Combobox popup id is hardcoded by the demo contract

- Category: demo-id
- Evidence: `demo/src/patterns/combobox/Combobox.tsx:23`
- Impact: Multiple combobox demos on one page produce duplicate listbox ids referenced by aria-controls.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

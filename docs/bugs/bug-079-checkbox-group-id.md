# Bug 079: Checkbox demo group label id is hardcoded

- Category: demo-id
- Evidence: `demo/src/patterns/checkbox/Checkbox.tsx:47`
- Impact: Rendering the checkbox demo twice creates duplicate group-label ids and breaks aria-labelledby resolution.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

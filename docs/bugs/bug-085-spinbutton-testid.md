# Bug 085: Spinbutton test ids interpolate raw keys

- Category: demo-id
- Evidence: `demo/src/patterns/spinbutton/Spinbutton.tsx:50`
- Impact: Raw key interpolation in data-testid makes test selectors unstable for non-slug keys.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

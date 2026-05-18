# Bug 084: Slider test ids interpolate raw keys

- Category: demo-id
- Evidence: `demo/src/patterns/slider/Slider.tsx:58`
- Impact: Keys containing spaces or punctuation create brittle test selectors and duplicate data-testid values across slider instances.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

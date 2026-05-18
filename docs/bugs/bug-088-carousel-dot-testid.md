# Bug 088: Carousel dot test ids interpolate raw slide keys

- Category: demo-id
- Evidence: `demo/src/patterns/carousel/Carousel.tsx:69`
- Impact: Raw slide keys can create duplicate or selector-hostile test ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

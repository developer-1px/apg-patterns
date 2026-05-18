# Bug 087: Window splitter secondary pane test id is fixed

- Category: demo-id
- Evidence: `demo/src/patterns/windowsplitter/WindowSplitter.tsx:31`
- Impact: Multiple splitters expose identical data-testid values for the secondary pane.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

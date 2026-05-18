# Bug 086: Window splitter primary pane test id is fixed

- Category: demo-id
- Evidence: `demo/src/patterns/windowsplitter/WindowSplitter.tsx:23`
- Impact: Multiple splitters expose identical data-testid values, making tests and recorder output ambiguous.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

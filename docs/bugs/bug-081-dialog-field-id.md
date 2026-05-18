# Bug 081: Dialog form field ids are hardcoded

- Category: demo-id
- Evidence: `demo/src/patterns/dialog/Dialog.tsx:43`
- Impact: Multiple dialog demos produce duplicate dialog-name and dialog-email ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Route every id and test id through the pattern id namespace or a demo-local unique prefix.

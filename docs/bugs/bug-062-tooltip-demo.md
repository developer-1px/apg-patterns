# Bug 062: Tooltip focus test emits React act warning

- Category: test-warning
- Evidence: `demo/src/patterns/tooltip/Tooltip.apg.test.tsx:16`
- Impact: The tooltip show transition updates state outside act, so the focus assertion is racing React updates.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Wrap keyboard interactions in act or use Testing Library helpers that flush React updates.

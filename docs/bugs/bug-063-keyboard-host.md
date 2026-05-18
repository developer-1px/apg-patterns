# Bug 063: Keyboard behavior tests emit React act warnings

- Category: test-warning
- Evidence: `src/tests/keyboardBehavior.test.tsx:1`
- Impact: The generic keyboard host updates state outside act while asserting preventDefault behavior.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Wrap keyboard interactions in act or use Testing Library helpers that flush React updates.

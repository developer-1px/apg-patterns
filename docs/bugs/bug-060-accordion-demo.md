# Bug 060: Accordion keyboard tests emit React act warnings

- Category: test-warning
- Evidence: `demo/src/patterns/accordion/Accordion.test.tsx:57`
- Impact: The test suite logs act warnings for Enter, Space, Arrow, Home, and End flows, so assertions may observe intermediate UI instead of committed user-visible state.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Wrap keyboard interactions in act or use Testing Library helpers that flush React updates.

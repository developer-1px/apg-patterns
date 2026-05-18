# Bug 061: Tabs keyboard tests emit React act warnings

- Category: test-warning
- Evidence: `demo/src/patterns/tabs/Tabs.test.tsx:61`
- Impact: Automatic, manual, and vertical tab keyboard tests update state outside act, which can hide timing regressions.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Wrap keyboard interactions in act or use Testing Library helpers that flush React updates.

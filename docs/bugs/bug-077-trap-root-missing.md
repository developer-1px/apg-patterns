# Bug 077: Focus trap does nothing when root relation is missing

- Category: kernel-contract
- Evidence: `src/adapters/reactPatternTrapFocus.ts:20`
- Impact: Broken trap configuration silently disables focus containment.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

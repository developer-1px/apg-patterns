# Bug 074: firstFocusable target can select hidden or disabled descendants

- Category: kernel-contract
- Evidence: `src/adapters/reactElementTargets.ts:15`
- Impact: querySelector uses a broad focusable selector without visibility checks, so focus trap restoration can land on hidden content.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

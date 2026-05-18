# Bug 075: Roving focus schedules an uncancelled timeout

- Category: kernel-contract
- Evidence: `src/adapters/reactRovingFocus.ts:41`
- Impact: The delayed focus fallback can run after unmount or after activeKey changes again, moving focus to stale elements.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

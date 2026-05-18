# Bug 072: Every keyed part receives an id even when the part should not be referenced

- Category: kernel-contract
- Evidence: `src/kernel/runtimePartProps.ts:33`
- Impact: The runtime adds ids to all keyed parts, increasing duplicate-id exposure for visual-only or repeated structural parts.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

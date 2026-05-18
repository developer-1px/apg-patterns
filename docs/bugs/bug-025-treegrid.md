# Bug 025: Default elementIdPrefix is shared across treegrid instances

- Category: duplicate-id
- Evidence: `src/patterns/treegrid/useTreegridPattern.ts:30`
- Impact: Two treegrids with matching row/cell keys emit duplicate treegrid cell ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

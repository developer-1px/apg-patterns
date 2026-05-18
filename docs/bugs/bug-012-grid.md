# Bug 012: Default elementIdPrefix is shared across grid instances

- Category: duplicate-id
- Evidence: `src/patterns/grid/useGridPattern.ts:39`
- Impact: Two grids with the same cell keys emit duplicate gridcell ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

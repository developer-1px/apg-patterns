# Bug 022: Default elementIdPrefix is shared across table instances

- Category: duplicate-id
- Evidence: `src/patterns/table/useTablePattern.ts:34`
- Impact: Two tables with matching cell keys emit duplicate table cell ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

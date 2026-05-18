# Bug 026: Default elementIdPrefix is shared across treeview instances

- Category: duplicate-id
- Evidence: `src/patterns/treeview/runtime.ts:47`
- Impact: Two treeviews with matching node keys emit duplicate treeitem ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

# Bug 027: Default elementIdPrefix is shared across window splitter instances

- Category: duplicate-id
- Evidence: `src/patterns/windowsplitter/useWindowSplitterPattern.ts:33`
- Impact: Two splitters with the same item keys emit duplicate separator/pane ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

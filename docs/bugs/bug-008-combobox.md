# Bug 008: Default elementIdPrefix is shared across combobox instances

- Category: duplicate-id
- Evidence: `src/patterns/combobox/useComboboxPattern.ts:30`
- Impact: Two comboboxes with the same option keys emit duplicate option ids used by aria-activedescendant.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

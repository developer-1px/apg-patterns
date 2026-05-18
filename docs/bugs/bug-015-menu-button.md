# Bug 015: Default elementIdPrefix is shared across menu button instances

- Category: duplicate-id
- Evidence: `src/patterns/menu/useMenuButtonPattern.ts:33`
- Impact: Two menu buttons with the same trigger/menu item keys emit duplicate ids used by aria-controls and aria-activedescendant.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

# Bug 016: Default elementIdPrefix is shared across menubar instances

- Category: duplicate-id
- Evidence: `src/patterns/menu/useMenubarPattern.ts:29`
- Impact: Two menubars with the same item keys emit duplicate menuitem ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

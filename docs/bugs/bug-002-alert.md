# Bug 002: Default elementIdPrefix is shared across all alert instances

- Category: duplicate-id
- Evidence: `src/patterns/alert/useAlertPattern.ts:38`
- Impact: Rendering two alerts with the same item keys produces duplicate ids for alert content and dismiss controls.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

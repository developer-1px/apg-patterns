# Bug 020: Default elementIdPrefix is shared across spinbutton instances

- Category: duplicate-id
- Evidence: `src/patterns/spinbutton/useSpinbuttonPattern.ts:29`
- Impact: Two spinbuttons with the same item key emit duplicate spinbutton ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

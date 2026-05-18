# Bug 019: Default elementIdPrefix is shared across slider instances

- Category: duplicate-id
- Evidence: `src/patterns/slider/useSliderPattern.ts:32`
- Impact: Two sliders with the same thumb keys emit duplicate slider ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

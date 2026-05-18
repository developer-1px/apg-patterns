# Bug 006: Default elementIdPrefix is shared across carousel instances

- Category: duplicate-id
- Evidence: `src/patterns/carousel/useCarouselPattern.ts:46`
- Impact: Two carousels with the same slide keys emit duplicate slide and control ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

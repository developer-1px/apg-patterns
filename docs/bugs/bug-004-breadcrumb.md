# Bug 004: Default elementIdPrefix is shared across breadcrumb instances

- Category: duplicate-id
- Evidence: `src/patterns/breadcrumb/useBreadcrumbPattern.ts:35`
- Impact: Two breadcrumb patterns with matching item keys produce duplicate link ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

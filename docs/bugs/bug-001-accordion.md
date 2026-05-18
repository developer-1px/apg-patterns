# Bug 001: Default elementIdPrefix is shared across all accordion instances

- Category: duplicate-id
- Evidence: `src/patterns/accordion/useAccordionPattern.ts:11`
- Impact: Rendering two accordions without overriding options.elementIdPrefix produces duplicate header and panel ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

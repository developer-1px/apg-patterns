# Bug 069: relations.controlsByKey exposes only the first controlled element

- Category: kernel-contract
- Evidence: `src/kernel/kernelAriaSources.ts:25`
- Impact: The schema allows multiple controlled keys, but aria-controls generation drops every key after index 0. Multi-panel patterns lose relationships.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

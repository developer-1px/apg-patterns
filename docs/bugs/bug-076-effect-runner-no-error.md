# Bug 076: Focus effect ignores unresolved targets

- Category: kernel-contract
- Evidence: `src/adapters/reactEffectRunner.ts:34`
- Impact: A broken id relation or missing DOM node fails silently instead of surfacing a development warning.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

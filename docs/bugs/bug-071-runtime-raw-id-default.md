# Bug 071: Base runtime default id is the raw key

- Category: kernel-contract
- Evidence: `src/kernel/patternRuntime.ts:50`
- Impact: Calling createPatternRuntime without a custom keyToElementId emits ids equal to arbitrary data keys.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

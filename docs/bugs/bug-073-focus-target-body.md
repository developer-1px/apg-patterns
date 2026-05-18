# Bug 073: Focus effect fails silently when generated id is missing

- Category: kernel-contract
- Evidence: `src/adapters/reactFocusEffectTarget.ts:10`
- Impact: Missing or duplicate activeKey ids produce no focus movement and no diagnostic, making focus regressions hard to detect.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

# Bug 009: Dialog panel id ignores elementIdPrefix

- Category: duplicate-id
- Evidence: `src/patterns/dialog/dialogRuntimeKeys.ts:4`
- Impact: Every dialog instance uses dialog-panel for the dialog item, so two open dialogs produce duplicate dialog-panel ids.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

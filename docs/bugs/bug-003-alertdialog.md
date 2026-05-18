# Bug 003: Default elementIdPrefix is shared across all alertdialog instances

- Category: duplicate-id
- Evidence: `src/patterns/alertdialog/useAlertDialogPattern.ts:24`
- Impact: Two alert dialogs on one page both emit ids such as alertdialog-title and alertdialog-description.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Use React useId or require a per-instance id namespace in the runtime default path.

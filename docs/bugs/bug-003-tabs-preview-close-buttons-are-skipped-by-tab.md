# Bug 003: Tabs preview close buttons are skipped by Tab navigation

- Progress: 3 / 100
- Area: tabs preview
- Evidence: `demo/src/patterns/tabs/Tabs.tsx:65`
- Symptom: Closeable tabs render a close `<button>`, but each close button has `tabIndex={-1}`.
- Impact: Mouse users can close tabs, but keyboard users cannot reach the close buttons through normal Tab navigation. This weakens the closeable-tabs preview as an accessibility demo.
- Reproduction:
  1. Open the closeable Tabs preview.
  2. Press Tab through the tablist.
  3. Focus reaches tabs/panel controls but skips the close buttons.
- Expected: The close action should be keyboard reachable, or the preview should document and implement a keyboard command for closing the active tab.
- Suggested fix: Make close buttons tabbable, or wire an APG-compatible `Delete` path with visible/focusable affordance and keep buttons out of the accessibility tree.

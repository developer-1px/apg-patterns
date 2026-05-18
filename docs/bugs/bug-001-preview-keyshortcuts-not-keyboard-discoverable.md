# Bug 001: Preview keyboard shortcuts are not keyboard-discoverable

- Progress: 1 / 100
- Area: demo preview
- Evidence: `demo/src/app/ActiveDemoWorkspace.tsx:88`
- Symptom: The preview wrapper exposes `aria-keyshortcuts`, but it is only programmatically focusable with `tabIndex={-1}` when shortcuts exist.
- Impact: Keyboard and assistive-technology users can miss the preview-level shortcut metadata during normal Tab navigation, even though the UI displays shortcut hints visually above the preview.
- Reproduction:
  1. Open a pattern preview that declares keyboard shortcuts, such as Grid or Tabs.
  2. Navigate with Tab through the page.
  3. The preview wrapper is skipped, so its `aria-keyshortcuts` value is not discoverable through normal keyboard focus.
- Expected: The element that carries `aria-keyshortcuts` should be reachable by keyboard, or the shortcut metadata should be attached to the actual focusable pattern root.
- Suggested fix: Move `aria-keyshortcuts` to the interactive preview root when possible, or make the preview wrapper an intentional, labelled focus stop.

# Bug 010: Vertical Tabs preview uses a fixed 140px column

- Progress: 10 / 100
- Area: tabs preview
- Evidence: `demo/src/patterns/tabs/Tabs.tsx:36`
- Symptom: The vertical tabs layout uses `grid-cols-[140px_minmax(0,1fr)]` regardless of viewport width or tab label length.
- Impact: Long tab labels can wrap awkwardly or squeeze the panel, and the two-column layout can be too wide for narrow preview panes.
- Reproduction:
  1. Open the vertical Tabs preview.
  2. Reduce the viewport width or use longer tab labels.
  3. The fixed tab column leaves too little room for the tab panel.
- Expected: The vertical tabs preview should collapse or size columns responsively.
- Suggested fix: Use responsive grid classes that stack on small widths and only switch to the fixed side tablist above a safe breakpoint.

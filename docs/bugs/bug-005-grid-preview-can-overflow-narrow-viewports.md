# Bug 005: Grid preview can overflow narrow viewports

- Progress: 5 / 100
- Area: grid preview
- Evidence: `demo/src/patterns/grid/Grid.tsx:16`
- Symptom: The preview uses `inline-grid` with `repeat(columnCount, minmax(120px, 1fr))` and no horizontal scroll wrapper.
- Impact: Data grids with several columns can exceed the preview panel width on narrow screens, causing content to be clipped or forcing page-level horizontal overflow.
- Reproduction:
  1. Open a multi-column Grid preview on a narrow viewport.
  2. Select a data variant with several columns.
  3. The grid width can exceed the preview panel instead of scrolling inside the preview.
- Expected: Wide grid previews should remain usable in a constrained preview pane.
- Suggested fix: Wrap the grid in an `overflow-x-auto` container or use responsive column sizing that preserves access to every cell.

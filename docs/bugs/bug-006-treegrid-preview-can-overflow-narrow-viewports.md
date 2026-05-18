# Bug 006: Treegrid preview can overflow narrow viewports

- Progress: 6 / 100
- Area: treegrid preview
- Evidence: `demo/src/patterns/treegrid/Treegrid.tsx:16`
- Symptom: The treegrid preview uses an `inline-grid` with `repeat(columnCount, minmax(120px, 1fr))` and no local horizontal scrolling.
- Impact: The treegrid can exceed the available preview width, especially with indentation and three columns, making cells hard to inspect on mobile or split-panel layouts.
- Reproduction:
  1. Open the Treegrid preview in a narrow viewport.
  2. Navigate to indented rows.
  3. Cells can extend beyond the visible preview area.
- Expected: Treegrid content should stay reachable without page-level horizontal overflow.
- Suggested fix: Add a local horizontal scroll container around the treegrid preview.

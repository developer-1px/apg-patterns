# Bug 002: Tree preview links are not keyboard-reachable

- Progress: 100 / 100
- Status: Resolved
- Area: treeview preview
- Evidence: `demo/src/patterns/treeview/Tree.tsx:38`
- Symptom: Tree items with `href` render an `<a>` element, but the anchor is forced to `tabIndex={-1}` and its click is prevented.
- Impact: The preview visually presents link text, but keyboard users cannot tab to or activate the link itself. The demo also cannot show how link-like tree items behave when activated.
- Reproduction:
  1. Open a treeview variant whose items include `href`.
  2. Navigate with Tab and arrow keys.
  3. The link text is never reachable as a link; focus remains on the surrounding treeitem.
- Expected: If the item is visually a link, activation should be reachable through the treeitem contract or the link should not be rendered as an inert anchor.
- Suggested fix: Either make the treeitem activation dispatch/link behavior explicit, or render link-looking text as non-anchor content unless link navigation is supported.
- Resolution: Tree preview links now render as normal anchors without forced `tabIndex={-1}` or click prevention in `demo/src/patterns/treeview/Tree.tsx`.

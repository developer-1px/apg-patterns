# Bug 007: Table preview rounded overflow does not clip table corners

- Progress: 100 / 100
- Status: Resolved
- Area: table preview
- Evidence: `demo/src/patterns/table/Table.tsx:12`
- Symptom: The preview applies `overflow-hidden rounded-xl` directly to a `<table>`.
- Impact: Table elements do not consistently clip rounded corners across browsers when overflow styling is applied directly to the table. The preview can show square row backgrounds bleeding through rounded corners.
- Reproduction:
  1. Open the Table preview.
  2. Inspect row background striping near the table corners.
  3. Browser rendering can ignore the intended clipping on the table element.
- Expected: Rounded visual framing should be stable across browsers.
- Suggested fix: Wrap the table in a rounded `overflow-hidden` container and keep the table itself focused on table semantics.
- Resolution: `demo/src/patterns/table/Table.tsx` now applies rounded clipping and scrolling to a wrapper while keeping table semantics on the table element.

# Bug 004: Combobox preview placeholder is hardcoded to fruit

- Progress: 4 / 100
- Area: combobox preview
- Evidence: `src/patterns/combobox/comboboxInputProps.ts:31`
- Symptom: Editable combobox previews always use `placeholder="Search fruit"` and select-only previews always use `placeholder="Select fruit"`.
- Impact: Date Picker and Grid Popup combobox variants advertise non-fruit data, but their input placeholder still says fruit. This makes those previews misleading and reduces confidence in variant-specific behavior.
- Reproduction:
  1. Open the Date Picker Combobox or Grid Popup Combobox variant.
  2. Inspect the input placeholder.
  3. It still references fruit instead of date or recipient data.
- Expected: Placeholder text should come from the combobox label or variant data.
- Suggested fix: Pass a placeholder from demo data/options, or derive it from the combobox item label.

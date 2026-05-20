# Bug 009: Listbox preview scroll effect reruns from an unstable ids object

- Progress: 100 / 100
- Status: Resolved
- Area: listbox preview
- Evidence: `demo/src/patterns/listbox/Listbox.tsx:35`
- Symptom: The scroll effect depends on `listbox.ids`, but `ids` is exposed as a getter that returns a new object.
- Impact: Scroll synchronization can run more often than necessary during preview renders. In a scrollable listbox this can cause avoidable layout work and unexpected scroll jumps.
- Reproduction:
  1. Open a scrollable Listbox preview.
  2. Navigate options and trigger rerenders.
  3. The effect dependency changes even when the id resolver did not.
- Expected: The effect should depend on the stable id resolver function or active key, not a freshly-created object.
- Suggested fix: Depend on `listbox.keyToElementId` or memoize the `ids` object returned by the runtime.
- Resolution: `demo/src/patterns/listbox/Listbox.tsx` now depends on `listbox.keyToElementId` instead of the getter-created `ids` object.

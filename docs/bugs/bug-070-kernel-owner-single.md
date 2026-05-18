# Bug 070: relations.ownerByKey cannot represent multiple labels

- Category: kernel-contract
- Evidence: `src/schema/patternData.ts:28`
- Impact: The schema only allows a single owner per key, so patterns that need multiple labelling elements cannot model them.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

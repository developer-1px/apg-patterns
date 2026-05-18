# Bug 078: Data validation checks keys but not generated id collisions

- Category: kernel-contract
- Evidence: `src/schema/patternDataRefValidators.ts:36`
- Impact: Relations can be internally valid while still producing duplicate DOM ids after prefixing/normalization.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Add validation or development diagnostics at the runtime boundary.

# Bug 057: menubar effect dependency changes every render

- Category: unstable-effect-dependency
- Evidence: `src/patterns/menu/useMenubarPattern.ts:35`
- Impact: The id resolver is recreated during render and then passed into usePatternEffects. Because the function identity changes, effects can rerun on unrelated renders, causing duplicate focus/restore work.
- Reproduction: Inspect the referenced code path and render the affected pattern/app state with the described condition.
- Suggested fix: Memoize the id resolver with useCallback/useMemo or move it outside render when options are stable.

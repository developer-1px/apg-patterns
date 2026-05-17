import type { PatternEvent } from '../../src'
import { type DemoPattern, type PatternEntry, type PatternKey } from './demoPatternTypes'

export type { DemoPattern, PatternKey } from './demoPatternTypes'

const modules = import.meta.glob<{ entry: PatternEntry }>('./entries/*.tsx', { eager: true })

const collected: PatternEntry[] = []
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.entry) {
    if (typeof console !== 'undefined') console.warn(`[demoPatterns] ${path} has no exported \`entry\``)
    continue
  }
  collected.push(mod.entry)
}

// Stable ordering: explicit `order` first (ascending), then key alphabetical.
collected.sort((a, b) => {
  const ao = a.order ?? Number.POSITIVE_INFINITY
  const bo = b.order ?? Number.POSITIVE_INFINITY
  if (ao !== bo) return ao - bo
  return a.key.localeCompare(b.key)
})

export const patternEntries: readonly PatternEntry[] = collected

export const patternItems: readonly { key: PatternKey; label: string }[] = collected.map((e) => ({
  key: e.key,
  label: e.label,
}))

export function useDemoPatterns(onEvent: (event: PatternEvent) => void): readonly DemoPattern[] {
  return patternEntries.map((entry) => entry.useDemoPattern(onEvent))
}

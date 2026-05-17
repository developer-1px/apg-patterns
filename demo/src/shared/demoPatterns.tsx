import type { PatternEvent } from '../../../src'
import { type DemoPattern, type PatternEntry, type PatternKey } from './demoPatternTypes'

export type { DemoPattern, PatternKey } from './demoPatternTypes'

const modules = import.meta.glob<{ entry: PatternEntry }>('../patterns/*/entry.tsx', { eager: true })

const collected: PatternEntry[] = []
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.entry) {
    if (typeof console !== 'undefined') console.warn(`[demoPatterns] ${path} has no exported \`entry\``)
    continue
  }
  collected.push(mod.entry)
}

collected.sort((a, b) => a.key.localeCompare(b.key))

export const patternEntries: readonly PatternEntry[] = collected

export const patternItems: readonly { key: PatternKey; label: string }[] = collected.map((e) => ({
  key: e.key,
  label: e.label,
}))

export function useDemoPatterns(onEvent: (event: PatternEvent) => void): readonly DemoPattern[] {
  return patternEntries.map((entry) => entry.useDemoPattern(onEvent))
}

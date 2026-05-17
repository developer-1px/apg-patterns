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
validatePatternEntries(collected)

export const patternEntries: readonly PatternEntry[] = collected

export const patternItems: readonly { key: PatternKey; label: string }[] = collected.map((e) => ({
  key: e.key,
  label: e.label,
}))

export function useDemoPattern(patternKey: PatternKey, onEvent: (event: PatternEvent) => void): DemoPattern {
  return getPatternEntry(patternKey).useDemoPattern(onEvent)
}

function getPatternEntry(patternKey: PatternKey): PatternEntry {
  return patternEntries.find((entry) => entry.key === patternKey) ?? patternEntries[0]
}

function validatePatternEntries(entries: readonly PatternEntry[]) {
  if (entries.length === 0) throw new Error('[demoPatterns] no pattern entries were registered')

  const duplicateKeys = duplicates(entries.map((entry) => entry.key))
  if (duplicateKeys.length > 0) {
    throw new Error(`[demoPatterns] duplicate pattern keys: ${duplicateKeys.join(', ')}`)
  }

  const duplicateLabels = duplicates(entries.map((entry) => entry.label))
  if (duplicateLabels.length > 0) {
    throw new Error(`[demoPatterns] duplicate pattern labels: ${duplicateLabels.join(', ')}`)
  }
}

function duplicates(values: readonly string[]) {
  const seen = new Set<string>()
  const duplicateValues = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value)
    seen.add(value)
  }
  return [...duplicateValues]
}

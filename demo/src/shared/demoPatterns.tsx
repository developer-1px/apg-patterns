import type { PatternEvent } from '../../../src'
import { type DemoPattern, type PatternEntry, type PatternKey } from './demoPatternTypes'

export type { DemoPattern, PatternKey } from './demoPatternTypes'

type CollectedPatternEntry = PatternEntry & { sourcePath: string }
type ValidatedPatternEntry = Pick<PatternEntry, 'key' | 'label'> & { sourcePath?: string }

const modules = import.meta.glob<{ entry: PatternEntry }>('../patterns/*/entry.tsx', { eager: true })
const keyByPatternFolder: Readonly<Record<string, string>> = {
  menu: 'menuAndMenubar',
}

const collected: CollectedPatternEntry[] = []
for (const [path, mod] of Object.entries(modules)) {
  if (!mod.entry) {
    if (typeof console !== 'undefined') console.warn(`[demoPatterns] ${path} has no exported \`entry\``)
    continue
  }
  collected.push({ ...mod.entry, sourcePath: path })
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

export function validatePatternEntries(entries: readonly ValidatedPatternEntry[]) {
  if (entries.length === 0) throw new Error('[demoPatterns] no pattern entries were registered')

  const invalidEntries = entries.flatMap((entry) => {
    const issues = []
    if (!entry.key.trim()) issues.push('empty key')
    else if (!/^[a-z][A-Za-z0-9]*$/.test(entry.key)) issues.push(`invalid key ${entry.key}`)
    if (!entry.label.trim()) issues.push('empty label')
    return issues
  })
  if (invalidEntries.length > 0) {
    throw new Error(`[demoPatterns] invalid pattern entries: ${invalidEntries.join(', ')}`)
  }

  const mismatchedFolders = entries.flatMap((entry) => {
    if (!entry.sourcePath) return []
    const folder = entry.sourcePath.match(/\/patterns\/([^/]+)\/entry\.tsx$/)?.[1]
    if (!folder) return [`${entry.key}: invalid source path ${entry.sourcePath}`]
    const expectedKey = keyByPatternFolder[folder] ?? folder
    return entry.key === expectedKey ? [] : [`${entry.key}: expected key ${expectedKey} for ${entry.sourcePath}`]
  })
  if (mismatchedFolders.length > 0) {
    throw new Error(`[demoPatterns] pattern folder/key mismatch: ${mismatchedFolders.join(', ')}`)
  }

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

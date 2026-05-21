import type { PatternEvent } from '../../../src/react'
import { type DemoPattern, type PatternEntry, type PatternKey } from './demoPatternTypes'
import type { SourceName } from './sources'

type ValidatedPatternEntry = Pick<PatternEntry, 'key' | 'label'> & { sourcePath?: string }
type PatternEntryModule = { entry?: PatternEntry }

const modules = import.meta.glob<PatternEntryModule>('../patterns/*/entry.tsx', { eager: true })
export const defaultPatternKey: PatternKey = 'treeview'
export const defaultSourceName: SourceName = 'Treeview.tsx'

const collected = collectPatternEntries(modules)
validatePatternEntries(collected, { defaultPatternKey })

export const patternEntries: readonly PatternEntry[] = collected.map(({ sourcePath, ...entry }) => entry)

export const patternItems: readonly { key: PatternKey; label: string }[] = patternEntries.map((e) => ({
  key: e.key,
  label: e.label,
}))

export function useDemoPattern(patternKey: PatternKey, onEvent: (event: PatternEvent) => void): DemoPattern {
  return getPatternEntry(patternKey).useDemoPattern(onEvent)
}

function getPatternEntry(patternKey: PatternKey): PatternEntry {
  const entry = patternEntries.find((entry) => entry.key === patternKey)
  if (!entry) throw new Error(`[demoPatterns] unknown pattern key: ${patternKey}`)
  return entry
}

export function validatePatternEntries(
  entries: readonly ValidatedPatternEntry[],
  options: { defaultPatternKey?: PatternKey } = {},
) {
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
    return entry.key === folder ? [] : [`${entry.key}: expected key ${folder} for ${entry.sourcePath}`]
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

  if (options.defaultPatternKey && !entries.some((entry) => entry.key === options.defaultPatternKey)) {
    throw new Error(`[demoPatterns] default pattern is not registered: ${options.defaultPatternKey}`)
  }
}

export function collectPatternEntries(modulesByPath: Readonly<Record<string, PatternEntryModule>>) {
  const missingEntries = Object.entries(modulesByPath)
    .filter(([, mod]) => !mod.entry)
    .map(([path]) => path)
    .sort((a, b) => a.localeCompare(b))
  if (missingEntries.length > 0) {
    throw new Error(`[demoPatterns] pattern modules missing exported entry: ${missingEntries.join(', ')}`)
  }

  const invalidEntries = Object.entries(modulesByPath)
    .flatMap(([path, mod]) => {
      const entry = mod.entry
      if (!entry) return []
      const issues = []
      if (typeof entry.key !== 'string') issues.push('key')
      if (typeof entry.label !== 'string') issues.push('label')
      if (typeof entry.useDemoPattern !== 'function') issues.push('useDemoPattern')
      return issues.length > 0 ? [`${path}: invalid ${issues.join(', ')}`] : []
    })
    .sort((a, b) => a.localeCompare(b))
  if (invalidEntries.length > 0) {
    throw new Error(`[demoPatterns] pattern modules exported invalid entry: ${invalidEntries.join('; ')}`)
  }

  return Object.entries(modulesByPath)
    .map(([sourcePath, mod]) => ({ ...mod.entry!, sourcePath }))
    .sort((a, b) => a.key.localeCompare(b.key))
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

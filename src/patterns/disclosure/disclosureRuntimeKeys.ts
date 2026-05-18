import type { Key, PatternData } from '../../schema'

export function createDisclosureElementId(prefix: string, key: Key): string {
  return `${prefix}${key.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`
}

export function getDisclosureKeys(data: PatternData): {
  triggerKey: Key | null
  panelKey: Key | null
} {
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const panelKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  return { triggerKey, panelKey }
}

export function isDisclosureExpanded(data: PatternData, triggerKey: Key | null): boolean {
  return triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
}

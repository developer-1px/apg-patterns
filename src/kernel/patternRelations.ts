import type { Key, PatternData } from '../schema'

export function createParentByKey(data: PatternData): ReadonlyMap<Key, Key> {
  const parentByKey = new Map<Key, Key>()
  for (const [parent, children] of Object.entries(data.relations?.childrenByKey ?? {})) {
    for (const child of children) parentByKey.set(child, parent)
  }
  return parentByKey
}

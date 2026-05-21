import type { Key, PatternData, PatternOptions } from '../../schema'

interface MenuButtonRuntimeState {
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  runtimeOptions: PatternOptions
  triggerKey: Key | null
  menuKey: Key | null
  expanded: boolean
  itemKeys: readonly Key[]
}

export function getMenuButtonRuntimeState(data: PatternData, options?: PatternOptions): MenuButtonRuntimeState {
  const focusStrategy = data.state?.focusStrategy === 'ariaActiveDescendant' ? 'ariaActiveDescendant' : 'rovingTabIndex'
  const runtimeOptions = { focusStrategy, ...(options ?? {}) } satisfies PatternOptions
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const menuKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expanded = triggerKey ? data.state?.expandedKeys?.includes(triggerKey) ?? false : false
  const itemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []

  return { focusStrategy, runtimeOptions, triggerKey, menuKey, expanded, itemKeys }
}

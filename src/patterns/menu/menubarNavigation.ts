import { moveApgLinear } from '../../internal/collectionNavigation'
import { defineNavigationTarget } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'

type MenubarLinearAction = 'next' | 'previous' | 'first' | 'last'
type MenubarChildPosition = 'first' | 'last'

let menubarNavigationRegistered = false

export function registerMenubarNavigation() {
  if (menubarNavigationRegistered) return
  menubarNavigationRegistered = true

  defineNavigationTarget('menubarLinear', (target, ctx) => {
    const action = target.action as MenubarLinearAction
    return moveApgLinear(ctx.visibleKeys, ctx.activeKey, action, { isAvailable: (key) => isEnabledMenubarKey(key, ctx.data) })
  })

  defineNavigationTarget('menubarChild', (target, ctx) => {
    const position = target.position as MenubarChildPosition
    return getMenubarChildEntryKey(ctx.data.relations?.childrenByKey?.[ctx.activeKey] ?? [], position, ctx.data) ?? null
  })
}

export function getEnabledMenubarKeys(keys: readonly Key[], data: PatternData): readonly Key[] {
  if ((data.state?.disabledKeys?.length ?? 0) === 0) return keys
  const disabledKeys = new Set(data.state?.disabledKeys ?? [])
  return keys.filter((key) => !disabledKeys.has(key))
}

export function getMenubarChildEntryKey(keys: readonly Key[], position: MenubarChildPosition, data: PatternData): Key | undefined {
  const enabledKeys = getEnabledMenubarKeys(keys, data)
  return position === 'first' ? enabledKeys[0] : enabledKeys[enabledKeys.length - 1]
}

export function getMenubarSiblingKey(keys: readonly Key[], key: Key, direction: 'next' | 'previous', data: PatternData): Key | undefined {
  return moveApgLinear(keys, key, direction, {
    wrap: true,
    isAvailable: (candidate) => isEnabledMenubarKey(candidate, data),
  }) ?? undefined
}

function isEnabledMenubarKey(key: Key, data: PatternData): boolean {
  return !(data.state?.disabledKeys?.includes(key) ?? false)
}

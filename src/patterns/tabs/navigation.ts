import { moveLinear } from '../../internal/collectionNavigation'
import { defineNavigationTarget } from '../../kernel/patternKernel'

let tabsNavigationRegistered = false

export function registerTabsNavigation() {
  if (tabsNavigationRegistered) return
  tabsNavigationRegistered = true

defineNavigationTarget('tabsLinear', (target, ctx) => {
  const action = target.action as 'next' | 'previous' | 'first' | 'last'
  if (action === 'next') return moveLinear(ctx.visibleKeys, ctx.activeKey, 'next') ?? ctx.visibleKeys[0] ?? null
  if (action === 'previous') return moveLinear(ctx.visibleKeys, ctx.activeKey, 'previous') ?? ctx.visibleKeys[ctx.visibleKeys.length - 1] ?? null
  return moveLinear(ctx.visibleKeys, ctx.activeKey, action)
})
}

registerTabsNavigation()

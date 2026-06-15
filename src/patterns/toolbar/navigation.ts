import { moveApgLinear } from '../../internal/collectionNavigation'
import { defineNavigationTarget } from '../../kernel/patternKernel'

let toolbarNavigationRegistered = false

export function registerToolbarNavigation() {
  if (toolbarNavigationRegistered) return
  toolbarNavigationRegistered = true

  defineNavigationTarget('toolbarLinear', (target, ctx) => {
    const disabledKeys = new Set(ctx.data.state?.disabledKeys ?? [])
    return moveApgLinear(ctx.visibleKeys, ctx.activeKey, target.action as 'next' | 'previous' | 'first' | 'last', {
      isAvailable: (key) => !disabledKeys.has(key),
    })
  })
}

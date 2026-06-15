import { moveApgLinear } from '../../internal/collectionNavigation'
import { defineNavigationTarget } from '../../kernel/patternKernel'

let radioNavigationRegistered = false

export function registerRadioNavigation() {
  if (radioNavigationRegistered) return
  radioNavigationRegistered = true

  defineNavigationTarget('radioLinear', (target, ctx) => {
    const action = target.action
    if (action !== 'next' && action !== 'previous' && action !== 'first' && action !== 'last') return null

    const disabledKeys = new Set(ctx.data.state?.disabledKeys ?? [])
    return moveApgLinear(ctx.visibleKeys, ctx.activeKey, action, {
      isAvailable: (key) => !disabledKeys.has(key),
    })
  })
}

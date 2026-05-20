import { moveLinear } from '../internal/collectionNavigation'
import { defineKeyToken, defineNavigationTarget, defineVisibleOrder } from './patternKernel'

defineVisibleOrder('flat', (_v, data) => data.relations?.rootKeys ?? [])

defineNavigationTarget('linear', (target, ctx) => {
  const action = target.action as 'next' | 'previous' | 'first' | 'last'
  return moveLinear(ctx.visibleKeys, ctx.activeKey, action)
})
defineNavigationTarget('linearWrap', (target, ctx) => {
  if (ctx.visibleKeys.length === 0) return null
  const index = ctx.visibleKeys.indexOf(ctx.activeKey)
  const action = target.action as 'next' | 'previous'
  if (action === 'next') return ctx.visibleKeys[(index + 1 + ctx.visibleKeys.length) % ctx.visibleKeys.length] ?? null
  if (action === 'previous') return ctx.visibleKeys[(index - 1 + ctx.visibleKeys.length) % ctx.visibleKeys.length] ?? null
  return null
})

defineKeyToken('$triggerKey', (_key, _activeKey, ctx) => ctx?.data.relations?.rootKeys?.[0] ?? null)
defineKeyToken('$initialFocusKey', (_key, _activeKey, ctx) => ctx?.data.refs?.initialFocusKey ?? null)

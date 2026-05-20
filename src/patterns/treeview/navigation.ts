import { visibleTreeItems } from '../../internal/collectionNavigation'
import { defineNavigationTarget, defineVisibleOrder, resolveKeyToken } from '../../kernel/patternKernel'

defineNavigationTarget('firstChild', (target, ctx) => {
  const key = resolveKeyToken(target.key ?? '$activeKey', undefined, ctx.activeKey)
  return ctx.data.relations?.childrenByKey?.[key]?.[0] ?? null
})

defineNavigationTarget('parentKey', (target, ctx) => {
  const key = resolveKeyToken(target.key ?? '$activeKey', undefined, ctx.activeKey)
  return ctx.parentByKey.get(key) ?? ctx.visibleKeys[0] ?? null
})

defineVisibleOrder('treeVisibleDepthFirst', (_v, data) => {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  return visibleTreeItems({
    roots: data.relations?.rootKeys ?? [],
    children: (key) => data.relations?.childrenByKey?.[key] ?? [],
    isExpanded: (key) => expanded.has(key),
  })
})

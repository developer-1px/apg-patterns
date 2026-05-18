import { defineAriaSource } from '../../kernel/patternKernel'

defineAriaSource('state.rowExpanded', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

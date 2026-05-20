import { defineAriaSource } from '../../kernel/patternKernel'

let treegridAriaSourcesRegistered = false

export function registerTreegridAriaSources() {
  if (treegridAriaSourcesRegistered) return
  treegridAriaSourcesRegistered = true

defineAriaSource('state.rowExpanded', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})
}

registerTreegridAriaSources()

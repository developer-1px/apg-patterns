import { defineAriaSource } from '../../kernel/patternKernel'

let menuAriaSourcesRegistered = false

export function registerMenuAriaSources() {
  if (menuAriaSourcesRegistered) return
  menuAriaSourcesRegistered = true

defineAriaSource('menu.hasPopup', (ctx) => {
  if (!ctx.key) return undefined
  return (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0 ? 'menu' : undefined
})

defineAriaSource('menu.expandedIfHasPopup', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

defineAriaSource('items.kind', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.kind : undefined))
}

registerMenuAriaSources()

import { defineAriaSource } from '../../kernel/patternKernel'

let gridAriaSourcesRegistered = false

export function registerGridAriaSources() {
  if (gridAriaSourcesRegistered) return
  gridAriaSourcesRegistered = true

  defineAriaSource('state.multiselectable', (ctx) =>
    ctx.options?.selectionMode === 'multiple' || ctx.data.state?.multiselectable === true || undefined,
  )
}

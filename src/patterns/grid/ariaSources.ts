import { defineAriaSource } from '../../kernel/patternKernel'

defineAriaSource('state.readonly', (ctx) => ctx.data.state?.readonly === true || undefined)
defineAriaSource('state.multiselectable', (ctx) =>
  ctx.options?.selectionMode === 'multiple' || ctx.data.state?.multiselectable === true || undefined,
)

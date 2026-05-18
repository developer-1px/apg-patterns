import { defineAriaSource } from '../../kernel/patternKernel'

defineAriaSource('state.multiselectable', (ctx) =>
  ctx.options?.selectionMode === 'multiple' || ctx.data.state?.multiselectable === true || undefined,
)

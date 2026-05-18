import { defineAriaSource, defineStateProjection } from '../../kernel/patternKernel'

defineAriaSource('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
defineStateProjection('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))

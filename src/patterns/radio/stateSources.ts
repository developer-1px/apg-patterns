import { defineAriaSource, defineStateProjection } from '../../kernel/patternKernel'

let radioStateSourcesRegistered = false

export function registerRadioStateSources() {
  if (radioStateSourcesRegistered) return
  radioStateSourcesRegistered = true

defineAriaSource('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
defineStateProjection('state.selectedKeys.radioChecked', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))
}

registerRadioStateSources()

import {
  defineAriaSource,
  defineKeyToken,
  defineNavigationTarget,
  defineVisibleOrder,
} from '../../kernel/patternKernel'

export const comboboxRootKey = 'combobox'
export const COMBOBOX_TOKEN = '$combobox'

let comboboxNavigationRegistered = false

export function registerComboboxNavigation() {
  if (comboboxNavigationRegistered) return
  comboboxNavigationRegistered = true

defineKeyToken(COMBOBOX_TOKEN, () => comboboxRootKey)

defineAriaSource('combobox.popupOpen', (ctx) => ctx.data.state?.expandedKeys?.includes(comboboxRootKey) ?? false)

defineVisibleOrder('comboboxOptions', (_v, data) => Object.keys(data.items).filter((k) => k !== comboboxRootKey))

defineNavigationTarget('optionLinear', (target, ctx) => {
  const options = ctx.visibleKeys
  if (options.length === 0) return null
  const direction = typeof target.direction === 'string' ? target.direction : null
  const currentIdx = ctx.activeKey === comboboxRootKey ? -1 : options.indexOf(ctx.activeKey)
  if (direction === 'next') return options[Math.min(currentIdx + 1, options.length - 1)] ?? options[0]
  if (direction === 'previous') return currentIdx <= 0 ? options[0] : options[currentIdx - 1]
  if (direction === 'first') return options[0]
  if (direction === 'last') return options[options.length - 1]
  return null
})
}

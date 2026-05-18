import {
  defineAriaSource,
  defineKeyToken,
  defineNavigationTarget,
  defineVisibleOrder,
} from '../../index'

export const COMBOBOX_KEY = 'combobox'
export const COMBOBOX_TOKEN = '$combobox'

defineKeyToken(COMBOBOX_TOKEN, () => COMBOBOX_KEY)

defineAriaSource('combobox.popupOpen', (ctx) => ctx.data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false)

defineVisibleOrder('comboboxOptions', (_v, data) => Object.keys(data.items).filter((k) => k !== COMBOBOX_KEY))

defineNavigationTarget('optionLinear', (target, ctx) => {
  const options = ctx.visibleKeys
  if (options.length === 0) return null
  const direction = typeof target.direction === 'string' ? target.direction : null
  const currentIdx = ctx.activeKey === COMBOBOX_KEY ? -1 : options.indexOf(ctx.activeKey)
  if (direction === 'next') return options[Math.min(currentIdx + 1, options.length - 1)] ?? options[0]
  if (direction === 'previous') return currentIdx <= 0 ? options[0] : options[currentIdx - 1]
  if (direction === 'first') return options[0]
  if (direction === 'last') return options[options.length - 1]
  return null
})

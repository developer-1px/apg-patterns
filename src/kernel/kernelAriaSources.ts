import { defineAriaSource } from './patternKernel'

let kernelAriaSourcesRegistered = false

export function registerKernelAriaSources() {
  if (kernelAriaSourcesRegistered) return
  kernelAriaSourcesRegistered = true

defineAriaSource('refs.label', (ctx) => ctx.data.refs?.label)
defineAriaSource('refs.labelledBy', (ctx) => ctx.data.refs?.labelledBy)
defineAriaSource('literal.true', () => true)
defineAriaSource('options.label', (ctx) => (ctx.options as { label?: string } | undefined)?.label)
defineAriaSource('options.orientation', (ctx) => ctx.options?.orientation)
defineAriaSource('options.roledescription', (ctx) => (ctx.options as Record<string, unknown> | undefined)?.roledescription)
defineAriaSource('options.slideRoledescription', (ctx) => (ctx.options as Record<string, unknown> | undefined)?.slideRoledescription)
defineAriaSource('options.selectionMode.multiple', (ctx) => (ctx.options?.selectionMode === 'multiple' ? true : undefined))
defineAriaSource('state.activeKey.elementId', (ctx) => (ctx.activeKey && ctx.keyToElementId ? ctx.keyToElementId(ctx.activeKey) : undefined))
defineAriaSource('state.inactiveKey', (ctx) => (ctx.key != null && ctx.activeKey !== ctx.key ? true : undefined))
defineAriaSource('items.href', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.href : undefined))
defineAriaSource('items.label', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.label : undefined))
defineAriaSource('items.labelledBy', (ctx) => (ctx.key ? ctx.data.items[ctx.key]?.labelledBy : undefined))
defineAriaSource('items.valuemin', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuemin?: number } | undefined)?.valuemin : undefined))
defineAriaSource('items.valuemax', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuemax?: number } | undefined)?.valuemax : undefined))
defineAriaSource('items.valuetext', (ctx) => (ctx.key ? (ctx.data.items[ctx.key] as { valuetext?: string } | undefined)?.valuetext : undefined))
defineAriaSource('options.min', (ctx) => (ctx.options as { min?: number } | undefined)?.min)
defineAriaSource('options.max', (ctx) => (ctx.options as { max?: number } | undefined)?.max)
defineAriaSource('options.haspopup', (ctx) => (ctx.options as { haspopup?: string } | undefined)?.haspopup ?? 'listbox')
defineAriaSource('options.autocomplete', (ctx) => (ctx.options as { autocomplete?: string } | undefined)?.autocomplete ?? 'list')
defineAriaSource('state.rowCount', (ctx) => (ctx.data.state as { rowCount?: number } | undefined)?.rowCount ?? ctx.data.relations?.rowKeys?.length)
defineAriaSource('state.colCount', (ctx) => (ctx.data.state as { colCount?: number } | undefined)?.colCount ?? ctx.data.relations?.columnKeys?.length)
defineAriaSource('relations.controlsByKey', (ctx) => {
  const controlledKeys = ctx.key ? ctx.data.relations?.controlsByKey?.[ctx.key] : undefined
  if (!controlledKeys?.length) return undefined
  return controlledKeys.map((key) => ctx.keyToElementId?.(key) ?? key).join(' ')
})
defineAriaSource('relations.ownerByKey', (ctx) => {
  const ownerKey = ctx.key ? ctx.data.relations?.ownerByKey?.[ctx.key] : undefined
  return ownerKey ? (ctx.keyToElementId?.(ownerKey) ?? ownerKey) : undefined
})
defineAriaSource('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
defineAriaSource('state.disabledKeys', (ctx) => (ctx.key && ctx.data.state?.disabledKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : undefined))
defineAriaSource('state.readonly', (ctx) => ctx.data.state?.readonly === true || undefined)
defineAriaSource('state.checkedByKey', (ctx) => (ctx.key ? ctx.data.state?.checkedByKey?.[ctx.key] : undefined))
defineAriaSource('state.pressedByKey', (ctx) => (ctx.key ? ctx.data.state?.pressedByKey?.[ctx.key] : undefined))
defineAriaSource('state.currentKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineAriaSource('state.currentByKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineAriaSource('state.invalidByKey', (ctx) => (ctx.key ? ctx.data.state?.invalidByKey?.[ctx.key] : undefined))
defineAriaSource('state.requiredKeys', (ctx) => (ctx.key && ctx.data.state?.requiredKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.busyKeys', (ctx) => (ctx.key && ctx.data.state?.busyKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.modalKeys', (ctx) => (ctx.key && ctx.data.state?.modalKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.levelByKey', (ctx) => (ctx.key ? ctx.data.state?.levelByKey?.[ctx.key] : undefined))
defineAriaSource('state.posInSetByKey', (ctx) => (ctx.key ? ctx.data.state?.posInSetByKey?.[ctx.key] : undefined))
defineAriaSource('state.setSizeByKey', (ctx) => (ctx.key ? ctx.data.state?.setSizeByKey?.[ctx.key] : undefined))
defineAriaSource('state.rowIndexByKey', (ctx) => (ctx.key ? ctx.data.state?.rowIndexByKey?.[ctx.key] : undefined))
defineAriaSource('state.columnIndexByKey', (ctx) => (ctx.key ? ctx.data.state?.columnIndexByKey?.[ctx.key] : undefined))
defineAriaSource('state.sortByKey', (ctx) => (ctx.key ? ctx.data.state?.sortByKey?.[ctx.key] : undefined))
defineAriaSource('state.valueByKey', (ctx) => (ctx.key ? ctx.data.state?.valueByKey?.[ctx.key] : undefined))
defineAriaSource('state.rangeValueByKey.min', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.min : undefined))
defineAriaSource('state.rangeValueByKey.max', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.max : undefined))
defineAriaSource('state.rangeValueByKey.now', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.now : undefined))
defineAriaSource('state.rangeValueByKey.text', (ctx) => (ctx.key ? ctx.data.state?.rangeValueByKey?.[ctx.key]?.text : undefined))
}

registerKernelAriaSources()

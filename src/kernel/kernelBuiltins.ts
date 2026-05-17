/**
 * Kernel 기본 어휘 등록 — 패턴 무관 공통 토큰의 resolver 구현.
 *
 * kernelVocabulary.ts 가 "string 상수 사전(autocomplete)"이라면,
 * 이 파일은 그 상수에 대응하는 "runtime resolver 등록".
 *
 * 패턴별 토큰은 각 패턴 정의 파일에서 등록한다.
 */
import {
  defineAriaSource,
  defineNavigationTarget,
  defineStateProjection,
  definePredicate,
  defineVisibleOrder,
  resolveKeyToken,
  defineKeyToken,
} from './patternKernel'
import type { Key, PatternData } from '../schema'
import { moveLinear } from '@interactive-os/collection-navigation'

// AriaSource — common
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
  const controlledKey = ctx.key ? ctx.data.relations?.controlsByKey?.[ctx.key]?.[0] : undefined
  return controlledKey ? (ctx.keyToElementId?.(controlledKey) ?? controlledKey) : undefined
})
defineAriaSource('relations.ownerByKey', (ctx) => {
  const ownerKey = ctx.key ? ctx.data.relations?.ownerByKey?.[ctx.key] : undefined
  return ownerKey ? (ctx.keyToElementId?.(ownerKey) ?? ownerKey) : undefined
})
// aria-selected 는 ARIA spec 상 selectable 항목에서 explicit true/false 가 요구된다.
defineAriaSource('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : undefined))
// aria-disabled 는 omit-when-false 가 표준 — 비활성일 때만 true.
defineAriaSource('state.disabledKeys', (ctx) => (ctx.key && ctx.data.state?.disabledKeys?.includes(ctx.key)) || undefined)
defineAriaSource('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : undefined))
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

// StateProjection — common
defineStateProjection('state.activeKey', (ctx) => ctx.key != null && ctx.activeKey === ctx.key)
defineStateProjection('state.selectedKeys', (ctx) => (ctx.key ? ctx.data.state?.selectedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.disabledKeys', (ctx) => (ctx.key ? ctx.data.state?.disabledKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.expandedKeys', (ctx) => (ctx.key ? ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false : false))
defineStateProjection('state.checkedByKey', (ctx) => (ctx.key ? ctx.data.state?.checkedByKey?.[ctx.key] : undefined))
defineStateProjection('state.pressedByKey', (ctx) => (ctx.key ? ctx.data.state?.pressedByKey?.[ctx.key] : undefined))
defineStateProjection('state.currentByKey', (ctx) => (ctx.key ? ctx.data.state?.currentByKey?.[ctx.key] : undefined))
defineStateProjection('state.valueByKey', (ctx) => (ctx.key ? ctx.data.state?.valueByKey?.[ctx.key] : undefined))

// Predicate — common leaf kinds
definePredicate('hasActiveKey', (_p, ctx) => Boolean(ctx.activeKey))
definePredicate('activeCellInFirstColumn', (_p, ctx) => {
  const cell = activeCellRelation(ctx.data, ctx.activeKey)
  return Boolean(cell && cell.columnKey === ctx.data.relations?.columnKeys?.[0])
})
definePredicate('activeRowHasChildren', (_p, ctx) => {
  const rowKey = activeCellRelation(ctx.data, ctx.activeKey)?.rowKey
  return Boolean(rowKey && (ctx.data.relations?.childrenByKey?.[rowKey]?.length ?? 0) > 0)
})
definePredicate('activeRowExpanded', (_p, ctx) => {
  const rowKey = activeCellRelation(ctx.data, ctx.activeKey)?.rowKey
  return Boolean(rowKey && (ctx.data.state?.expandedKeys?.includes(rowKey) ?? false))
})
definePredicate('activeKeyIsRow', (_p, ctx) => {
  if (!ctx.activeKey) return false
  const rowKeys = ctx.data.relations?.rowKeys ?? []
  return rowKeys.includes(ctx.activeKey)
})
definePredicate('isChecked', (p, ctx) => {
  if (p.kind !== 'isChecked') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return ctx.data.state?.checkedByKey?.[key] === true
})
definePredicate('isPressed', (p, ctx) => {
  if (p.kind !== 'isPressed') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return ctx.data.state?.pressedByKey?.[key] === true
})
definePredicate('isSwitchOn', (p, ctx) => {
  if (p.kind !== 'isSwitchOn') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return ctx.data.state?.checkedByKey?.[key] === true
})
definePredicate('isPopupOpen', (_p, ctx) => {
  const key = ctx.key ?? ctx.activeKey
  if (key && (ctx.data.state?.expandedKeys?.includes(key) ?? false)) return true
  return (ctx.data.state?.expandedKeys?.length ?? 0) > 0
})
definePredicate('optionEquals', (p, ctx) => {
  if (p.kind !== 'optionEquals') return false
  return (ctx.options as Record<string, unknown> | undefined)?.[p.option] === p.value
})
definePredicate('hasChildren', (p, ctx) => {
  if (p.kind !== 'hasChildren') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return (ctx.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
})
definePredicate('isExpanded', (p, ctx) => {
  if (p.kind !== 'isExpanded') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return ctx.data.state?.expandedKeys?.includes(key) ?? false
})
definePredicate('isDisabled', (p, ctx) => {
  if (p.kind !== 'isDisabled') return false
  const key = resolveKeyToken(p.key, ctx.key, ctx.activeKey, ctx)
  return ctx.data.state?.disabledKeys?.includes(key) ?? false
})

// VisibleOrder — kernel 기본 'flat'.
defineVisibleOrder('flat', (_v, data) => data.relations?.rootKeys ?? [])

// NavigationTarget — kernel 기본 linear movement over the resolved visible order.
defineNavigationTarget('linear', (target, ctx) => {
  const action = target.action as 'next' | 'previous' | 'first' | 'last'
  return moveLinear(ctx.visibleKeys, ctx.activeKey, action)
})
defineNavigationTarget('linearWrap', (target, ctx) => {
  if (ctx.visibleKeys.length === 0) return null
  const index = ctx.visibleKeys.indexOf(ctx.activeKey)
  const action = target.action as 'next' | 'previous'
  if (action === 'next') return ctx.visibleKeys[(index + 1 + ctx.visibleKeys.length) % ctx.visibleKeys.length] ?? null
  if (action === 'previous') return ctx.visibleKeys[(index - 1 + ctx.visibleKeys.length) % ctx.visibleKeys.length] ?? null
  return null
})

defineKeyToken('$triggerKey', (_key, _activeKey, ctx) => ctx?.data.relations?.rootKeys?.[0] ?? null)
defineKeyToken('$initialFocusKey', (_key, _activeKey, ctx) => ctx?.data.refs?.initialFocusKey ?? null)

function activeCellRelation(data: PatternData, activeKey: Key | null | undefined) {
  if (!activeKey) return null
  return data.relations?.cells?.find((cell) => cell.cellKey === activeKey) ?? null
}

import type { Key, PatternData } from '../schema'
import { definePredicate, resolveKeyToken } from './patternKernel'

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

function activeCellRelation(data: PatternData, activeKey: Key | null | undefined) {
  if (!activeKey) return null
  return data.relations?.cells?.find((cell) => cell.cellKey === activeKey) ?? null
}

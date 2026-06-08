import { definePredicate } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'

let treegridPredicatesRegistered = false

export function registerTreegridPredicates() {
  if (treegridPredicatesRegistered) return
  treegridPredicatesRegistered = true

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
}

function activeCellRelation(data: PatternData, activeKey: Key | null | undefined) {
  if (!activeKey) return null
  return data.relations?.cells?.find((cell) => cell.cellKey === activeKey) ?? null
}

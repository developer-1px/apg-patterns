import { moveGrid, visibleTreeItems } from '@interactive-os/collection-navigation'
import {
  defineAriaSource,
  defineKeyToken,
  defineNavigationTarget,
  definePredicate,
  defineVisibleOrder,
} from '../../patternKernel'
import type { Key, PatternData } from '../../schema'

type TreegridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

const visibleRowKeys = (data: PatternData): readonly Key[] => {
  const rootKeys = data.relations?.rootKeys ?? data.relations?.rowKeys ?? []
  const expanded = new Set(data.state?.expandedKeys ?? [])
  return visibleTreeItems({
    roots: rootKeys,
    children: (key) => data.relations?.childrenByKey?.[key] ?? [],
    isExpanded: (key) => expanded.has(key),
  })
}

const visibleCells = (data: PatternData): readonly (readonly Key[])[] => {
  const cols = data.relations?.columnKeys ?? []
  return visibleRowKeys(data).map((rowKey) =>
    cols
      .map((columnKey) => data.relations?.cells?.find((c) => c.rowKey === rowKey && c.columnKey === columnKey)?.cellKey)
      .filter((k): k is Key => Boolean(k)),
  )
}

const cellRowKey = (data: PatternData, cellKey: Key | null | undefined): Key | null => {
  if (!cellKey) return null
  return data.relations?.cells?.find((c) => c.cellKey === cellKey)?.rowKey ?? null
}

defineVisibleOrder('treegridVisibleCells', (_v, data) => visibleCells(data).flat())

defineAriaSource('state.treegridRowCount', (ctx) =>
  (ctx.data.state as { rowCount?: number } | undefined)?.rowCount ?? ctx.data.relations?.rowKeys?.length,
)
defineAriaSource('state.treegridColCount', (ctx) =>
  (ctx.data.state as { colCount?: number } | undefined)?.colCount ?? ctx.data.relations?.columnKeys?.length,
)
defineAriaSource('state.rowLevelByKey', (ctx) => (ctx.key ? ctx.data.state?.levelByKey?.[ctx.key] : undefined))
defineAriaSource('state.rowExpanded', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

defineKeyToken('$activeRowKey', (_key, activeKey, ctx) => {
  if (!activeKey || !ctx) return null
  return cellRowKey(ctx.data, activeKey)
})

definePredicate('treegridActiveAtFirstColumn', (_p, ctx) => {
  if (!ctx.activeKey) return false
  const firstCol = ctx.data.relations?.columnKeys?.[0]
  if (!firstCol) return false
  const cell = ctx.data.relations?.cells?.find((c) => c.cellKey === ctx.activeKey)
  return cell?.columnKey === firstCol
})
definePredicate('treegridActiveRowHasChildren', (_p, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return false
  return (ctx.data.relations?.childrenByKey?.[rowKey]?.length ?? 0) > 0
})
definePredicate('treegridActiveRowIsExpanded', (_p, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return false
  return ctx.data.state?.expandedKeys?.includes(rowKey) ?? false
})

defineNavigationTarget('treegridCell', (target, ctx) => {
  const action = target.action as TreegridAction
  return moveGrid(visibleCells(ctx.data), ctx.activeKey, action)
})

defineNavigationTarget('treegridParentRowFirstCell', (_target, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return null
  const parent = ctx.parentByKey.get(rowKey)
  if (!parent) return null
  const firstCol = ctx.data.relations?.columnKeys?.[0]
  if (!firstCol) return null
  return ctx.data.relations?.cells?.find((c) => c.rowKey === parent && c.columnKey === firstCol)?.cellKey ?? null
})

export { visibleRowKeys as treegridVisibleRowKeys, visibleCells as treegridVisibleCells }

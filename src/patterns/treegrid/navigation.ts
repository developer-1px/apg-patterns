import { findApgGridLocation, moveApgGrid } from '../../internal/collectionNavigation'
import {
  defineNavigationTarget,
  defineVisibleOrder,
} from '../../kernel/patternKernel'
import { cellRowKey, visibleCells } from './geometry'

type TreegridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

let treegridNavigationRegistered = false

export function registerTreegridNavigation() {
  if (treegridNavigationRegistered) return
  treegridNavigationRegistered = true

defineVisibleOrder('treegridVisibleCells', (_v, data) => visibleCells(data).flat())

defineNavigationTarget('treegridCell', (target, ctx) => {
  const action = target.action as TreegridAction
  return moveApgGrid(visibleCells(ctx.data), ctx.activeKey, action)
})

const PAGE_STEP = 10

defineNavigationTarget('treegridPage', (target, ctx) => {
  const direction = target.direction ?? 'down'
  const rows = visibleCells(ctx.data)
  if (!ctx.activeKey) return null
  const location = findApgGridLocation(rows, ctx.activeKey)
  if (!location) return null
  const nextRowIndex = direction === 'down'
    ? Math.min(rows.length - 1, location.rowIndex + PAGE_STEP)
    : Math.max(0, location.rowIndex - PAGE_STEP)
  if (nextRowIndex === location.rowIndex) return null
  const row = rows[nextRowIndex] ?? []
  return row[Math.min(location.columnIndex, row.length - 1)] ?? null
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
}

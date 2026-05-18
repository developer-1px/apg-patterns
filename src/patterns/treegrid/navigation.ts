import { moveGrid } from '@interactive-os/collection-navigation'
import {
  defineNavigationTarget,
  defineVisibleOrder,
} from '../../kernel/patternKernel'
import { cellRowKey, visibleCells, visibleRowKeys } from './geometry'

type TreegridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

defineVisibleOrder('treegridVisibleCells', (_v, data) => visibleCells(data).flat())

defineNavigationTarget('treegridCell', (target, ctx) => {
  const action = target.action as TreegridAction
  return moveGrid(visibleCells(ctx.data), ctx.activeKey, action)
})

const PAGE_STEP = 10

defineNavigationTarget('treegridPage', (target, ctx) => {
  const direction = (target as { direction?: 'up' | 'down' }).direction ?? 'down'
  const rows = visibleCells(ctx.data)
  if (!ctx.activeKey) return null
  let rowIndex = -1
  let colIndex = -1
  for (let r = 0; r < rows.length; r += 1) {
    const c = rows[r]!.indexOf(ctx.activeKey)
    if (c !== -1) {
      rowIndex = r
      colIndex = c
      break
    }
  }
  if (rowIndex === -1) return null
  const nextRowIndex = direction === 'down'
    ? Math.min(rows.length - 1, rowIndex + PAGE_STEP)
    : Math.max(0, rowIndex - PAGE_STEP)
  if (nextRowIndex === rowIndex) return null
  const row = rows[nextRowIndex] ?? []
  return row[Math.min(colIndex, row.length - 1)] ?? null
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

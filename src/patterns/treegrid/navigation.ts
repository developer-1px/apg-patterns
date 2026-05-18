import { moveGrid } from '@interactive-os/collection-navigation'
import {
  defineNavigationTarget,
  defineVisibleOrder,
} from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'
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

type TreegridRowAction = 'up' | 'down' | 'gridStart' | 'gridEnd'

const activeRowKey = (ctx: { activeKey: Key | null; data: PatternData }): Key | null => {
  if (!ctx.activeKey) return null
  const rows = visibleRowKeys(ctx.data)
  if (rows.includes(ctx.activeKey)) return ctx.activeKey
  return cellRowKey(ctx.data, ctx.activeKey)
}

defineNavigationTarget('treegridRow', (target, ctx) => {
  const action = target.action as TreegridRowAction
  const rows = visibleRowKeys(ctx.data)
  if (rows.length === 0) return null
  if (action === 'gridStart') return rows[0] ?? null
  if (action === 'gridEnd') return rows[rows.length - 1] ?? null
  const current = activeRowKey(ctx)
  if (!current) return rows[0] ?? null
  const idx = rows.indexOf(current)
  if (idx === -1) return null
  if (action === 'up') return rows[Math.max(0, idx - 1)] ?? null
  if (action === 'down') return rows[Math.min(rows.length - 1, idx + 1)] ?? null
  return null
})

defineNavigationTarget('treegridRowPage', (target, ctx) => {
  const direction = (target as { direction?: 'up' | 'down' }).direction ?? 'down'
  const rows = visibleRowKeys(ctx.data)
  if (rows.length === 0) return null
  const current = activeRowKey(ctx)
  if (!current) return rows[0] ?? null
  const idx = rows.indexOf(current)
  if (idx === -1) return null
  const next = direction === 'down'
    ? Math.min(rows.length - 1, idx + PAGE_STEP)
    : Math.max(0, idx - PAGE_STEP)
  return rows[next] ?? null
})

export { visibleRowKeys as treegridVisibleRowKeys, visibleCells as treegridVisibleCells }

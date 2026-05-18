import { moveGrid } from '@interactive-os/collection-navigation'
import { defineAriaSource, defineNavigationTarget, defineVisibleOrder } from '../../kernel/patternKernel'
import type { Key, PatternData } from '../../schema'

type GridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'
type GridPageAction = 'pageUp' | 'pageDown'
const PAGE_SIZE = 5

export const gridRows = (data: PatternData): readonly (readonly Key[])[] =>
  (data.relations?.rowKeys ?? []).map((rowKey) =>
    (data.relations?.columnKeys ?? [])
      .map((columnKey) => data.relations?.cells?.find((cell) => cell.rowKey === rowKey && cell.columnKey === columnKey)?.cellKey)
      .filter((cellKey): cellKey is Key => Boolean(cellKey)),
  )

defineVisibleOrder('gridRows', (_visibleOrder, data) => gridRows(data).flat())

defineAriaSource('state.readonly', (ctx) => ctx.data.state?.readonly === true || undefined)
defineAriaSource('state.multiselectable', (ctx) =>
  ctx.options?.selectionMode === 'multiple' || ctx.data.state?.multiselectable === true || undefined,
)

defineNavigationTarget('gridCell', (target, ctx) => {
  const action = target.action
  if (
    action !== 'left' &&
    action !== 'right' &&
    action !== 'up' &&
    action !== 'down' &&
    action !== 'rowStart' &&
    action !== 'rowEnd' &&
    action !== 'gridStart' &&
    action !== 'gridEnd'
  ) {
    throw new Error(`Unsupported grid action: ${String(action)}`)
  }
  return moveGrid(gridRows(ctx.data), ctx.activeKey, action as GridAction)
})

defineNavigationTarget('gridPage', (target, ctx) => {
  const action = target.action as GridPageAction
  if (action !== 'pageUp' && action !== 'pageDown') {
    throw new Error(`Unsupported grid page action: ${String(action)}`)
  }
  const rows = gridRows(ctx.data)
  let location: { rowIndex: number; columnIndex: number } | null = null
  for (let r = 0; r < rows.length; r += 1) {
    const c = rows[r]!.indexOf(ctx.activeKey)
    if (c >= 0) {
      location = { rowIndex: r, columnIndex: c }
      break
    }
  }
  if (!location) return null
  const delta = action === 'pageDown' ? PAGE_SIZE : -PAGE_SIZE
  const targetRowIndex = Math.max(0, Math.min(rows.length - 1, location.rowIndex + delta))
  const targetRow = rows[targetRowIndex] ?? []
  return targetRow[Math.min(location.columnIndex, targetRow.length - 1)] ?? null
})

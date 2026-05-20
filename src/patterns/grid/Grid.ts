import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactGridCell } from './gridCell'
import type { GridData } from './gridRuntimeState'
import { useGridPattern } from './useGridPattern'

type GridDataItem = PatternItem

type DivProps = ComponentPropsWithoutRef<'div'>
type InputProps = ComponentPropsWithoutRef<'input'>

export interface GridProps<TItem extends GridDataItem = GridDataItem> {
  data: GridData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCell?: (cell: ReactGridCell, dataItem: TItem) => ReactNode
}

export function Grid<TItem extends GridDataItem = GridDataItem>({ data, onEvent, options, className, renderCell }: GridProps<TItem>) {
  const grid = useGridPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...grid.gridProps, className } as DivProps,
    grid.rows.map((row) =>
      createElement(
        'div',
        { key: row.key, ...row.rowProps } as DivProps & { key: Key },
        row.cells.map((cell) =>
          createElement('div', { key: cell.key, ...cell.cellProps } as DivProps & { key: Key }, renderCell?.(cell, data.items[cell.key]) ?? renderGridCell(cell)),
        ),
      ),
    ),
  )
}

function renderGridCell(cell: ReactGridCell) {
  if (cell.editing) return createElement('input', cell.editInputProps as InputProps)
  return cell.value
}

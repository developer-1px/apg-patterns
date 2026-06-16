import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useTablePattern, type ReactTableCell } from './useTablePattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface TableProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent?: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCell?: (cell: ReactTableCell, dataItem: TItem) => ReactNode
}

export function Table<TItem extends PatternItem = PatternItem>({ data, onEvent = () => undefined, options, className, renderCell }: TableProps<TItem>) {
  const table = useTablePattern(data, onEvent, options)

  return createElement(
    'div',
    { ...table.tableProps, className } as DivProps,
    table.rows.map((row) =>
      createElement(
        'div',
        { key: row.key, ...row.rowProps },
        row.cells.map((cell) =>
          createElement('div', { key: cell.key, ...cell.cellProps }, renderCell?.(cell, data.items[cell.key]) ?? cell.label),
        ),
      ),
    ),
  )
}

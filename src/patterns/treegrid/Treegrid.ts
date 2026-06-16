import { createElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useTreegridPattern, type ReactTreegridCell } from './useTreegridPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface TreegridProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCell?: (cell: ReactTreegridCell, dataItem: TItem) => ReactNode
}

export function Treegrid<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderCell }: TreegridProps<TItem>) {
  const treegrid = useTreegridPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...treegrid.treegridProps, className } as DivProps,
    treegrid.rows.map((row) =>
      createElement(
        'div',
        { key: row.key, ...row.rowProps } as DivProps & { key: Key },
        row.cells.map((cell) => {
          const style: CSSProperties | undefined = cell.indent ? { paddingInlineStart: `${cell.indent}px` } : undefined
          return createElement(
            'div',
            { key: cell.key, ...cell.cellProps, style } as DivProps & { key: Key },
            renderCell?.(cell, data.items[cell.key]) ?? cell.value,
          )
        }),
      ),
    ),
  )
}

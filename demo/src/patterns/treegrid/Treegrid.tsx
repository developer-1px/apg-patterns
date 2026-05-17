import type { HTMLAttributes } from 'react'
import { createPatternRuntime, usePatternAutoFocus, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { treegridDefinition, treegridVisibleCells, treegridVisibleRowKeys } from '../../../../src/patterns/treegrid/definition'

type Props = HTMLAttributes<HTMLElement>

export function Treegrid({
  data,
  onEvent,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}) {
  const options = ((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions
  const runtime = createPatternRuntime({
    definition: treegridDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options },
    onEvent: (event) => {
      if (event.type === 'extension' && event.name === 'treegridToggleActiveRow') {
        const activeKey = data.state?.activeKey
        const rowKey = activeKey
          ? data.relations?.cells?.find((c) => c.cellKey === activeKey)?.rowKey
          : undefined
        if (rowKey) {
          const expanded = Boolean((event.payload as { expanded?: boolean } | undefined)?.expanded)
          onEvent({ type: 'expand', key: rowKey, expanded })
        }
        return
      }
      onEvent(event)
    },
    keyToElementId: (key) => `treegridcell-${key}`,
  })

  usePatternAutoFocus(runtime)

  const rowKeys = treegridVisibleRowKeys(data)
  const cells = treegridVisibleCells(data)
  const valueByKey = data.state?.valueByKey ?? {}
  const columnKeys = data.relations?.columnKeys ?? []
  const rootProps = runtime.getPartProps('treegrid') as Props

  return (
    <div
      {...rootProps}
      className="inline-grid bg-white text-sm text-zinc-800 outline-none focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-950 dark:text-zinc-300"
      style={{ gridTemplateColumns: `repeat(${columnKeys.length}, minmax(120px, 1fr))` }}
    >
      {rowKeys.map((rowKey, rowIndex) => {
        const rowProps = runtime.getPartProps('row', rowKey) as Props
        const rowCells = cells[rowIndex] ?? []
        const level = data.state?.levelByKey?.[rowKey]
        return (
          <div key={rowKey} {...rowProps} className="contents">
            {rowCells.map((cellKey, colIndex) => {
              const part = data.items[cellKey]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
              const cellProps = runtime.getPartProps(part, cellKey) as Props
              const state = runtime.getItemState(cellKey, part)
              const displayValue = valueByKey[cellKey] !== undefined ? String(valueByKey[cellKey]) : data.items[cellKey]?.label
              const indent = part === 'gridcell' && colIndex === 0 && level ? (level - 1) * 16 : 0
              return (
                <div
                  key={cellKey}
                  {...cellProps}
                  data-active={state.active ? '' : undefined}
                  className="min-h-8 px-2 py-1 outline-none aria-selected:bg-zinc-100 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-400 dark:aria-selected:bg-zinc-900 dark:data-active:bg-zinc-900"
                  style={indent ? { paddingLeft: `${8 + indent}px` } : undefined}
                >
                  {displayValue}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

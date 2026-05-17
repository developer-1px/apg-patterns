import type { HTMLAttributes } from 'react'
import { createPatternRuntime, usePatternEffects, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
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
    onEvent,
    keyToElementId: (key) => `treegridcell-${key}`,
  })

  usePatternEffects({ definition: treegridDefinition, data, keyToElementId: runtime.keyToElementId })

  const rowKeys = treegridVisibleRowKeys(data)
  const cells = treegridVisibleCells(data)
  const valueByKey = data.state?.valueByKey ?? {}
  const columnKeys = data.relations?.columnKeys ?? []
  const rootProps = runtime.getPartProps('treegrid') as Props

  return (
    <div
      {...rootProps}
      className="inline-grid overflow-hidden rounded-xl bg-white/80 text-sm text-zinc-800 shadow-sm shadow-zinc-200/70 ring-1 ring-black/[0.03] outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-zinc-400 dark:bg-white/[0.04] dark:text-zinc-300 dark:shadow-black/20 dark:ring-white/[0.05] dark:focus-visible:outline-zinc-500"
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
                  className="min-h-8 px-2 py-1 outline-none aria-selected:bg-zinc-100/90 data-active:bg-white/70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-zinc-400 dark:aria-selected:bg-white/[0.08] dark:data-active:bg-white/[0.05] dark:focus-visible:outline-zinc-500"
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

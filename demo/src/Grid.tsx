import { useLayoutEffect, useMemo } from 'react'
import type { HTMLAttributes } from 'react'
import { createPatternRuntime, type PatternData, type PatternEvent, type PatternOptions } from '../../src'
import { gridDefinition, gridRows } from './gridRuntime'

type Props = HTMLAttributes<HTMLElement>

export function Grid({
  data,
  onEvent,
  options,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}) {
  const runtime = useMemo(
    () =>
      createPatternRuntime({
        definition: gridDefinition,
        data,
        options: { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options },
        onEvent,
        keyToElementId: (key) => `gridcell-${key}`,
      }),
    [data, onEvent, options],
  )

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return
    document.getElementById(`gridcell-${CSS.escape(activeKey)}`)?.focus({ preventScroll: true })
  }, [data.state?.activeKey])

  const rows = gridRows(data)
  const rootProps = runtime.getPartProps('grid') as Props

  return (
    <div
      {...rootProps}
      className="inline-grid overflow-hidden rounded-md border border-zinc-200 bg-white text-sm text-zinc-800 outline-none focus:outline focus:outline-2 focus:outline-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300 dark:focus:outline-zinc-400"
      style={{ gridTemplateColumns: `repeat(${data.relations?.columnKeys?.length ?? 1}, minmax(120px, 1fr))` }}
    >
      {(data.relations?.rowKeys ?? []).map((rowKey, rowIndex) => {
        const rowProps = runtime.getPartProps('row', rowKey) as Props
        return (
          <div key={rowKey} {...rowProps} className="contents">
            {rows[rowIndex]?.map((cellKey) => {
              const part = data.items[cellKey]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
              const cellProps = runtime.getPartProps(part, cellKey) as Props
              const state = runtime.getItemState(cellKey, part)
              return (
                <div
                  key={cellKey}
                  {...cellProps}
                  data-active={state.active ? '' : undefined}
                  className="min-h-9 border-b border-r border-zinc-200 px-2 py-2 outline-none aria-selected:bg-zinc-100 aria-selected:text-zinc-950 data-active:bg-zinc-50 focus:outline focus:outline-2 focus:outline-zinc-500 dark:border-zinc-800 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50 dark:data-active:bg-zinc-900 dark:focus:outline-zinc-400"
                >
                  {data.items[cellKey]?.label}
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

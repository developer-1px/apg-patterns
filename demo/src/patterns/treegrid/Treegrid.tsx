import type { HTMLAttributes } from 'react'
import { createPatternRuntime, usePatternEffects, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'
import { treegridDefinition, treegridVisibleCells, treegridVisibleRowKeys } from '../../../../src/patterns/treegrid/definition'

type Rows = readonly (readonly string[])[]
const findCell = (rows: Rows, key: string): [number, number] => {
  for (let r = 0; r < rows.length; r += 1) {
    const c = rows[r]!.indexOf(key)
    if (c !== -1) return [r, c]
  }
  return [-1, -1]
}
const rectangleKeys = (rows: Rows, anchor: string, extent: string): string[] => {
  const [aR, aC] = findCell(rows, anchor)
  const [eR, eC] = findCell(rows, extent)
  if (aR < 0 || eR < 0) return [extent]
  const rMin = Math.min(aR, eR), rMax = Math.max(aR, eR)
  const cMin = Math.min(aC, eC), cMax = Math.max(aC, eC)
  const out: string[] = []
  for (let r = rMin; r <= rMax; r += 1) {
    for (let c = cMin; c <= cMax; c += 1) {
      const k = rows[r]?.[c]
      if (k) out.push(k)
    }
  }
  return out
}
const stepExtent = (rows: Rows, current: string, direction: string): string => {
  const [r, c] = findCell(rows, current)
  if (r < 0) return current
  if (direction === 'right') return rows[r]?.[c + 1] ?? current
  if (direction === 'left') return rows[r]?.[c - 1] ?? current
  if (direction === 'down') return rows[r + 1]?.[c] ?? current
  if (direction === 'up') return rows[r - 1]?.[c] ?? current
  if (direction === 'rowStart') return rows[r]?.[0] ?? current
  if (direction === 'rowEnd') return rows[r]?.[rows[r]!.length - 1] ?? current
  return current
}

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
      if (event.type === 'extension' && event.name?.startsWith('treegridSelect') ||
          event.type === 'extension' && event.name === 'treegridExtendSelection') {
        const rows = treegridVisibleCells(data) as Rows
        const active = data.state?.activeKey as string | undefined
        if (!active) return
        const anchor = (data.state?.anchorKey as string | undefined) ?? active
        if (event.name === 'treegridSelectAll') {
          const keys = rows.flat()
          if (keys.length > 0) {
            onEvent({ type: 'select', keys, anchorKey: keys[0]!, extentKey: keys[keys.length - 1]! })
          }
          return
        }
        if (event.name === 'treegridSelectColumn') {
          const [, c] = findCell(rows, active)
          if (c < 0) return
          const keys = rows.map((row) => row[c]).filter((k): k is string => Boolean(k))
          if (keys.length > 0) {
            onEvent({ type: 'select', keys, anchorKey: keys[0]!, extentKey: keys[keys.length - 1]! })
          }
          return
        }
        if (event.name === 'treegridSelectRow') {
          const [r] = findCell(rows, active)
          if (r < 0) return
          const row = rows[r] ?? []
          const keys = [...row]
          if (keys.length > 0) {
            onEvent({ type: 'select', keys, anchorKey: keys[0]!, extentKey: keys[keys.length - 1]! })
          }
          return
        }
        if (event.name === 'treegridExtendSelection') {
          const direction = (event.payload as { direction?: string } | undefined)?.direction ?? 'right'
          const newExtent = stepExtent(rows, active, direction)
          const keys = rectangleKeys(rows, anchor, newExtent)
          onEvent({ type: 'select', keys, anchorKey: anchor, extentKey: newExtent })
          return
        }
      }
      onEvent(event)
    },
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

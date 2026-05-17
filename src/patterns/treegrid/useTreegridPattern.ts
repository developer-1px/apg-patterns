import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { treegridDefinition, treegridVisibleCells, treegridVisibleRowKeys } from './definition'

export interface ReactTreegridCell {
  key: Key
  label: string
  value: string
  kind: 'columnheader' | 'gridcell'
  state: ReactRenderItemState
  indent: number
  cellProps: ReactPatternProps
}

export interface ReactTreegridRow {
  key: Key
  rowProps: ReactPatternProps
  cells: readonly ReactTreegridCell[]
}

export interface ReactTreegridRuntime {
  treegridProps: ReactPatternProps
  rows: readonly ReactTreegridRow[]
  columnCount: number
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useTreegridPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreegridRuntime {
  const runtimeOptions = {
    focusStrategy: 'rovingTabIndex',
    selectionMode: 'single',
    ...(options ?? ((data.state as { options?: PatternOptions } | undefined)?.options ?? {})),
  } satisfies PatternOptions
  const runtime = createPatternRuntime({
    definition: treegridDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'treegridcell-'}${key}`,
  })

  usePatternEffects({ definition: treegridDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get treegridProps() {
      return runtime.getPartProps('treegrid') as ReactPatternProps
    },
    get rows() {
      const rowKeys = treegridVisibleRowKeys(data)
      const cells = treegridVisibleCells(data)
      return rowKeys.map((rowKey, rowIndex) => ({
        key: rowKey,
        rowProps: runtime.getPartProps('row', rowKey) as ReactPatternProps,
        cells: (cells[rowIndex] ?? []).map((cellKey, colIndex) => createTreegridCell(runtime, data, rowKey, cellKey, colIndex)),
      }))
    },
    columnCount: data.relations?.columnKeys?.length ?? 1,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createTreegridCell(
  runtime: ReturnType<typeof createPatternRuntime>,
  data: PatternData,
  rowKey: Key,
  cellKey: Key,
  colIndex: number,
): ReactTreegridCell {
  const part = data.items[cellKey]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
  const state = runtime.getItemState(cellKey, part)
  const valueByKey = data.state?.valueByKey ?? {}
  const value = valueByKey[cellKey] !== undefined ? String(valueByKey[cellKey]) : data.items[cellKey]?.label ?? ''
  const level = data.state?.levelByKey?.[rowKey]
  return {
    key: cellKey,
    label: data.items[cellKey]?.label ?? cellKey,
    value,
    kind: part,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.selected),
      disabled: Boolean(state.disabled),
    },
    indent: part === 'gridcell' && colIndex === 0 && level ? (level - 1) * 16 : 0,
    cellProps: runtime.getPartProps(part, cellKey) as ReactPatternProps,
  }
}

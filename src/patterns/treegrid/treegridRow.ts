import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { visibleCells, visibleRowKeys } from './geometry'

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

export function createTreegridRows({
  runtime,
  data,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
}): readonly ReactTreegridRow[] {
  const rowKeys = visibleRowKeys(data)
  const cells = visibleCells(data, rowKeys)
  return rowKeys.map((rowKey, rowIndex) => ({
    key: rowKey,
    rowProps: reactProps(runtime.getPartProps('row', rowKey)),
    cells: (cells[rowIndex] ?? []).map((cellKey, colIndex) => createTreegridCell(runtime, data, rowKey, cellKey, colIndex)),
  }))
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
    cellProps: reactProps(runtime.getPartProps(part, cellKey)),
  }
}

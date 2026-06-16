import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createGridCell, type ReactGridCell } from './gridCell'
import type { GridSort, GridValue } from './gridRuntimeState'
import { gridRows } from './navigation'

export interface ReactGridRow {
  key: Key
  rowProps: ReactPatternProps
  cells: readonly ReactGridCell[]
}

export function createGridRows({
  runtime,
  data,
  editableKeys,
  editingKey,
  editDraftByKey,
  valueByKey,
  sortByKey,
  commitEdit,
  cancelEdit,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  editableKeys: readonly string[]
  editingKey: string | null
  editDraftByKey: Record<string, GridValue>
  valueByKey: Readonly<Record<Key, GridValue>>
  sortByKey: Readonly<Record<Key, GridSort>>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): readonly ReactGridRow[] {
  return gridRows(data).map((cellKeys, rowIndex) => {
    const rowKey = data.relations?.rowKeys?.[rowIndex] ?? `row-${rowIndex}`
    return {
      key: rowKey,
      rowProps: reactProps(runtime.getPartProps('row', rowKey)),
      cells: cellKeys.map((cellKey) => createGridCell({
        runtime,
        data,
        key: cellKey,
        editableKeys,
        editingKey,
        editDraftByKey,
        valueByKey,
        sortByKey,
        commitEdit,
        cancelEdit,
        onEvent,
      })),
    }
  })
}

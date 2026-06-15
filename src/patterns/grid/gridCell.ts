import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { createGridEditInputProps, type ReactGridEditInputProps } from './gridEditInputProps'

export interface ReactGridCell {
  key: Key
  label: string
  value: string
  kind: 'columnheader' | 'gridcell' | 'rowheader'
  state: ReactRenderItemState
  editable: boolean
  editing: boolean
  sort: 'ascending' | 'descending' | 'other' | null
  cellProps: ReactPatternProps
  editInputProps: ReactGridEditInputProps
}

export function createGridCell(input: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  editableKeys: readonly string[]
  editingKey: string | null
  editDraftByKey: Record<string, string | number | boolean | null>
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  sortByKey: Readonly<Record<Key, 'ascending' | 'descending' | 'other'>>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): ReactGridCell {
  const part = getGridCellPart(input.data.items[input.key]?.kind)
  const state = input.runtime.getItemState(input.key, part)
  const value = input.valueByKey[input.key] !== undefined ? String(input.valueByKey[input.key]) : input.data.items[input.key]?.label ?? ''
  return {
    key: input.key,
    label: input.data.items[input.key]?.label ?? input.key,
    value,
    kind: part,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.selected),
      disabled: Boolean(state.disabled),
    },
    editable: input.editableKeys.includes(input.key),
    editing: input.editingKey === input.key,
    sort: part === 'columnheader' ? input.sortByKey[input.key] ?? null : null,
    cellProps: reactProps(input.runtime.getPartProps(part, input.key)),
    editInputProps: createGridEditInputProps({
      key: input.key,
      editDraftByKey: input.editDraftByKey,
      commitEdit: input.commitEdit,
      cancelEdit: input.cancelEdit,
      onEvent: input.onEvent,
    }),
  }
}

function getGridCellPart(kind: unknown): ReactGridCell['kind'] {
  return kind === 'columnheader' || kind === 'rowheader' ? kind : 'gridcell'
}

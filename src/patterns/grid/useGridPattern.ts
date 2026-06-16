import type { InputHTMLAttributes } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { gridDefinition } from './definition'
import { getGridRuntimeState, type GridData, type GridSort, type GridValue } from './gridRuntimeState'
import { createGridEditActions, createGridRuntimeEventHandler } from './gridRuntimeEvents'
import { gridRows } from './navigation'
import { usePatternElementId } from '../../adapters/reactDomIds'

type ReactGridEditInputProps = InputHTMLAttributes<HTMLInputElement> & { 'data-edit': string }

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

export interface ReactGridRow {
  key: Key
  rowProps: ReactPatternProps
  cells: readonly ReactGridCell[]
}

export interface ReactGridRuntime {
  gridProps: ReactPatternProps
  rows: readonly ReactGridRow[]
  columnCount: number
  state: {
    editingKey: Key | null
    activeKey: Key | null
    selectedKeys: readonly Key[]
    anchorKey: Key | null
    extentKey: Key | null
  }
  actions: {
    commitEdit(): void
    cancelEdit(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useGridPattern(data: GridData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactGridRuntime {
  const { runtimeOptions, editableKeys, editingKey, editDraftByKey, valueByKey, sortByKey } = getGridRuntimeState(data, options)
  const keyToElementId = usePatternElementId(runtimeOptions, 'gridcell-')

  const runtime = createPatternRuntime({
    definition: gridDefinition,
    data,
    options: runtimeOptions,
    onEvent: createGridRuntimeEventHandler({ data, editableKeys, editingKey, valueByKey, sortByKey, onEvent }),
    keyToElementId,
  })

  usePatternEffects({ definition: gridDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  const { commitEdit, cancelEdit } = createGridEditActions({ editingKey, editDraftByKey, onEvent })

  return {
    get gridProps() {
      return reactProps(runtime.getPartProps('grid'))
    },
    get rows() {
      return createGridRows({ runtime, data, editableKeys, editingKey, editDraftByKey, valueByKey, sortByKey, commitEdit, cancelEdit, onEvent })
    },
    columnCount: data.relations?.columnKeys?.length ?? 1,
    state: {
      editingKey,
      activeKey: data.state?.activeKey ?? null,
      selectedKeys: data.state?.selectedKeys ?? [],
      anchorKey: data.state?.anchorKey ?? null,
      extentKey: data.state?.extentKey ?? null,
    },
    actions: { commitEdit, cancelEdit },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createGridRows({
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

function createGridCell(input: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  editableKeys: readonly string[]
  editingKey: string | null
  editDraftByKey: Record<string, GridValue>
  valueByKey: Readonly<Record<Key, GridValue>>
  sortByKey: Readonly<Record<Key, GridSort>>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): ReactGridCell {
  const kind = input.data.items[input.key]?.kind
  const part: ReactGridCell['kind'] = kind === 'columnheader' || kind === 'rowheader' ? kind : 'gridcell'
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
    editInputProps: {
      'data-edit': '',
      value: String(input.editDraftByKey[input.key] ?? ''),
      onChange: (event) => input.onEvent({ type: 'editDraft', key: input.key, value: event.currentTarget.value }),
      onKeyDown: (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
          input.commitEdit()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          input.cancelEdit()
        } else if (event.key === 'Tab') {
          event.stopPropagation()
          input.commitEdit()
        } else {
          event.stopPropagation()
        }
      },
      onBlur: input.commitEdit,
    },
  }
}

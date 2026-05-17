import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { gridDefinition, gridRows } from './definition'

export interface ReactGridCell {
  key: Key
  label: string
  value: string
  kind: 'columnheader' | 'gridcell'
  state: ReactRenderItemState
  editable: boolean
  editing: boolean
  sort: 'ascending' | 'descending' | 'other' | null
  cellProps: ReactPatternProps
  editInputProps: ReactPatternProps & {
    value: string
    onChange(event: { currentTarget: { value: string } }): void
    onKeyDown(event: KeyboardEvent<HTMLInputElement>): void
    onBlur(): void
  }
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

export function useGridPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactGridRuntime {
  const dataState = data.state as {
    options?: PatternOptions
    multiselectable?: boolean
    editableKeys?: readonly string[]
    editingKey?: string | null
    editDraftByKey?: Record<string, string>
  } | undefined
  const runtimeOptions = {
    focusStrategy: 'rovingTabIndex',
    selectionMode: dataState?.multiselectable ? 'multiple' : 'single',
    ...(options ?? dataState?.options ?? {}),
  } satisfies PatternOptions
  const editableKeys = dataState?.editableKeys ?? []
  const editingKey = dataState?.editingKey ?? null
  const editDraftByKey = dataState?.editDraftByKey ?? {}
  const valueByKey = data.state?.valueByKey ?? {}
  const sortByKey = data.state?.sortByKey ?? {}

  const runtime = createPatternRuntime({
    definition: gridDefinition,
    data,
    options: runtimeOptions,
    onEvent: (event) => {
      if (event.type === 'activate') {
        const key = event.key
        if (data.items[key]?.kind === 'columnheader') {
          const current = sortByKey[key]
          onEvent({ type: 'sort', key, sort: current === 'ascending' ? 'descending' : 'ascending' })
          return
        }
        if (editableKeys.includes(key)) {
          onEvent({ type: 'editStart', key, value: String(valueByKey[key] ?? data.items[key]?.label ?? '') })
          return
        }
      }
      if (event.type === 'dismiss') {
        onEvent({ type: 'editEnd', key: editingKey ?? undefined })
        return
      }
      onEvent(event)
    },
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'gridcell-'}${key}`,
  })

  usePatternEffects({ definition: gridDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  const commitEdit = () => {
    if (!editingKey) return
    onEvent({ type: 'value', key: editingKey, value: editDraftByKey[editingKey] ?? '' })
    onEvent({ type: 'editEnd', key: editingKey })
  }
  const cancelEdit = () => onEvent({ type: 'editEnd', key: editingKey ?? undefined })

  return {
    get gridProps() {
      return runtime.getPartProps('grid') as ReactPatternProps
    },
    get rows() {
      return gridRows(data).map((cellKeys, rowIndex) => {
        const rowKey = data.relations?.rowKeys?.[rowIndex] ?? `row-${rowIndex}`
        return {
          key: rowKey,
          rowProps: runtime.getPartProps('row', rowKey) as ReactPatternProps,
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
    },
    columnCount: data.relations?.columnKeys?.length ?? 1,
    state: {
      editingKey,
      activeKey: data.state?.activeKey ?? null,
    },
    actions: { commitEdit, cancelEdit },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createGridCell(input: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  key: Key
  editableKeys: readonly string[]
  editingKey: string | null
  editDraftByKey: Record<string, string>
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  sortByKey: Readonly<Record<Key, 'ascending' | 'descending' | 'other'>>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): ReactGridCell {
  const part = input.data.items[input.key]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
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
    cellProps: input.runtime.getPartProps(part, input.key) as ReactPatternProps,
    editInputProps: {
      'data-edit': '',
      value: input.editDraftByKey[input.key] ?? '',
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

import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createGridCell, type ReactGridCell } from './gridCell'
import { gridDefinition, gridRows } from './definition'

interface GridState extends PatternStateWithOptions {
  multiselectable?: boolean
  editableKeys?: readonly string[]
  editingKey?: string | null
  editDraftByKey?: Record<string, string | number | boolean | null>
}

type GridData = PatternData<PatternItem, GridState>

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

export function useGridPattern(data: GridData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactGridRuntime {
  const dataState = data.state
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
    onEvent({ type: 'value', key: editingKey, value: String(editDraftByKey[editingKey] ?? '') })
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

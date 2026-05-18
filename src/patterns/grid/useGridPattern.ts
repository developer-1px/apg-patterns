import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { gridDefinition } from './definition'
import { createGridEditActions, createGridRuntimeEventHandler } from './gridRuntimeEvents'
import { createGridRows, type ReactGridRow } from './gridRow'

interface GridState extends PatternStateWithOptions {
  multiselectable?: boolean
  editableKeys?: readonly string[]
  editingKey?: string | null
  editDraftByKey?: Record<string, string | number | boolean | null>
}

type GridData = PatternData<PatternItem, GridState>

export type { ReactGridCell } from './gridCell'
export type { ReactGridRow } from './gridRow'

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
    onEvent: createGridRuntimeEventHandler({ data, editableKeys, editingKey, valueByKey, sortByKey, onEvent }),
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'gridcell-'}${key}`,
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
    },
    actions: { commitEdit, cancelEdit },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

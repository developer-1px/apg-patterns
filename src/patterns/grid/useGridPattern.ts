import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { gridDefinition } from './definition'
import { getGridRuntimeState, type GridData } from './gridRuntimeState'
import { createGridEditActions, createGridRuntimeEventHandler } from './gridRuntimeEvents'
import { createGridRows, type ReactGridRow } from './gridRow'
import { usePatternElementId } from '../../adapters/reactDomIds'

export type { ReactGridCell } from './gridCell'
export type { ReactGridRow } from './gridRow'

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

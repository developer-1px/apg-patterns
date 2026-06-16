import type { Key, PatternData, PatternItem, PatternOptions, PatternState } from '../../schema'

export type GridValue = string | number | boolean | null
export type GridSort = 'ascending' | 'descending' | 'other'

interface GridState extends PatternState {
  multiselectable?: boolean
  editableKeys?: readonly string[]
  editingKey?: string | null
  editDraftByKey?: Record<string, GridValue>
}

export type GridData = PatternData<PatternItem, GridState>

interface GridRuntimeState {
  runtimeOptions: PatternOptions
  editableKeys: readonly string[]
  editingKey: Key | null
  editDraftByKey: Record<string, GridValue>
  valueByKey: Readonly<Record<Key, GridValue>>
  sortByKey: Readonly<Record<Key, GridSort>>
}

export function getGridRuntimeState(data: GridData, options?: PatternOptions): GridRuntimeState {
  const dataState = data.state
  const runtimeOptions = {
    focusStrategy: 'rovingTabIndex',
    selectionMode: dataState?.multiselectable ? 'multiple' : 'single',
    ...(options ?? {}),
  } satisfies PatternOptions

  return {
    runtimeOptions,
    editableKeys: dataState?.editableKeys ?? [],
    editingKey: dataState?.editingKey ?? null,
    editDraftByKey: dataState?.editDraftByKey ?? {},
    valueByKey: dataState?.valueByKey ?? {},
    sortByKey: dataState?.sortByKey ?? {},
  }
}

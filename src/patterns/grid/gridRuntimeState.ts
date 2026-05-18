import type { Key, PatternData, PatternItem, PatternOptions, PatternStateWithOptions } from '../../schema'

type GridValue = string | number | boolean | null
type GridSort = 'ascending' | 'descending' | 'other'

interface GridState extends PatternStateWithOptions {
  multiselectable?: boolean
  editableKeys?: readonly string[]
  editingKey?: string | null
  editDraftByKey?: Record<string, GridValue>
}

export type GridData = PatternData<PatternItem, GridState>

export interface GridRuntimeState {
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
    ...(options ?? dataState?.options ?? {}),
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

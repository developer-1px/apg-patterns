import type { z } from 'zod'
import { addUnknownKeyIssue } from './patternDataRefValidators'

export function validateStateRefs(
  state: {
    activeKey?: string | null
    anchorKey?: string | null
    extentKey?: string | null
    selectedKeys?: readonly string[]
    expandedKeys?: readonly string[]
    disabledKeys?: readonly string[]
    checkedByKey?: Record<string, unknown>
    pressedByKey?: Record<string, unknown>
    currentByKey?: Record<string, unknown>
    invalidByKey?: Record<string, unknown>
    requiredKeys?: readonly string[]
    busyKeys?: readonly string[]
    modalKeys?: readonly string[]
    levelByKey?: Record<string, unknown>
    posInSetByKey?: Record<string, unknown>
    setSizeByKey?: Record<string, unknown>
    rowIndexByKey?: Record<string, unknown>
    columnIndexByKey?: Record<string, unknown>
    sortByKey?: Record<string, unknown>
    valueByKey?: Record<string, unknown>
    rangeValueByKey?: Record<string, unknown>
    typeaheadTextByKey?: Record<string, unknown>
  } | undefined,
  keys: ReadonlySet<string>,
  ctx: z.RefinementCtx,
) {
  for (const keyField of ['activeKey', 'anchorKey', 'extentKey'] as const) {
    const key = state?.[keyField]
    if (key != null && !keys.has(key)) addUnknownKeyIssue(ctx, ['state', keyField], key)
  }

  for (const keyListField of ['selectedKeys', 'expandedKeys', 'disabledKeys', 'requiredKeys', 'busyKeys', 'modalKeys'] as const) {
    state?.[keyListField]?.forEach((key, index) => {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['state', keyListField, index], key)
    })
  }

  for (const byKeyField of [
    'checkedByKey',
    'pressedByKey',
    'currentByKey',
    'invalidByKey',
    'levelByKey',
    'posInSetByKey',
    'setSizeByKey',
    'rowIndexByKey',
    'columnIndexByKey',
    'sortByKey',
    'valueByKey',
    'rangeValueByKey',
    'typeaheadTextByKey',
  ] as const) {
    for (const key of Object.keys(state?.[byKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['state', byKeyField, key], key)
    }
  }
}

import type { z } from 'zod'

const addUnknownKeyIssue = (ctx: z.RefinementCtx, path: (string | number)[], key: string) => {
  ctx.addIssue({
    code: 'custom',
    path,
    message: `key "${key}" must exist in items`,
  })
}

/**
 * PatternData 의 cross-field referential integrity 검증.
 * 모든 relations/state/refs 키가 items 에 존재하는지 확인한다.
 * PatternDataSchema 의 .superRefine 으로 attach 된다.
 */
export const validatePatternDataRefs = (
  value: {
    items: Record<string, unknown>
    relations?: {
      rootKeys?: readonly string[]
      childrenByKey?: Record<string, readonly string[]>
      ownerByKey?: Record<string, string>
      controlsByKey?: Record<string, readonly string[]>
      rowKeys?: readonly string[]
      columnKeys?: readonly string[]
      cells?: readonly { rowKey: string; columnKey: string; cellKey: string }[]
    }
    state?: {
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
    }
    refs?: {
      domainIdByKey?: Record<string, unknown>
      pointerByKey?: Record<string, unknown>
    }
  },
  ctx: z.RefinementCtx,
) => {
  const keys = new Set(Object.keys(value.items))

  value.relations?.rootKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rootKeys', index], key)
  })

  for (const [parentKey, childKeys] of Object.entries(value.relations?.childrenByKey ?? {})) {
    if (!keys.has(parentKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey], parentKey)
    childKeys.forEach((childKey, index) => {
      if (!keys.has(childKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey, index], childKey)
    })
  }

  for (const [key, ownerKey] of Object.entries(value.relations?.ownerByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], key)
    if (!keys.has(ownerKey)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], ownerKey)
  }

  for (const [key, controlledKeys] of Object.entries(value.relations?.controlsByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key], key)
    controlledKeys.forEach((controlledKey, index) => {
      if (!keys.has(controlledKey)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key, index], controlledKey)
    })
  }

  value.relations?.rowKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rowKeys', index], key)
  })

  value.relations?.columnKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'columnKeys', index], key)
  })

  value.relations?.cells?.forEach((cell, index) => {
    if (!keys.has(cell.rowKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'rowKey'], cell.rowKey)
    if (!keys.has(cell.columnKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'columnKey'], cell.columnKey)
    if (!keys.has(cell.cellKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'cellKey'], cell.cellKey)
  })

  for (const keyField of ['activeKey', 'anchorKey', 'extentKey'] as const) {
    const key = value.state?.[keyField]
    if (key != null && !keys.has(key)) addUnknownKeyIssue(ctx, ['state', keyField], key)
  }

  for (const keyListField of ['selectedKeys', 'expandedKeys', 'disabledKeys', 'requiredKeys', 'busyKeys', 'modalKeys'] as const) {
    value.state?.[keyListField]?.forEach((key, index) => {
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
    for (const key of Object.keys(value.state?.[byKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['state', byKeyField, key], key)
    }
  }

  for (const refByKeyField of ['domainIdByKey', 'pointerByKey'] as const) {
    for (const key of Object.keys(value.refs?.[refByKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['refs', refByKeyField, key], key)
    }
  }
}

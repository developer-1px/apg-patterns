import type { z } from 'zod'

export function addUnknownKeyIssue(ctx: z.RefinementCtx, path: (string | number)[], key: string) {
  ctx.addIssue({
    code: 'custom',
    path,
    message: `key "${key}" must exist in items`,
  })
}

export function validateRelationRefs(
  relations: {
    rootKeys?: readonly string[]
    childrenByKey?: Record<string, readonly string[]>
    ownerByKey?: Record<string, string>
    controlsByKey?: Record<string, readonly string[]>
    rowKeys?: readonly string[]
    columnKeys?: readonly string[]
    cells?: readonly { rowKey: string; columnKey: string; cellKey: string }[]
  } | undefined,
  keys: ReadonlySet<string>,
  ctx: z.RefinementCtx,
) {
  relations?.rootKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rootKeys', index], key)
  })

  for (const [parentKey, childKeys] of Object.entries(relations?.childrenByKey ?? {})) {
    if (!keys.has(parentKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey], parentKey)
    childKeys.forEach((childKey, index) => {
      if (!keys.has(childKey)) addUnknownKeyIssue(ctx, ['relations', 'childrenByKey', parentKey, index], childKey)
    })
  }

  for (const [key, ownerKey] of Object.entries(relations?.ownerByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], key)
    if (!keys.has(ownerKey)) addUnknownKeyIssue(ctx, ['relations', 'ownerByKey', key], ownerKey)
  }

  for (const [key, controlledKeys] of Object.entries(relations?.controlsByKey ?? {})) {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key], key)
    controlledKeys.forEach((controlledKey, index) => {
      if (!keys.has(controlledKey)) addUnknownKeyIssue(ctx, ['relations', 'controlsByKey', key, index], controlledKey)
    })
  }

  relations?.rowKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'rowKeys', index], key)
  })

  relations?.columnKeys?.forEach((key, index) => {
    if (!keys.has(key)) addUnknownKeyIssue(ctx, ['relations', 'columnKeys', index], key)
  })

  relations?.cells?.forEach((cell, index) => {
    if (!keys.has(cell.rowKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'rowKey'], cell.rowKey)
    if (!keys.has(cell.columnKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'columnKey'], cell.columnKey)
    if (!keys.has(cell.cellKey)) addUnknownKeyIssue(ctx, ['relations', 'cells', index, 'cellKey'], cell.cellKey)
  })
}

export function validateRefsRefs(
  refs: {
    domainIdByKey?: Record<string, unknown>
    pointerByKey?: Record<string, unknown>
  } | undefined,
  keys: ReadonlySet<string>,
  ctx: z.RefinementCtx,
) {
  for (const refByKeyField of ['domainIdByKey', 'pointerByKey'] as const) {
    for (const key of Object.keys(refs?.[refByKeyField] ?? {})) {
      if (!keys.has(key)) addUnknownKeyIssue(ctx, ['refs', refByKeyField, key], key)
    }
  }
}

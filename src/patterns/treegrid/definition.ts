import { moveGrid, visibleTreeItems } from '@interactive-os/collection-navigation'
import { PatternDefinitionSchema } from '../../schema'
import {
  defineAriaSource,
  defineKeyToken,
  defineNavigationTarget,
  definePredicate,
  defineVisibleOrder,
  resolveKeyToken,
} from '../../patternKernel'
import type { Key, PatternData } from '../../schema'

type TreegridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

// ── visible rows (DFS over rootKeys/childrenByKey with expand filter) ─────
const visibleRowKeys = (data: PatternData): readonly Key[] => {
  const rootKeys = data.relations?.rootKeys ?? data.relations?.rowKeys ?? []
  const expanded = new Set(data.state?.expandedKeys ?? [])
  return visibleTreeItems({
    roots: rootKeys,
    children: (key) => data.relations?.childrenByKey?.[key] ?? [],
    isExpanded: (key) => expanded.has(key),
  })
}

// ── visible cell grid (row × column → cellKey) ────────────────────────────
const visibleCells = (data: PatternData): readonly (readonly Key[])[] => {
  const cols = data.relations?.columnKeys ?? []
  return visibleRowKeys(data).map((rowKey) =>
    cols
      .map((columnKey) => data.relations?.cells?.find((c) => c.rowKey === rowKey && c.columnKey === columnKey)?.cellKey)
      .filter((k): k is Key => Boolean(k)),
  )
}

// ── cell → row key ────────────────────────────────────────────────────────
const cellRowKey = (data: PatternData, cellKey: Key | null | undefined): Key | null => {
  if (!cellKey) return null
  return data.relations?.cells?.find((c) => c.cellKey === cellKey)?.rowKey ?? null
}

defineVisibleOrder('treegridVisibleCells', (_v, data) => visibleCells(data).flat())

// ── aria sources ──────────────────────────────────────────────────────────
defineAriaSource('state.treegridRowCount', (ctx) =>
  (ctx.data.state as { rowCount?: number } | undefined)?.rowCount ?? ctx.data.relations?.rowKeys?.length,
)
defineAriaSource('state.treegridColCount', (ctx) =>
  (ctx.data.state as { colCount?: number } | undefined)?.colCount ?? ctx.data.relations?.columnKeys?.length,
)
// aria-level / aria-expanded on the row part — read from row key directly.
defineAriaSource('state.rowLevelByKey', (ctx) => (ctx.key ? ctx.data.state?.levelByKey?.[ctx.key] : undefined))
defineAriaSource('state.rowExpanded', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

// ── key tokens ────────────────────────────────────────────────────────────
defineKeyToken('$activeRowKey', (_key, activeKey, ctx) => {
  if (!activeKey || !ctx) return null
  return cellRowKey(ctx.data, activeKey)
})

// ── predicates (extension kind) ───────────────────────────────────────────
definePredicate('treegridActiveAtFirstColumn', (_p, ctx) => {
  if (!ctx.activeKey) return false
  const firstCol = ctx.data.relations?.columnKeys?.[0]
  if (!firstCol) return false
  const cell = ctx.data.relations?.cells?.find((c) => c.cellKey === ctx.activeKey)
  return cell?.columnKey === firstCol
})
definePredicate('treegridActiveRowHasChildren', (_p, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return false
  return (ctx.data.relations?.childrenByKey?.[rowKey]?.length ?? 0) > 0
})
definePredicate('treegridActiveRowIsExpanded', (_p, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return false
  return ctx.data.state?.expandedKeys?.includes(rowKey) ?? false
})

// ── navigation targets ────────────────────────────────────────────────────
defineNavigationTarget('treegridCell', (target, ctx) => {
  const action = target.action as TreegridAction
  return moveGrid(visibleCells(ctx.data), ctx.activeKey, action)
})

defineNavigationTarget('treegridParentRowFirstCell', (_target, ctx) => {
  const rowKey = cellRowKey(ctx.data, ctx.activeKey)
  if (!rowKey) return null
  const parent = ctx.parentByKey.get(rowKey)
  if (!parent) return null
  const firstCol = ctx.data.relations?.columnKeys?.[0]
  if (!firstCol) return null
  return ctx.data.relations?.cells?.find((c) => c.rowKey === parent && c.columnKey === firstCol)?.cellKey ?? null
})

// ── parent-by-key for row hierarchy ───────────────────────────────────────
// Note: kernel's createParentByKey reads relations.childrenByKey — row hierarchy
// already lives there, so parentByKey resolves row→parentRow correctly.

const cellFocus = {
  tabIndex: {
    when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
    active: 0,
    inactive: -1,
  },
} as const

const cellEvents = [
  { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
  { event: 'click', events: [{ type: 'select', key: '$key' }] },
] as const

const activeAtFirstCol = { kind: 'extension', name: 'treegridActiveAtFirstColumn' } as const
const activeRowHasChildren = { kind: 'extension', name: 'treegridActiveRowHasChildren' } as const
const activeRowIsExpanded = { kind: 'extension', name: 'treegridActiveRowIsExpanded' } as const

export const treegridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'treegrid',
  rootRole: 'treegrid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  parts: {
    treegrid: {
      role: 'treegrid',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
        { attribute: 'aria-rowcount', from: 'state.treegridRowCount' },
        { attribute: 'aria-colcount', from: 'state.treegridColCount' },
        { attribute: 'aria-multiselectable', from: 'options.selectionMode.multiple' },
      ],
    },
    row: {
      role: 'row',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-level', from: 'state.rowLevelByKey' },
        { attribute: 'aria-expanded', from: 'state.rowExpanded' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
      ],
      state: [
        { name: 'expanded', from: 'state.expandedKeys' },
        { name: 'selected', from: 'state.selectedKeys' },
      ],
    },
    gridcell: {
      role: 'gridcell',
      keySource: 'gridCellKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
      ],
      focus: cellFocus,
      events: cellEvents,
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'selected', from: 'state.selectedKeys' },
        { name: 'disabled', from: 'state.disabledKeys' },
      ],
    },
    columnheader: {
      role: 'columnheader',
      keySource: 'columnHeaderKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-sort', from: 'state.sortByKey' },
      ],
      focus: cellFocus,
      events: [
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
        { event: 'click', events: [{ type: 'activate', key: '$key' }] },
      ],
      state: [{ name: 'active', from: 'state.activeKey' }],
    },
  },
  navigation: {
    visibleOrder: { kind: 'treegridVisibleCells' },
    targets: {
      left: { kind: 'treegridCell', action: 'left' },
      right: { kind: 'treegridCell', action: 'right' },
      up: { kind: 'treegridCell', action: 'up' },
      down: { kind: 'treegridCell', action: 'down' },
      rowStart: { kind: 'treegridCell', action: 'rowStart' },
      rowEnd: { kind: 'treegridCell', action: 'rowEnd' },
      gridStart: { kind: 'treegridCell', action: 'gridStart' },
      gridEnd: { kind: 'treegridCell', action: 'gridEnd' },
      parentRow: { kind: 'treegridParentRowFirstCell' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeAtFirstCol, activeRowHasChildren, { kind: 'not', predicate: activeRowIsExpanded }] },
        events: [{ type: 'expand', key: '$activeRowKey', expanded: true }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'right' }] },
    ] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [
      {
        case: 'when',
        when: { kind: 'all', predicates: [activeAtFirstCol, activeRowHasChildren, activeRowIsExpanded] },
        events: [{ type: 'expand', key: '$activeRowKey', expanded: false }],
      },
      {
        case: 'when',
        when: activeAtFirstCol,
        events: [{ type: 'navigate', direction: 'parentRow' }],
      },
      { case: 'otherwise', events: [{ type: 'navigate', direction: 'left' }] },
    ] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'down' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'up' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowStart' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowEnd' }] }] },
    { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridStart' }] }] },
    { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridEnd' }] }] },
    { shortcut: 'Enter', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }] },
  ],
})

export { visibleRowKeys as treegridVisibleRowKeys, visibleCells as treegridVisibleCells }

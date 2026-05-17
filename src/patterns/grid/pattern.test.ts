/**
 * APG grid specimen.
 *
 * Sources checked 2026-05-17:
 * - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/layout-grids/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/advanced-data-grid/
 *
 * This is intentionally a kernel-extension test: grid is added by definition +
 * resolver registration, not by changing treeview runtime code.
 */
import { describe, expect, it } from 'vitest'
import { moveGrid } from '@interactive-os/collection-navigation'
import {
  PatternDataSchema,
  PatternDefinitionSchema,
  createPatternRuntime,
  defineNavigationTarget,
  defineVisibleOrder,
  gridDefinition as exportedGridDefinition,
  type Key,
  type PatternData,
} from '../../index'

type GridAction = 'left' | 'right' | 'up' | 'down' | 'rowStart' | 'rowEnd' | 'gridStart' | 'gridEnd'

const gridRows = (data: PatternData): readonly (readonly Key[])[] =>
  (data.relations?.rowKeys ?? []).map((rowKey) =>
    (data.relations?.columnKeys ?? [])
      .map((columnKey) => data.relations?.cells?.find((cell) => cell.rowKey === rowKey && cell.columnKey === columnKey)?.cellKey)
      .filter((cellKey): cellKey is Key => Boolean(cellKey)),
  )

defineVisibleOrder('gridRows', (_visibleOrder, data) => gridRows(data).flat())

defineNavigationTarget('gridCell', (target, ctx) => {
  const action = target.action
  if (
    action !== 'left' &&
    action !== 'right' &&
    action !== 'up' &&
    action !== 'down' &&
    action !== 'rowStart' &&
    action !== 'rowEnd' &&
    action !== 'gridStart' &&
    action !== 'gridEnd'
  ) {
    throw new Error(`Unsupported grid action: ${String(action)}`)
  }
  return moveGrid(gridRows(ctx.data), ctx.activeKey, action as GridAction)
})

const gridDefinition = PatternDefinitionSchema.parse({
  apgPattern: 'grid',
  rootRole: 'grid',
  containedRoles: ['row', 'gridcell', 'columnheader', 'rowheader'],
  focusModel: 'rovingTabIndex',
  parts: {
    grid: {
      role: 'grid',
      keySource: 'relations.rowKeys',
      aria: [
        { attribute: 'aria-label', from: 'refs.label' },
        { attribute: 'aria-labelledby', from: 'refs.labelledBy' },
      ],
    },
    row: {
      role: 'row',
      keySource: 'relations.rowKeys',
      aria: [{ attribute: 'aria-rowindex', from: 'state.rowIndexByKey' }],
    },
    gridcell: {
      role: 'gridcell',
      keySource: 'gridCellKey',
      aria: [
        { attribute: 'aria-rowindex', from: 'state.rowIndexByKey' },
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-selected', from: 'state.selectedKeys' },
      ],
      focus: {
        tabIndex: {
          when: { kind: 'optionEquals', option: 'focusStrategy', value: 'rovingTabIndex' },
          active: 0,
          inactive: -1,
        },
      },
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
        { attribute: 'aria-colindex', from: 'state.columnIndexByKey' },
        { attribute: 'aria-sort', from: 'state.sortByKey' },
      ],
    },
  },
  navigation: {
    visibleOrder: { kind: 'gridRows' },
    targets: {
      left: { kind: 'gridCell', action: 'left' },
      right: { kind: 'gridCell', action: 'right' },
      up: { kind: 'gridCell', action: 'up' },
      down: { kind: 'gridCell', action: 'down' },
      rowStart: { kind: 'gridCell', action: 'rowStart' },
      rowEnd: { kind: 'gridCell', action: 'rowEnd' },
      gridStart: { kind: 'gridCell', action: 'gridStart' },
      gridEnd: { kind: 'gridCell', action: 'gridEnd' },
    },
  },
  keyboard: [
    { shortcut: 'ArrowRight', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'right' }] }] },
    { shortcut: 'ArrowLeft', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'left' }] }] },
    { shortcut: 'ArrowDown', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'down' }] }] },
    { shortcut: 'ArrowUp', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'up' }] }] },
    { shortcut: 'Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowStart' }] }] },
    { shortcut: 'End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'rowEnd' }] }] },
    { shortcut: 'Control+Home', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridStart' }] }] },
    { shortcut: 'Control+End', preventDefault: true, cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'gridEnd' }] }] },
  ],
})

const layoutGridData = PatternDataSchema.parse({
  items: {
    row1: { label: 'Related documents row 1' },
    row2: { label: 'Related documents row 2' },
    col1: { label: 'Column 1' },
    col2: { label: 'Column 2' },
    col3: { label: 'Column 3' },
    aria: { label: 'ARIA 1.1 Specification' },
    core: { label: 'Core Accessibility API Mappings 1.1' },
    wai: { label: 'WAI-ARIA Overview' },
    wcag: { label: 'WCAG Overview' },
    html: { label: 'HTML Specification' },
    svg: { label: 'SVG 2 Specification' },
  },
  relations: {
    rowKeys: ['row1', 'row2'],
    columnKeys: ['col1', 'col2', 'col3'],
    cells: [
      { rowKey: 'row1', columnKey: 'col1', cellKey: 'aria' },
      { rowKey: 'row1', columnKey: 'col2', cellKey: 'core' },
      { rowKey: 'row1', columnKey: 'col3', cellKey: 'wai' },
      { rowKey: 'row2', columnKey: 'col1', cellKey: 'wcag' },
      { rowKey: 'row2', columnKey: 'col2', cellKey: 'html' },
      { rowKey: 'row2', columnKey: 'col3', cellKey: 'svg' },
    ],
  },
  state: {
    activeKey: 'aria',
    rowIndexByKey: { row1: 1, row2: 2, aria: 1, core: 1, wai: 1, wcag: 2, html: 2, svg: 2 },
    columnIndexByKey: { aria: 1, core: 2, wai: 3, wcag: 1, html: 2, svg: 3 },
  },
  refs: { label: 'Related Documents' },
})

const dataGridData = PatternDataSchema.parse({
  items: {
    header: { label: 'Column headers' },
    r1: { label: 'Transactions row 1' },
    r2: { label: 'Transactions row 2' },
    hDate: { label: 'Date' },
    hType: { label: 'Type' },
    hAmount: { label: 'Amount' },
    c11: { label: '2026-05-01' },
    c12: { label: 'Deposit' },
    c13: { label: '$125.00' },
    c21: { label: '2026-05-02' },
    c22: { label: 'Payment' },
    c23: { label: '$32.00' },
  },
  relations: {
    rowKeys: ['header', 'r1', 'r2'],
    columnKeys: ['hDate', 'hType', 'hAmount'],
    cells: [
      { rowKey: 'header', columnKey: 'hDate', cellKey: 'hDate' },
      { rowKey: 'header', columnKey: 'hType', cellKey: 'hType' },
      { rowKey: 'header', columnKey: 'hAmount', cellKey: 'hAmount' },
      { rowKey: 'r1', columnKey: 'hDate', cellKey: 'c11' },
      { rowKey: 'r1', columnKey: 'hType', cellKey: 'c12' },
      { rowKey: 'r1', columnKey: 'hAmount', cellKey: 'c13' },
      { rowKey: 'r2', columnKey: 'hDate', cellKey: 'c21' },
      { rowKey: 'r2', columnKey: 'hType', cellKey: 'c22' },
      { rowKey: 'r2', columnKey: 'hAmount', cellKey: 'c23' },
    ],
  },
  state: {
    activeKey: 'c12',
    rowIndexByKey: { header: 1, r1: 2, r2: 3, hDate: 1, hType: 1, hAmount: 1, c11: 2, c12: 2, c13: 2, c21: 3, c22: 3, c23: 3 },
    columnIndexByKey: { hDate: 1, hType: 2, hAmount: 3, c11: 1, c12: 2, c13: 3, c21: 1, c22: 2, c23: 3 },
    sortByKey: { hDate: 'ascending' },
  },
  refs: { label: 'Transactions' },
})

const advancedGridData = PatternDataSchema.parse({
  items: {
    header: { label: 'Headers' },
    r1: { label: 'Row 1' },
    r2: { label: 'Row 2' },
    hName: { label: 'Name' },
    hStatus: { label: 'Status' },
    a1: { label: 'Ada' },
    a2: { label: 'Active' },
    b1: { label: 'Grace' },
    b2: { label: 'Paused' },
  },
  relations: {
    rowKeys: ['header', 'r1', 'r2'],
    columnKeys: ['hName', 'hStatus'],
    cells: [
      { rowKey: 'header', columnKey: 'hName', cellKey: 'hName' },
      { rowKey: 'header', columnKey: 'hStatus', cellKey: 'hStatus' },
      { rowKey: 'r1', columnKey: 'hName', cellKey: 'a1' },
      { rowKey: 'r1', columnKey: 'hStatus', cellKey: 'a2' },
      { rowKey: 'r2', columnKey: 'hName', cellKey: 'b1' },
      { rowKey: 'r2', columnKey: 'hStatus', cellKey: 'b2' },
    ],
  },
  state: {
    activeKey: 'a1',
    selectedKeys: ['a1', 'a2'],
    rowIndexByKey: { header: 1, r1: 2, r2: 3, hName: 1, hStatus: 1, a1: 2, a2: 2, b1: 3, b2: 3 },
    columnIndexByKey: { hName: 1, hStatus: 2, a1: 1, a2: 2, b1: 1, b2: 2 },
  },
  refs: { label: 'Advanced data grid' },
})

describe('grid via kernel (APG layout/data/advanced specimen)', () => {
  it('adds grid as a PatternDefinition without treeview-specific schema changes', () => {
    expect(gridDefinition.apgPattern).toBe('grid')
    expect(gridDefinition.parts.grid.role).toBe('grid')
    expect(gridDefinition.parts.row.role).toBe('row')
    expect(gridDefinition.parts.gridcell.role).toBe('gridcell')
    expect(gridDefinition.parts.columnheader.role).toBe('columnheader')
  })

  it('models layout grid link grouping with one PatternData interface', () => {
    const events: unknown[] = []
    const runtime = createPatternRuntime({
      definition: gridDefinition,
      data: layoutGridData,
      options: { focusStrategy: 'rovingTabIndex' },
      onEvent: (event) => events.push(event),
    })

    expect(runtime.visibleKeys).toEqual(['aria', 'core', 'wai', 'wcag', 'html', 'svg'])
    expect(runtime.getPartProps('grid')).toMatchObject({ role: 'grid', 'aria-label': 'Related Documents' })
    expect(runtime.getPartProps('gridcell', 'core')).toMatchObject({ role: 'gridcell', tabIndex: -1, 'aria-rowindex': 1, 'aria-colindex': 2 })
    expect(runtime.resolveKeyboardBinding({ key: 'ArrowRight', code: 'ArrowRight', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isComposing: false, repeat: false, location: 0 }, 'core')?.events).toEqual([{ type: 'navigate', direction: 'right' }])
  })

  it('models data grid row/column metadata and sortable headers', () => {
    const runtime = createPatternRuntime({
      definition: gridDefinition,
      data: dataGridData,
      options: { focusStrategy: 'rovingTabIndex' },
      onEvent: () => undefined,
    })

    expect(runtime.visibleKeys).toEqual(['hDate', 'hType', 'hAmount', 'c11', 'c12', 'c13', 'c21', 'c22', 'c23'])
    expect(runtime.getPartProps('columnheader', 'hDate')).toMatchObject({ role: 'columnheader', 'aria-colindex': 1, 'aria-sort': 'ascending' })
    expect(runtime.getPartProps('gridcell', 'c12')).toMatchObject({ role: 'gridcell', tabIndex: 0, 'aria-rowindex': 2, 'aria-colindex': 2 })
  })

  it('exported gridDefinition advertises APG keyboard surface (PageUp/PageDown/Enter/F2/Escape)', () => {
    const shortcuts = exportedGridDefinition.keyboard.map((b) => b.shortcut)
    expect(shortcuts).toEqual(expect.arrayContaining(['PageUp', 'PageDown', 'Enter', 'F2', 'Escape', 'Control+Home', 'Control+End']))
    expect(exportedGridDefinition.navigation.targets.pageDown).toEqual({ kind: 'gridPage', action: 'pageDown' })
  })

  it('exported gridDefinition emits aria-rowcount/aria-colcount/aria-readonly on grid root', () => {
    const data = PatternDataSchema.parse({
      items: {
        header: { label: 'h' }, r1: { label: 'r1' },
        cA: { label: 'cA' }, cB: { label: 'cB' },
        hA: { label: 'A' }, hB: { label: 'B' }, c1: { label: '1' }, c2: { label: '2' },
      },
      relations: {
        rowKeys: ['header', 'r1'],
        columnKeys: ['cA', 'cB'],
        cells: [
          { rowKey: 'header', columnKey: 'cA', cellKey: 'hA' },
          { rowKey: 'header', columnKey: 'cB', cellKey: 'hB' },
          { rowKey: 'r1', columnKey: 'cA', cellKey: 'c1' },
          { rowKey: 'r1', columnKey: 'cB', cellKey: 'c2' },
        ],
      },
      state: { activeKey: 'c1', rowCount: 2, colCount: 2, readonly: true, rowIndexByKey: { c1: 2 }, columnIndexByKey: { c1: 1 } },
      refs: { label: 'Test' },
    })
    const runtime = createPatternRuntime({ definition: exportedGridDefinition, data, options: { focusStrategy: 'rovingTabIndex' }, onEvent: () => undefined })
    expect(runtime.getPartProps('grid')).toMatchObject({ 'aria-rowcount': 2, 'aria-colcount': 2, 'aria-readonly': true })
  })

  it('exported gridDefinition routes PageDown to gridPage navigation target', () => {
    const rows: string[] = []
    const items: Record<string, { label: string }> = {}
    const cells: { rowKey: string; columnKey: string; cellKey: string }[] = []
    const rowIndexByKey: Record<string, number> = {}
    const columnIndexByKey: Record<string, number> = {}
    items['col0'] = { label: 'col0' }
    items['col1'] = { label: 'col1' }
    for (let r = 0; r < 10; r += 1) {
      const rowKey = `r${r}`
      rows.push(rowKey)
      items[rowKey] = { label: rowKey }
      for (let c = 0; c < 2; c += 1) {
        const k = `c${r}-${c}`
        items[k] = { label: k }
        cells.push({ rowKey, columnKey: `col${c}`, cellKey: k })
        rowIndexByKey[k] = r + 1
        columnIndexByKey[k] = c + 1
      }
    }
    const data = PatternDataSchema.parse({
      items,
      relations: { rowKeys: rows, columnKeys: ['col0', 'col1'], cells },
      state: { activeKey: 'c0-0', rowIndexByKey, columnIndexByKey },
      refs: { label: 'paged' },
    })
    const changes: PatternData[] = []
    const runtime = createPatternRuntime({ definition: exportedGridDefinition, data, options: { focusStrategy: 'rovingTabIndex' }, onEvent: () => undefined, onDataChange: (next) => changes.push(next) })
    runtime.getRootKeyboardHandler()({ key: 'PageDown', code: 'PageDown', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isComposing: false, repeat: false, location: 0 })
    expect(changes[0]?.state?.activeKey).toBe('c5-0')
  })

  it('models advanced data grid cell selection and 2D movement', () => {
    const dataChanges: PatternData[] = []
    const runtime = createPatternRuntime({
      definition: gridDefinition,
      data: advancedGridData,
      options: { focusStrategy: 'rovingTabIndex' },
      onEvent: () => undefined,
      onDataChange: (next) => dataChanges.push(next),
    })

    expect(runtime.getItemState('a1', 'gridcell')).toMatchObject({ active: true, selected: true })
    expect(runtime.getPartProps('gridcell', 'a2')).toMatchObject({ 'aria-selected': true })
    expect(runtime.resolveKeyboardBinding({ key: 'ArrowDown', code: 'ArrowDown', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isComposing: false, repeat: false, location: 0 }, 'a1')?.events).toEqual([{ type: 'navigate', direction: 'down' }])
    runtime.getRootKeyboardHandler()({ key: 'ArrowRight', code: 'ArrowRight', ctrlKey: false, shiftKey: false, altKey: false, metaKey: false, isComposing: false, repeat: false, location: 0 })
    expect(dataChanges[0]?.state?.activeKey).toBe('a2')
  })
})

import { gridDefinition, PatternDataSchema, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { reduceSortEvent, variantItemsFrom } from '../../shared/demoPatternTypes'

type GridCellSpec = {
  key: string
  label: string
  kind?: 'columnheader' | 'rowheader'
  sort?: 'ascending' | 'descending' | 'other'
  value?: string | number | boolean | null
  editable?: boolean
}

type GridDemoKeyInput = {
  key: string
  ctrlKey?: boolean
}

type GridDemoKeyboardOptions = {
  activateColumnheaderAsSort?: boolean
  escapeEvent?: 'dismiss' | 'editEnd'
}

const cell = (key: string, label: string, options: Omit<GridCellSpec, 'key' | 'label'> = {}): GridCellSpec => ({ key, label, ...options })
const header = (key: string, label: string, sort?: GridCellSpec['sort']): GridCellSpec => cell(key, label, { kind: 'columnheader', sort })
const editCell = (key: string, value: string): GridCellSpec => cell(key, value, { value, editable: true })
const gridDemoKeys = new Set([
  'ArrowRight',
  'ArrowLeft',
  'ArrowDown',
  'ArrowUp',
  'Home',
  'End',
  'PageDown',
  'PageUp',
  'Enter',
  'F2',
  'Escape',
])

const gridData = (input: {
  label: string
  activeKey: string
  rows: readonly (readonly GridCellSpec[])[]
  readonly?: boolean
  multiselectable?: boolean
}) => {
  const maxColumns = Math.max(...input.rows.map((row) => row.length))
  const rowKeys = input.rows.map((_row, index) => `row${index + 1}`)
  const columnKeys = Array.from({ length: maxColumns }, (_value, index) => `col${index + 1}`)
  const rowIndexByKey = Object.fromEntries(rowKeys.map((key, index) => [key, index + 1]))
  const columnIndexByKey: Record<string, number> = {}
  const sortByKey: Record<string, 'ascending' | 'descending' | 'other'> = {}
  const valueByKey: Record<string, string | number | boolean | null> = {}
  const editableKeys: string[] = []
  const items = Object.fromEntries([
    ...rowKeys.map((key, index) => [key, { label: `Row ${index + 1}` }]),
    ...columnKeys.map((key, index) => [key, { label: `Column ${index + 1}` }]),
    ...input.rows.flatMap((row, rowIndex) =>
      row.map((spec, columnIndex) => {
        rowIndexByKey[spec.key] = rowIndex + 1
        columnIndexByKey[spec.key] = columnIndex + 1
        if (spec.sort) sortByKey[spec.key] = spec.sort
        if (spec.value !== undefined) valueByKey[spec.key] = spec.value
        if (spec.editable) editableKeys.push(spec.key)
        return [spec.key, { label: spec.label, kind: spec.kind }]
      }),
    ),
  ])

  return PatternDataSchema.parse({
    items,
    relations: {
      rowKeys,
      columnKeys,
      cells: input.rows.flatMap((row, rowIndex) =>
        row.map((spec, columnIndex) => ({
          rowKey: rowKeys[rowIndex],
          columnKey: columnKeys[columnIndex],
          cellKey: spec.key,
        })),
      ),
    },
    state: {
      activeKey: input.activeKey,
      selectedKeys: [input.activeKey],
      rowIndexByKey,
      columnIndexByKey,
      rowCount: rowKeys.length,
      colCount: columnKeys.length,
      ...(input.readonly ? { readonly: true } : {}),
      ...(input.multiselectable ? { multiselectable: true } : {}),
      ...(Object.keys(sortByKey).length ? { sortByKey } : {}),
      ...(Object.keys(valueByKey).length ? { valueByKey } : {}),
      ...(editableKeys.length ? { editableKeys } : {}),
    },
    refs: { label: input.label },
  })
}

export const gridVariants = {
  layoutLinks: {
    label: 'Layout: links',
    data: gridData({
      label: 'Related Documents',
      activeKey: 'aria',
      readonly: true,
      rows: [
        [cell('aria', 'ARIA 1.1'), cell('core', 'Core AAM 1.1'), cell('wai', 'WAI-ARIA Overview')],
        [cell('wcag', 'WCAG Overview'), cell('html', 'HTML'), cell('svg', 'SVG 2')],
      ],
    }),
  },
  layoutButtons: {
    label: 'Layout: widgets',
    data: gridData({
      label: 'Media controls',
      activeKey: 'play',
      readonly: true,
      rows: [
        [cell('prev', 'Previous'), cell('play', 'Play'), cell('next', 'Next')],
        [cell('rewind', 'Rewind'), cell('pause', 'Pause'), cell('forward', 'Forward')],
      ],
    }),
  },
  dataTransactions: {
    label: 'Data: read-only',
    data: gridData({
      label: 'Transactions',
      activeKey: 'c12',
      readonly: true,
      rows: [
        [header('hDate', 'Date', 'ascending'), header('hType', 'Type'), header('hAmount', 'Amount')],
        [cell('c11', '2026-05-01'), cell('c12', 'Deposit'), cell('c13', '$125.00')],
        [cell('c21', '2026-05-02'), cell('c22', 'Payment'), cell('c23', '$32.00')],
        [cell('c31', '2026-05-03'), cell('c32', 'Deposit'), cell('c33', '$210.00')],
      ],
    }),
  },
  dataSortable: {
    label: 'Data: sortable',
    data: gridData({
      label: 'Sortable planets',
      activeKey: 'hName',
      readonly: true,
      rows: [
        [header('hName', 'Name', 'ascending'), header('hDistance', 'Distance'), header('hType', 'Type')],
        [cell('mercury', 'Mercury'), cell('mercuryDistance', '57.9'), cell('mercuryType', 'Terrestrial')],
        [cell('venus', 'Venus'), cell('venusDistance', '108.2'), cell('venusType', 'Terrestrial')],
        [cell('earth', 'Earth'), cell('earthDistance', '149.6'), cell('earthType', 'Terrestrial')],
        [cell('mars', 'Mars'), cell('marsDistance', '227.9'), cell('marsType', 'Terrestrial')],
      ],
    }),
  },
  dataEditable: {
    label: 'Data: editable',
    data: gridData({
      label: 'Editable contacts',
      activeKey: 'e11',
      rows: [
        [header('hFirst', 'First name'), header('hLast', 'Last name'), header('hEmail', 'Email')],
        [editCell('e11', 'Ada'), editCell('e12', 'Lovelace'), editCell('e13', 'ada.ops')],
        [editCell('e21', 'Grace'), editCell('e22', 'Hopper'), editCell('e23', 'grace.platform')],
        [editCell('e31', 'Katherine'), editCell('e32', 'Johnson'), editCell('e33', 'katherine.research')],
      ],
    }),
  },
  dataAdvanced: {
    label: 'Data: advanced',
    data: gridData({
      label: 'Advanced multi-select grid',
      activeKey: 'av11',
      multiselectable: true,
      rows: [
        [header('hQ1', 'Q1'), header('hQ2', 'Q2'), header('hQ3', 'Q3'), header('hQ4', 'Q4')],
        [cell('av11', '$1.2M'), cell('av12', '$1.8M'), cell('av13', '$2.1M'), cell('av14', '$2.4M')],
        [cell('av21', '$0.9M'), cell('av22', '$1.4M'), cell('av23', '$1.7M'), cell('av24', '$2.0M')],
        [cell('av31', '$1.5M'), cell('av32', '$1.6M'), cell('av33', '$1.9M'), cell('av34', '$2.2M')],
      ],
    }),
  },
} as const

export type GridVariantKey = keyof typeof gridVariants
export const gridVariantItems = variantItemsFrom(gridVariants)

export function ownsGridDemoKey(input: GridDemoKeyInput): boolean {
  return gridDemoKeys.has(input.key)
}

export function reduceGridDemoData(data: PatternData, event: PatternEvent): PatternData {
  if (event.type === 'sort') return reduceSortEvent(data, event)
  return reducePatternData(gridDefinition, data, event)
}

export function reduceGridDemoKeyboardInput(
  data: PatternData,
  input: GridDemoKeyInput,
  options: GridDemoKeyboardOptions = {},
): PatternData {
  const event = gridDemoKeyboardEvent(data, input, options)
  return event ? reduceGridDemoData(data, event) : data
}

export function isGridDemoEditorStartKey(data: PatternData, input: GridDemoKeyInput): boolean {
  const activeKey = data.state?.activeKey
  return Boolean(activeKey && isGridDemoEditStartKey(input) && isEditableGridCell(data, activeKey))
}

function gridDemoKeyboardEvent(
  data: PatternData,
  input: GridDemoKeyInput,
  options: GridDemoKeyboardOptions,
): PatternEvent | null {
  const activeKey = data.state?.activeKey
  if (!activeKey) return null
  if (input.key === 'ArrowRight') return { type: 'navigate', direction: 'right', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowLeft') return { type: 'navigate', direction: 'left', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowDown') return { type: 'navigate', direction: 'down', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowUp') return { type: 'navigate', direction: 'up', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: input.ctrlKey ? 'gridStart' : 'rowStart', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: input.ctrlKey ? 'gridEnd' : 'rowEnd', meta: { reason: 'keyboard' } }
  if (input.key === 'PageDown') return { type: 'navigate', direction: 'pageDown', meta: { reason: 'keyboard' } }
  if (input.key === 'PageUp') return { type: 'navigate', direction: 'pageUp', meta: { reason: 'keyboard' } }
  if (isGridDemoEditStartKey(input)) {
    if (options.activateColumnheaderAsSort && data.items[activeKey]?.kind === 'columnheader') {
      return { type: 'sort', key: activeKey, sort: nextGridDemoSort(data.state?.sortByKey?.[activeKey]) }
    }
    return { type: 'activate', key: activeKey, meta: { reason: 'keyboard' } }
  }
  if (input.key === 'Escape') {
    return options.escapeEvent === 'editEnd'
      ? { type: 'editEnd', key: activeKey, meta: { reason: 'keyboard' } }
      : { type: 'dismiss', key: activeKey, meta: { reason: 'keyboard' } }
  }
  return null
}

function isGridDemoEditStartKey(input: GridDemoKeyInput): boolean {
  return input.key === 'Enter' || input.key === 'F2'
}

function isEditableGridCell(data: PatternData, key: string): boolean {
  return (data.state?.editableKeys as readonly string[] | undefined)?.includes(key) === true
}

function nextGridDemoSort(current: unknown): 'ascending' | 'descending' {
  return current === 'ascending' ? 'descending' : 'ascending'
}

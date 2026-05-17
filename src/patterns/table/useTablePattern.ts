import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { tableDefinition } from './definition'

export interface ReactTableCell {
  key: Key
  label: string
  kind: string
  tag: 'td' | 'th'
  cellProps: ReactPatternProps
}

export interface ReactTableRow {
  key: Key
  rowProps: ReactPatternProps
  cells: readonly ReactTableCell[]
}

export interface ReactTableRuntime {
  tableProps: ReactPatternProps
  headerRow: ReactTableRow | null
  bodyRows: readonly ReactTableRow[]
  rows: readonly ReactTableRow[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useTablePattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTableRuntime {
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const sortByKey = data.state?.sortByKey ?? {}
  const runtime = createPatternRuntime({
    definition: tableDefinition,
    data,
    options: runtimeOptions,
    onEvent: (event) => {
      if (event.type === 'activate' && data.items[event.key]?.kind === 'columnheader') {
        const current = sortByKey[event.key]
        onEvent({ type: 'sort', key: event.key, sort: current === 'ascending' ? 'descending' : 'ascending' })
        return
      }
      onEvent(event)
    },
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'tablecell-'}${key}`,
  })
  const rows = createRows(runtime)

  return {
    get tableProps() {
      return runtime.getPartProps('table') as ReactPatternProps
    },
    headerRow: rows[0] ?? null,
    bodyRows: rows.slice(1),
    rows,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createRows(runtime: ReturnType<typeof createPatternRuntime>): readonly ReactTableRow[] {
  const rowKeys = runtime.data.relations?.rowKeys ?? []
  const cells = runtime.data.relations?.cells ?? []
  return rowKeys.map((rowKey) => {
    const cellKeys = cells.filter((cell) => cell.rowKey === rowKey).map((cell) => cell.cellKey)
    return {
      key: rowKey,
      rowProps: runtime.getPartProps('row', rowKey) as ReactPatternProps,
      cells: cellKeys.map((cellKey) => createCell(runtime, cellKey)),
    }
  })
}

function createCell(runtime: ReturnType<typeof createPatternRuntime>, cellKey: Key): ReactTableCell {
  const kind = runtime.data.items[cellKey]?.kind ?? 'cell'
  const part = kind === 'columnheader' ? 'columnheader' : kind === 'rowheader' ? 'rowheader' : 'cell'
  return {
    key: cellKey,
    label: runtime.data.items[cellKey]?.label ?? cellKey,
    kind: part,
    tag: part === 'columnheader' || part === 'rowheader' ? 'th' : 'td',
    cellProps: runtime.getPartProps(part, cellKey) as ReactPatternProps,
  }
}

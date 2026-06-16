import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { tableDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'tablecell-')
  const sortByKey = data.state?.sortByKey ?? {}
  const runtime = createPatternRuntime({
    definition: tableDefinition,
    data,
    options: runtimeOptions,
    onEvent: (event) => {
      if (event.type === 'activate' && data.items[event.key]?.kind === 'columnheader') {
        const current = sortByKey[event.key]
        onEvent(withDefaultReason({ type: 'sort', key: event.key, sort: current === 'ascending' ? 'descending' : 'ascending' }, event.meta?.reason ?? 'external'))
        return
      }
      onEvent(event)
    },
    keyToElementId,
  })
  const rows = createTableRows(runtime)

  return {
    get tableProps() {
      return reactProps(runtime.getPartProps('table'))
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

function createTableRows(runtime: PatternRuntime): readonly ReactTableRow[] {
  const rowKeys = runtime.data.relations?.rowKeys ?? []
  const cellKeysByRow = new Map<Key, Key[]>()
  for (const cell of runtime.data.relations?.cells ?? []) {
    const cellKeys = cellKeysByRow.get(cell.rowKey)
    if (cellKeys) cellKeys.push(cell.cellKey)
    else cellKeysByRow.set(cell.rowKey, [cell.cellKey])
  }
  return rowKeys.map((rowKey) => {
    const cellKeys = cellKeysByRow.get(rowKey) ?? []
    return {
      key: rowKey,
      rowProps: reactProps(runtime.getPartProps('row', rowKey)),
      cells: cellKeys.map((cellKey) => {
        const kind = runtime.data.items[cellKey]?.kind ?? 'cell'
        const part = kind === 'columnheader' ? 'columnheader' : kind === 'rowheader' ? 'rowheader' : 'cell'
        return {
          key: cellKey,
          label: runtime.data.items[cellKey]?.label ?? cellKey,
          kind: part,
          tag: part === 'columnheader' || part === 'rowheader' ? 'th' : 'td',
          cellProps: reactProps(runtime.getPartProps(part, cellKey)),
        }
      }),
    }
  })
}

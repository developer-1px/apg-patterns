import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { tableDefinition } from './definition'
import { createTableRows, type ReactTableRow } from './tableRow'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactTableCell, ReactTableRow } from './tableRow'

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
        onEvent({ type: 'sort', key: event.key, sort: current === 'ascending' ? 'descending' : 'ascending' })
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

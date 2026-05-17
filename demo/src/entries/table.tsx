import { useState } from 'react'
import { reducePatternData } from '../../../src'
import { tableDefinition } from '../../../src/patterns/table/definition'
import { Table } from '../Table'
import { initialTableData } from '../tableData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'table',
  label: 'Table',
  order: 23,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialTableData)
    return {
      key: 'table',
      label: 'Table',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
      sourceNames: ['Table.tsx', 'tableData.ts', 'table/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      preview: <Table data={data} onEvent={(event) => {
        onEvent(event)
        if (event.type === 'extension' && event.name === 'tableSort' && event.key) {
          const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
          setData((current) => ({ ...current, state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key as string]: next } } }))
          return
        }
        setData((current) => reducePatternData(tableDefinition, current, event))
      }} />,
      reset: () => setData(initialTableData),
    }
  },
}

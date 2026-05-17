import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { tableDefinition } from '../../../../src/patterns/table/definition'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Table } from './Table'
import { initialTableData } from './tableData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

const reduceTableDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'extension' && event.name === 'tableSort' && event.key) {
    const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key as string]: next } } }
  }
  return reducePatternData(tableDefinition, data, event)
}

export const entry: PatternEntry = {
  key: 'table',
  label: 'Table',
  order: 23,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialTableData, reduceTableDemoData)
    return {
      key: 'table',
      label: 'Table',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
      sourceNames: ['Table.tsx', 'tableData.ts', 'table/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Table data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

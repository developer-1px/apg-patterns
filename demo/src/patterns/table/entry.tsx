import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { tableDefinition } from '../../../../src/patterns/table/definition'
import { Table } from './Table'
import { initialTableData } from './tableData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const reduceTableDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'sort') {
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key]: event.sort } } }
  }
  return reducePatternData(tableDefinition, data, event)
}

const tableDemoDefinition = {
  key: 'table',
  label: 'Table',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
  sources: {
    main: 'Table.tsx',
    entry: 'table/entry.tsx',
    hooks: ['table/useTablePattern.ts'],
    data: ['tableData.ts'],
    definition: 'table/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Table',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: tableDemoDefinition,
  initialData: initialTableData,
  reduce: reduceTableDemoData,
  componentName: 'Table',
  component: Table,
})

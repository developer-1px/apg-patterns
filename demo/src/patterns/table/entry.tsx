import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { tableDefinition } from '../../../../src/patterns/table/definition'
import { Table } from './Table'
import { initialTableData, tableVariantItems, tableVariants, type TableVariantKey } from './tableData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

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
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'table variants',
    idPrefix: 'table-variant',
    onChange: '$actions.selectVariant',
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

export const entry = defineVariantDemoPattern<TableVariantKey>({
  definition: tableDemoDefinition,
  initialVariant: 'basic',
  initialData: initialTableData,
  dataByVariant: (variant) => tableVariants[variant].data,
  reduce: (_variant, data, event) => reduceTableDemoData(data, event),
  variantItems: tableVariantItems,
  componentName: 'Table',
  component: Table,
})

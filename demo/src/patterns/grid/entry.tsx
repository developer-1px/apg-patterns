import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { Grid } from './Grid'
import { gridVariantItems, gridVariants, type GridVariantKey } from './gridData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { reduceSortEvent } from '../../shared/demoPatternTypes'

const reduceGridDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'sort') return reduceSortEvent(data, event)
  return reducePatternData(gridDefinition, data, event)
}

const gridDemoDefinition = {
  key: 'grid',
  label: 'Grid',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Ctrl+Home', 'Ctrl+End', 'PageUp', 'PageDown', 'Enter', 'F2', 'Escape'],
  sources: {
    main: 'Grid.tsx',
    entry: 'grid/entry.tsx',
    hooks: ['grid/useGridPattern.ts'],
    data: ['gridData.ts'],
    definition: 'grid/definition.ts',
  },
  controls: {
    kind: 'listbox',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'grid variants',
    idPrefix: 'grid-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Grid',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<GridVariantKey>({
  definition: gridDemoDefinition,
  initialVariant: 'dataTransactions',
  initialData: gridVariants.dataTransactions.data,
  dataByVariant: (variant) => gridVariants[variant].data,
  reduce: (_variant, data, event) => reduceGridDemoData(data, event),
  variantItems: gridVariantItems,
  componentName: 'Grid',
  component: Grid,
})

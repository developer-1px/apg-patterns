import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Grid } from './Grid'
import { gridVariantItems, gridVariants, type GridVariantKey } from './gridData'
import { renderDataInspect } from '../../shared/inspect/index'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const reduceGridDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'sort') {
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key]: event.sort } } }
  }
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
    extra: [
      'grid/gridCell.ts',
      'grid/gridEditInputProps.ts',
      'grid/gridRow.ts',
      'grid/gridRuntimeEvents.ts',
      'grid/ariaSources.ts',
      'grid/navigation.ts',
      'grid/keyboard.ts',
      'grid/parts.ts',
      'grid/transitions.ts',
      'grid/inspect.ts',
    ],
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

export const entry = defineDemoPattern({
  definition: gridDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<GridVariantKey>(
      'dataTransactions',
      gridVariants.dataTransactions.data,
      (variant) => gridVariants[variant].data,
      (_variant, data, event) => reduceGridDemoData(data, event),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data },
          model: { variantItems: gridVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Grid },
      },
    }
  },
})

import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Grid } from './Grid'
import { gridVariantItems, gridVariants, type GridVariantKey } from './gridData'
import { renderDataInspect } from '../../shared/inspect/index'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { VariantListbox } from '../../shared/VariantListbox'

const reduceGridDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'sort') {
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key]: event.sort } } }
  }
  return reducePatternData(gridDefinition, data, event)
}

export const entry: PatternEntry = {
  key: 'grid',
  label: 'Grid',
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<GridVariantKey>(
      'dataTransactions',
      gridVariants.dataTransactions.data,
      (variant) => gridVariants[variant].data,
      (_variant, data, event) => reduceGridDemoData(data, event),
    )
    return {
      key: 'grid',
      label: 'Grid',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Ctrl+Home', 'Ctrl+End', 'PageUp', 'PageDown', 'Enter', 'F2', 'Escape'],
      sourceNames: ['Grid.tsx', 'grid/entry.tsx', 'grid/useGridPattern.ts', 'gridData.ts', 'grid/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={gridVariantItems} label="grid variants" idPrefix="grid-variant" onChange={host.selectVariant} />,
      preview: <Grid data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}

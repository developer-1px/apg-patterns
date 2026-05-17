import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../src'
import { useVariantPatternDataHost } from '../demoHostState'
import { Grid } from '../Grid'
import { gridVariants, type GridVariantKey } from '../gridData'
import { GridVariantMenu } from '../GridVariantMenu'
import { renderGridInspect } from '../inspect'
import { type PatternEntry } from '../demoPatternTypes'

const reduceGridDemoData = (data: PatternData, event: PatternEvent): PatternData => {
  if (event.type === 'extension' && event.name === 'gridSort' && event.key) {
    const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
    return { ...data, state: { ...data.state, sortByKey: { ...data.state?.sortByKey, [event.key as string]: next } } }
  }
  return reducePatternData(gridDefinition, data, event)
}

export const entry: PatternEntry = {
  key: 'grid',
  label: 'Grid',
  order: 3,
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
      sourceNames: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderGridInspect(host.data),
      variants: <GridVariantMenu value={host.variant} onChange={host.selectVariant} />,
      preview: <Grid data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

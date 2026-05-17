import { useState } from 'react'
import { gridDefinition, reducePatternData } from '../../../src'
import { Grid } from '../Grid'
import { gridVariants, type GridVariantKey } from '../gridData'
import { GridVariantMenu } from '../GridVariantMenu'
import { renderGridInspect } from '../inspect'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'grid',
  label: 'Grid',
  order: 3,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<GridVariantKey>('dataTransactions')
    const [data, setData] = useState(gridVariants.dataTransactions.data)
    return {
      key: 'grid',
      label: 'Grid',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Ctrl+Home', 'Ctrl+End', 'PageUp', 'PageDown', 'Enter', 'F2', 'Escape'],
      sourceNames: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderGridInspect(data),
      variants: <GridVariantMenu value={variant} onChange={(next) => {
        setVariant(next)
        setData(gridVariants[next].data)
      }} />,
      preview: <Grid data={data} options={{ focusStrategy: 'rovingTabIndex', selectionMode: (data.state as { multiselectable?: boolean } | undefined)?.multiselectable ? 'multiple' : 'single' }} onEvent={(event) => {
        onEvent(event)
        if (event.type === 'extension' && event.name === 'gridSort' && event.key) {
          const next = (event.payload?.sort as 'ascending' | 'descending' | 'other') ?? 'ascending'
          setData((current) => ({ ...current, state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key as string]: next } } }))
          return
        }
        setData((current) => reducePatternData(gridDefinition, current, event))
      }} />,
      reset: () => setData(gridVariants[variant].data),
    }
  },
}

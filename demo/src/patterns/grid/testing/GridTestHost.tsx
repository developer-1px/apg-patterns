import { useState } from 'react'
import { gridDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { Grid } from '../Grid'
import { gridVariants, type GridVariantKey } from '../gridData'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

export function GridDemo({ variant = 'dataTransactions' }: { variant?: GridVariantKey }) {
  const [data, setData] = useState<PatternData>(gridVariants[variant].data)
  return (
    <Grid
      data={data}
      onEvent={(event: PatternEvent) => {
        if (event.type === 'sort') {
          setData((current) => ({
            ...current,
            state: { ...current.state, sortByKey: { ...current.state?.sortByKey, [event.key]: event.sort } },
          }))
          return
        }
        setData((current) => reducePatternData(gridDefinition, current, event))
      }}
    />
  )
}

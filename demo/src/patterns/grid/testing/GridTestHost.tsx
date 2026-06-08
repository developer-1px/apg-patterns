import { usePatternDataHost } from '../../../shared/demoHostState'
import { Grid } from '../Grid'
import { gridVariants, reduceGridDemoData, type GridVariantKey } from '../gridData'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

export function GridDemo({ variant = 'dataTransactions' }: { variant?: GridVariantKey }) {
  const host = usePatternDataHost(gridVariants[variant].data, reduceGridDemoData)
  return <Grid data={host.data} onEvent={host.dispatchEvent} />
}

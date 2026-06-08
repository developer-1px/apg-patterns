import type { PatternEvent } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Spinbutton } from '../Spinbutton'
import { reduceSpinbuttonData, spinbuttonVariants } from '../spinbuttonData'

export function SpinbuttonDemo({ onEvent, variant = 'numeric' }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof spinbuttonVariants }) {
  const init = spinbuttonVariants[variant]
  const host = usePatternDataHost(init.data, (data, event) => reduceSpinbuttonData(data, event, init.options))
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    host.dispatchEvent(event)
  }
  return <Spinbutton data={host.data} onEvent={handleEvent} />
}

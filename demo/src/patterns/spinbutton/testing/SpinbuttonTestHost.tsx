import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Spinbutton } from '../Spinbutton'
import { reduceSpinbuttonData, spinbuttonVariants } from '../spinbuttonData'

export function SpinbuttonDemo({ onEvent, variant = 'numeric' }: { onEvent?: (event: PatternEvent) => void; variant?: keyof typeof spinbuttonVariants }) {
  const init = spinbuttonVariants[variant]
  const [data, setData] = useState(init.data)
  const handleEvent = (event: PatternEvent) => {
    onEvent?.(event)
    setData((current) => reduceSpinbuttonData(current, event, init.options))
  }
  return <Spinbutton data={data} onEvent={handleEvent} />
}

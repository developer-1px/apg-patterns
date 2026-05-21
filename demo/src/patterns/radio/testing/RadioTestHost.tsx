import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { RadioGroup } from '../RadioGroup'
import { initialRadioData, reduceRadioData } from '../radioData'

export function RadioDemo() {
  const [data, setData] = useState(initialRadioData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceRadioData(current, event))
  return <RadioGroup data={data} onEvent={handleEvent} />
}

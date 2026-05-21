import { useState } from 'react'
import type { PatternEvent } from '../../../../../src/react'
import { Checkbox } from '../Checkbox'
import { checkboxVariants } from '../checkboxData'

export function TwoStateCheckboxDemo() {
  const variant = checkboxVariants.twoState
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

export function TriStateCheckboxDemo() {
  const variant = checkboxVariants.triState
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Checkbox data={data} onEvent={handleEvent} />
}

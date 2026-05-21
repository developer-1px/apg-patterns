import { useState } from 'react'
import type { PatternData, PatternEvent } from '../../../../../src/react'
import { Accordion } from '../Accordion'
import { initialAccordionData, reduceAccordionData } from '../accordionData'

export function AccordionDemo({ initial = initialAccordionData }: { initial?: PatternData }) {
  const [data, setData] = useState(initial)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceAccordionData(current, event))
  return <Accordion data={data} onEvent={handleEvent} />
}

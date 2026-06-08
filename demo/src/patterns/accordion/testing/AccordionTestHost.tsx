import type { PatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Accordion } from '../Accordion'
import { initialAccordionData, reduceAccordionData } from '../accordionData'

export function AccordionDemo({ initial = initialAccordionData }: { initial?: PatternData }) {
  const host = usePatternDataHost(initial, reduceAccordionData)
  return <Accordion data={host.data} onEvent={host.dispatchEvent} />
}

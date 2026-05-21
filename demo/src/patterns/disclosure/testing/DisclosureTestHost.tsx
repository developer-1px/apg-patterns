import { useState } from 'react'
import { disclosureDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { Disclosure } from '../Disclosure'
import { initialImageDisclosureData } from '../disclosureData'

export function DisclosureDemo({ initial = initialImageDisclosureData }: { initial?: PatternData }) {
  const [data, setData] = useState(initial)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(disclosureDefinition, current, event))
  return <Disclosure data={data} onEvent={handleEvent} />
}

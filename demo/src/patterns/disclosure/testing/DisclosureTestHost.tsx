import { disclosureDefinition, reducePatternData, type PatternData } from '../../../../../src/react'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Disclosure } from '../Disclosure'
import { initialImageDisclosureData } from '../disclosureData'

export function DisclosureDemo({ initial = initialImageDisclosureData }: { initial?: PatternData }) {
  const host = usePatternDataHost(initial, (data, event) => reducePatternData(disclosureDefinition, data, event))
  return <Disclosure data={host.data} onEvent={host.dispatchEvent} />
}

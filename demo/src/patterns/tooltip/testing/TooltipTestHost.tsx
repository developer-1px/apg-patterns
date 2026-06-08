import { reducePatternData } from '../../../../../src/react'
import { tooltipDefinition } from '../../../../../src/patterns/tooltip/definition'
import { usePatternDataHost } from '../../../shared/demoHostState'
import { Tooltip } from '../Tooltip'
import { initialTooltipData } from '../tooltipData'

export function TooltipDemo() {
  const host = usePatternDataHost(initialTooltipData, (data, event) => reducePatternData(tooltipDefinition, data, event))
  return <Tooltip data={host.data} onEvent={host.dispatchEvent} />
}

import { useState } from 'react'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../../src/react'
import { tooltipDefinition } from '../../../../../src/patterns/tooltip/definition'
import { Tooltip } from '../Tooltip'
import { initialTooltipData } from '../tooltipData'

export function TooltipDemo() {
  const [data, setData] = useState<PatternData>(initialTooltipData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(tooltipDefinition, current, event))
  return <Tooltip data={data} onEvent={handleEvent} />
}

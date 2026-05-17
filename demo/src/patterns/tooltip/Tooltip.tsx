import { useReducer } from 'react'
import { reducePatternData, useTooltipPattern, type PatternData } from '../../../../src'
import { tooltipDefinition } from '../../../../src/patterns/tooltip/definition'
import { initialTooltipData } from './tooltipData'

export interface TooltipProps {
  data?: PatternData
}

export function Tooltip({ data: initialData = initialTooltipData }: TooltipProps) {
  const [data, dispatch] = useReducer(
    (current: PatternData, event: Parameters<typeof reducePatternData>[2]) =>
      reducePatternData(tooltipDefinition, current, event),
    initialData,
  )
  const tooltip = useTooltipPattern(data, dispatch)

  return (
    <>
      <button
        {...tooltip.triggerProps}
      >
        {tooltip.triggerLabel}
      </button>
      {tooltip.state.open ? (
        <span {...tooltip.tooltipProps}>
          {tooltip.tooltipLabel}
        </span>
      ) : null}
    </>
  )
}

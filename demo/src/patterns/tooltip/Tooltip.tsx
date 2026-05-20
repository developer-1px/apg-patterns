import { useTooltipPattern, type PatternData, type PatternEvent } from '../../../../src/react'

export interface TooltipProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Tooltip({ data, onEvent }: TooltipProps) {
  const tooltip = useTooltipPattern(data, onEvent)

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

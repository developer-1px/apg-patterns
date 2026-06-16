import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useTooltipPattern } from './useTooltipPattern'

type TooltipDataItem = PatternItem & {
  content?: string
}

export interface TooltipProps<TItem extends TooltipDataItem = TooltipDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTrigger?: (item: TItem | undefined) => ReactNode
  renderTooltip?: (item: TItem | undefined) => ReactNode
}

export function Tooltip<TItem extends TooltipDataItem = TooltipDataItem>({
  data,
  onEvent,
  options,
  className,
  renderTrigger,
  renderTooltip,
}: TooltipProps<TItem>) {
  const tooltip = useTooltipPattern(data, onEvent, options)
  const triggerItem = tooltip.triggerKey ? data.items[tooltip.triggerKey] : undefined
  const tooltipItem = tooltip.tooltipKey ? data.items[tooltip.tooltipKey] : undefined

  return createElement('div', { className },
    createElement('button', tooltip.triggerProps, renderTrigger?.(triggerItem) ?? tooltip.triggerLabel),
    tooltip.state.open
      ? createElement('div', tooltip.tooltipProps, renderTooltip?.(tooltipItem) ?? tooltipItem?.content ?? tooltip.tooltipLabel)
      : null,
  )
}

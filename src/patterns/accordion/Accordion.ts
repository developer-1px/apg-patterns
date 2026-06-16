import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useAccordionPattern, type ReactAccordionRenderItem } from './useAccordionPattern'

type AccordionDataItem = PatternItem & {
  content?: string
}

export interface AccordionProps<TItem extends AccordionDataItem = AccordionDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderHeader?: (item: ReactAccordionRenderItem, dataItem: TItem) => ReactNode
  renderPanel?: (item: ReactAccordionRenderItem, dataItem: TItem | undefined) => ReactNode
}

export function Accordion<TItem extends AccordionDataItem = AccordionDataItem>({
  data,
  onEvent,
  options,
  className,
  renderHeader,
  renderPanel,
}: AccordionProps<TItem>) {
  const accordion = useAccordionPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...accordion.rootProps, className },
    accordion.renderItems.map((item) => {
      const panelItem = item.panelKey ? data.items[item.panelKey] : undefined
      return createElement('div', { key: item.key },
        createElement('h3', null,
          createElement('button', item.headerProps, renderHeader?.(item, data.items[item.key]) ?? item.label),
        ),
        item.state.expanded && item.panelProps
          ? createElement('div', item.panelProps, renderPanel?.(item, panelItem) ?? panelItem?.content ?? panelItem?.label ?? null)
          : null,
      )
    }),
  )
}

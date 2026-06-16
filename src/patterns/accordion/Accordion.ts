import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useAccordionPattern, type ReactAccordionRenderItem } from './useAccordionPattern'

type AccordionDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

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
    { ...accordion.rootProps, className } as DivProps,
    accordion.renderItems.map((item) => {
      const panelItem = item.panelKey ? data.items[item.panelKey] : undefined
      return createElement('div', { key: item.key } as DivProps & { key: Key }, [
        createElement('h3', { key: `${item.key}-heading` } as ComponentPropsWithoutRef<'h3'>, [
          createElement('button', { key: `${item.key}-button`, ...item.headerProps } as ComponentPropsWithoutRef<'button'>, renderHeader?.(item, data.items[item.key]) ?? item.label),
        ]),
        item.state.expanded && item.panelProps
          ? createElement('div', { key: `${item.key}-panel`, ...item.panelProps } as DivProps, renderPanel?.(item, panelItem) ?? panelItem?.content ?? panelItem?.label ?? null)
          : null,
      ])
    }),
  )
}

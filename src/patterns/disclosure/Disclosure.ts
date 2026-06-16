import { createElement, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useDisclosurePattern, type ReactDisclosureItem } from './useDisclosurePattern'

type DisclosureDataItem = PatternItem & {
  content?: string
}

export interface DisclosureProps<TItem extends DisclosureDataItem = DisclosureDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTrigger?: (item: ReactDisclosureItem, dataItem: TItem) => ReactNode
  renderPanel?: (item: ReactDisclosureItem, dataItem: TItem | undefined) => ReactNode
}

export function Disclosure<TItem extends DisclosureDataItem = DisclosureDataItem>({
  data,
  onEvent,
  options,
  className,
  renderTrigger,
  renderPanel,
}: DisclosureProps<TItem>) {
  const disclosure = useDisclosurePattern(data, onEvent, options)

  return createElement(
    'div',
    { className },
    disclosure.items.map((item) => {
      const panelItem = item.panelKey ? data.items[item.panelKey] : undefined
      return createElement('div', { key: item.key },
        createElement('button', item.triggerProps, renderTrigger?.(item, data.items[item.key]) ?? item.label),
        item.expanded && item.panelProps
          ? createElement('div', item.panelProps, renderPanel?.(item, panelItem) ?? panelItem?.content ?? panelItem?.label)
          : null,
      )
    }),
  )
}

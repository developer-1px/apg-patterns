import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternDataWithOptions, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactDisclosureItem } from './disclosureItem'
import { useDisclosurePattern } from './useDisclosurePattern'

type DisclosureDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>
type ButtonProps = ComponentPropsWithoutRef<'button'>

export interface DisclosureProps<TItem extends DisclosureDataItem = DisclosureDataItem> {
  data: PatternDataWithOptions<TItem>
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
    { className } as DivProps,
    disclosure.items.map((item) => {
      const panelItem = item.panelKey ? data.items[item.panelKey] : undefined
      return createElement('div', { key: item.key } as DivProps & { key: Key }, [
        createElement('button', { key: `${item.key}-trigger`, ...item.triggerProps } as ButtonProps, renderTrigger?.(item, data.items[item.key]) ?? item.label),
        item.expanded && item.panelProps
          ? createElement('div', { key: `${item.key}-panel`, ...item.panelProps } as DivProps, renderPanel?.(item, panelItem) ?? panelItem?.content ?? panelItem?.label)
          : null,
      ])
    }),
  )
}

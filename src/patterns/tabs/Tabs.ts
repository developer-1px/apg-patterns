import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useTabsPattern } from './useTabsPattern'

type TabsDataItem = PatternItem & {
  content?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface TabsProps<TItem extends TabsDataItem = TabsDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTab?: (key: Key, dataItem: TItem) => ReactNode
  renderPanel?: (key: Key, dataItem: TItem | undefined) => ReactNode
}

export function Tabs<TItem extends TabsDataItem = TabsDataItem>({ data, onEvent, options, className, renderTab, renderPanel }: TabsProps<TItem>) {
  const tabs = useTabsPattern(data, onEvent, options)
  const panelKey = tabs.selectedPanelKey

  return createElement('div', { className } as DivProps, [
    createElement(
      'div',
      { key: 'tablist', ...tabs.getTablistProps() } as DivProps,
      tabs.tabs.map((key) => createElement('button', { key, ...tabs.getTabProps(key) } as ComponentPropsWithoutRef<'button'> & { key: Key }, renderTab?.(key, data.items[key]) ?? data.items[key]?.label ?? key)),
    ),
    panelKey
      ? createElement(
          'div',
          { key: 'tabpanel', ...tabs.getTabPanelProps(panelKey) } as DivProps,
          renderPanel?.(panelKey, data.items[panelKey]) ?? data.items[panelKey]?.content ?? data.items[panelKey]?.label,
        )
      : null,
  ])
}

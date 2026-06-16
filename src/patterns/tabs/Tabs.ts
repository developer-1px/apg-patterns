import { createElement, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useTabsPattern } from './useTabsPattern'

type TabsDataItem = PatternItem & {
  content?: string
}

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

  return createElement('div', { className },
    createElement(
      'div',
      tabs.getTablistProps(),
      tabs.tabs.map((key) => createElement('button', { key, ...tabs.getTabProps(key) }, renderTab?.(key, data.items[key]) ?? data.items[key]?.label ?? key)),
    ),
    panelKey
      ? createElement(
          'div',
          tabs.getTabPanelProps(panelKey),
          renderPanel?.(panelKey, data.items[panelKey]) ?? data.items[panelKey]?.content ?? data.items[panelKey]?.label,
        )
      : null,
  )
}

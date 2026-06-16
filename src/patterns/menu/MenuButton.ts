import { createElement, type ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useMenuButtonPattern, type ReactMenuButtonRuntime } from './useMenuButtonPattern'

type ReactMenuButtonItem = ReactMenuButtonRuntime['items'][number]

export interface MenuButtonProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderTrigger?: () => ReactNode
  renderItem?: (item: ReactMenuButtonItem, dataItem: TItem) => ReactNode
}

export function MenuButton<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderTrigger, renderItem }: MenuButtonProps<TItem>) {
  const menu = useMenuButtonPattern(data, onEvent, options)

  return createElement(
    'div',
    { className },
    createElement('button', menu.triggerProps, renderTrigger?.() ?? (menu.triggerKey ? data.items[menu.triggerKey]?.label : undefined)),
    menu.expanded
      ? renderItemCollection({
          rootProps: menu.menuProps, items: menu.items, dataItems: data.items,
          getItemProps: (item) => item.itemProps,
          children: (item, dataItem) => renderItem?.(item, dataItem) ?? item.label,
        })
      : null,
  )
}

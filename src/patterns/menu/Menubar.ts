import { createElement, type ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useMenubarPattern, type ReactMenubarItem } from './useMenubarPattern'

export interface MenubarProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderItem?: (item: ReactMenubarItem, dataItem: TItem) => ReactNode
}

export function Menubar<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderItem }: MenubarProps<TItem>) {
  const menubar = useMenubarPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...menubar.rootProps, className },
    menubar.rootItems.map((item) =>
      createElement(
        'div',
        { key: item.key },
        createElement('div', item.itemProps, renderItem?.(item, data.items[item.key]) ?? item.label),
        item.expanded && item.hasChildren
          ? renderItemCollection({
              rootProps: { role: 'menu' },
              items: menubar.itemsFor(item.key), dataItems: data.items,
              getItemProps: (child) => child.itemProps,
              children: (child, dataItem) => renderItem?.(child, dataItem) ?? child.label,
            })
          : null,
      ),
    ),
  )
}

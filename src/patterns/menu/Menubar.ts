import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactMenubarItem } from './menubarItem'
import { useMenubarPattern } from './useMenubarPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

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
    { ...menubar.rootProps, className } as DivProps,
    menubar.rootItems.map((item) =>
      createElement('div', { key: item.key } as DivProps & { key: Key }, [
        createElement('div', { key: `${item.key}-item`, ...item.itemProps } as DivProps, renderItem?.(item, data.items[item.key]) ?? item.label),
        item.expanded && item.hasChildren
          ? createElement(
              'div',
              { key: `${item.key}-menu`, role: 'menu' } as DivProps,
              menubar.itemsFor(item.key).map((child) =>
                createElement('div', { key: child.key, ...child.itemProps } as DivProps & { key: Key }, renderItem?.(child, data.items[child.key]) ?? child.label),
              ),
            )
          : null,
      ]),
    ),
  )
}

import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem } from '../../schema'
import { useMenuPattern, type ReactMenuItem, type ReactMenuPatternOptions } from './useMenuPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface MenuProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: ReactMenuPatternOptions
  className?: string
  renderItem?: (item: ReactMenuItem, dataItem: TItem) => ReactNode
}

export function Menu<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderItem }: MenuProps<TItem>) {
  const menu = useMenuPattern(data, onEvent, options)
  if (!menu.open || !menu.menuKey) return null

  return createElement(
    'div',
    { ...menu.menuProps, className } as DivProps,
    menu.items.map((item) =>
      createElement('div', { key: item.key, ...item.itemProps } as DivProps & { key: Key }, renderItem?.(item, data.items[item.key]) ?? item.label),
    ),
  )
}

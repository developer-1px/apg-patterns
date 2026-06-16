import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem } from '../../schema'
import { useMenuPattern, type ReactMenuItem, type ReactMenuPatternOptions } from './useMenuPattern'

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

  return renderItemCollection({
    rootProps: menu.menuProps, className, items: menu.items, dataItems: data.items,
    getItemProps: (item) => item.itemProps,
    children: (item, dataItem) => renderItem?.(item, dataItem) ?? item.label,
  })
}

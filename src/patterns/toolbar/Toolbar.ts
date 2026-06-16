import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useToolbarPattern, type ReactToolbarRenderItem } from './useToolbarPattern'

export interface ToolbarProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderItem?: (item: ReactToolbarRenderItem, dataItem: TItem) => ReactNode
}

export function Toolbar<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderItem }: ToolbarProps<TItem>) {
  const toolbar = useToolbarPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: toolbar.rootProps, className, items: toolbar.renderItems, dataItems: data.items,
    itemElement: 'button',
    getItemProps: (item) => ({ type: 'button', ...item.itemProps }),
    children: (item, dataItem) => renderItem?.(item, dataItem) ?? item.label,
  })
}

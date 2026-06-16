import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
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

  return createElement(
    'div',
    { ...toolbar.rootProps, className } as ComponentPropsWithoutRef<'div'>,
    toolbar.renderItems.map((item) =>
      createElement('button', { key: item.key, type: 'button', ...item.itemProps } as ComponentPropsWithoutRef<'button'> & { key: Key }, renderItem?.(item, data.items[item.key]) ?? item.label),
    ),
  )
}

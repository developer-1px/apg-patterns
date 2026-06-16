import { createElement, type ReactNode } from 'react'
import type { Key, PatternItem } from '../schema'
import type { ReactPatternProps } from './reactBaseTypes'

type ItemElement = 'article' | 'button' | 'div'
type PresetItemProps = ReactPatternProps & { type?: 'button' }

export function renderItemCollection<TItem extends PatternItem, TRenderItem extends { key: Key }>({
  rootProps,
  className,
  items,
  dataItems,
  itemElement = 'div',
  getItemProps,
  children,
}: {
  rootProps: ReactPatternProps
  className?: string
  items: readonly TRenderItem[]
  dataItems: Record<Key, TItem>
  itemElement?: ItemElement
  getItemProps: (item: TRenderItem) => PresetItemProps
  children: (item: TRenderItem, dataItem: TItem) => ReactNode
}) {
  return createElement(
    'div',
    { ...rootProps, className } as ReactPatternProps,
    items.map((item) =>
      createElement(itemElement, { key: item.key, ...getItemProps(item) } as PresetItemProps & { key: Key }, children(item, dataItems[item.key])),
    ),
  )
}

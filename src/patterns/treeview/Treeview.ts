import { createElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactTreeviewRenderItem } from './adaptTreeviewRuntime'
import { useTreeviewPattern } from './useTreeviewPattern'

type TreeDataItem = PatternItem & {
  href?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>

export interface TreeviewProps<TItem extends TreeDataItem = TreeDataItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  indent?: number
  renderLabel?: (item: ReactTreeviewRenderItem, dataItem: TItem) => ReactNode
  renderIcon?: (item: ReactTreeviewRenderItem, dataItem: TItem) => ReactNode
}

export function Treeview<TItem extends TreeDataItem = TreeDataItem>({
  data,
  onEvent,
  options,
  className,
  indent = 18,
  renderLabel,
  renderIcon,
}: TreeviewProps<TItem>) {
  const tree = useTreeviewPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...tree.rootProps, className } as DivProps,
    tree.renderItems.map((item) => renderTreeItem({ item, dataItem: data.items[item.key], indent, renderLabel, renderIcon })),
  )
}

function renderTreeItem<TItem extends TreeDataItem>({
  item,
  dataItem,
  indent,
  renderLabel,
  renderIcon,
}: {
  item: ReactTreeviewRenderItem
  dataItem: TItem
  indent: number
  renderLabel?: (item: ReactTreeviewRenderItem, dataItem: TItem) => ReactNode
  renderIcon?: (item: ReactTreeviewRenderItem, dataItem: TItem) => ReactNode
}) {
  const icon = renderIcon?.(item, dataItem)
  const label = renderLabel?.(item, dataItem) ?? (dataItem.href ? createElement('a', { href: dataItem.href }, item.label) : item.label)

  const style: CSSProperties | undefined = item.level > 1 ? { paddingInlineStart: `${(item.level - 1) * indent}px` } : undefined
  return createElement(
    'div',
    { key: item.key, ...item.treeitemProps, style },
    item.kind === 'branch'
      ? createElement(
          'button',
          {
            key: `${item.key}-toggle`,
            'aria-label': `${item.state.expanded ? 'Collapse' : 'Expand'} ${item.label}`,
            ...item.toggleButtonProps,
          },
          item.state.expanded ? '-' : '+',
        )
      : null,
    icon !== undefined && icon !== null ? createElement('span', { key: `${item.key}-icon`, 'aria-hidden': true }, icon) : null,
    createElement('span', { key: `${item.key}-label` }, label),
  )
}

import { createElement, type ComponentPropsWithoutRef, type CSSProperties, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactTreeviewRenderItem } from './reactTypes'
import { useTreeviewPattern } from './useTreeviewPattern'

type TreeDataItem = PatternItem & {
  href?: string
}

type DivProps = ComponentPropsWithoutRef<'div'>
type ButtonProps = ComponentPropsWithoutRef<'button'>
type AnchorProps = ComponentPropsWithoutRef<'a'>
type SpanProps = ComponentPropsWithoutRef<'span'>

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
  const children: ReactNode[] = []
  if (item.kind === 'branch') {
    children.push(
      createElement(
        'button',
        {
          key: `${item.key}-toggle`,
          'aria-label': `${item.state.expanded ? 'Collapse' : 'Expand'} ${item.label}`,
          ...item.toggleButtonProps,
        } as ButtonProps,
        item.state.expanded ? '-' : '+',
      ),
    )
  }

  const icon = renderIcon?.(item, dataItem)
  if (icon !== undefined && icon !== null) children.push(createElement('span', { key: `${item.key}-icon`, 'aria-hidden': true } as SpanProps, icon))

  children.push(createElement('span', { key: `${item.key}-label` } as SpanProps, renderLabel?.(item, dataItem) ?? renderDefaultLabel(item, dataItem)))

  const style: CSSProperties | undefined = item.level > 1 ? { paddingInlineStart: `${(item.level - 1) * indent}px` } : undefined
  return createElement('div', { key: item.key, ...item.treeitemProps, style } as DivProps & { key: Key }, children)
}

function renderDefaultLabel<TItem extends TreeDataItem>(item: ReactTreeviewRenderItem, dataItem: TItem) {
  if (dataItem.href) return createElement('a', { href: dataItem.href } as AnchorProps, item.label)
  return item.label
}

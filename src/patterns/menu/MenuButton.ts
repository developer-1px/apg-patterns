import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useMenuButtonPattern, type ReactMenuButtonRuntime } from './useMenuButtonPattern'

type DivProps = ComponentPropsWithoutRef<'div'>
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

  return createElement('div', { className } as DivProps, [
    createElement('button', { key: 'trigger', ...menu.triggerProps } as ComponentPropsWithoutRef<'button'>, renderTrigger?.() ?? (menu.triggerKey ? data.items[menu.triggerKey]?.label : undefined)),
    menu.expanded
      ? createElement(
          'div',
          { key: 'menu', ...menu.menuProps } as DivProps,
          menu.items.map((item) =>
            createElement('div', { key: item.key, ...item.itemProps } as DivProps & { key: Key }, renderItem?.(item, data.items[item.key]) ?? item.label),
          ),
        )
      : null,
  ])
}

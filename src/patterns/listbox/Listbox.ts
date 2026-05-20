import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactListboxRenderItem } from './reactTypes'
import { useListboxPattern } from './useListboxPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface ListboxProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderOption?: (item: ReactListboxRenderItem, dataItem: TItem) => ReactNode
}

export function Listbox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderOption }: ListboxProps<TItem>) {
  const listbox = useListboxPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...listbox.rootProps, className } as DivProps,
    listbox.renderItems.map((item) =>
      createElement(
        'div',
        { key: item.key, ...item.optionProps } as DivProps & { key: Key },
        renderOption?.(item, data.items[item.key]) ?? item.label,
      ),
    ),
  )
}

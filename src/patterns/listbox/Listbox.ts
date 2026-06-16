import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useListboxPattern, type ReactListboxRenderItem } from './useListboxPattern'

export interface ListboxProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderOption?: (item: ReactListboxRenderItem, dataItem: TItem) => ReactNode
}

export function Listbox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderOption }: ListboxProps<TItem>) {
  const listbox = useListboxPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: listbox.rootProps, className, items: listbox.renderItems, dataItems: data.items,
    getItemProps: (item) => item.optionProps,
    children: (item, dataItem) => renderOption?.(item, dataItem) ?? item.label,
  })
}

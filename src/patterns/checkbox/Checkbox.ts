import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useCheckboxPattern, type ReactCheckboxRenderItem } from './useCheckboxPattern'

export interface CheckboxProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCheckbox?: (item: ReactCheckboxRenderItem, dataItem: TItem) => ReactNode
}

export function Checkbox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderCheckbox }: CheckboxProps<TItem>) {
  const checkbox = useCheckboxPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: checkbox.rootProps, className, items: checkbox.renderItems, dataItems: data.items,
    getItemProps: (item) => item.checkboxProps,
    children: (item, dataItem) => renderCheckbox?.(item, dataItem) ?? item.label,
  })
}

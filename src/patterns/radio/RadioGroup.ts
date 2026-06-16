import type { ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { PatternData, PatternEvent, PatternItem } from '../../schema'
import { useRadioGroupPattern, type ReactRadioGroupOptions, type ReactRadioRenderItem } from './useRadioGroupPattern'

export interface RadioGroupProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: ReactRadioGroupOptions
  className?: string
  renderRadio?: (item: ReactRadioRenderItem, dataItem: TItem) => ReactNode
}

export function RadioGroup<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderRadio }: RadioGroupProps<TItem>) {
  const radioGroup = useRadioGroupPattern(data, onEvent, options)

  return renderItemCollection({
    rootProps: radioGroup.rootProps, className, items: radioGroup.renderItems, dataItems: data.items,
    getItemProps: (item) => item.radioProps,
    children: (item, dataItem) => renderRadio?.(item, dataItem) ?? item.label,
  })
}

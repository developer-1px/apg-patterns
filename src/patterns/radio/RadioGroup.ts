import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactRadioRenderItem } from './radioRenderItem'
import { useRadioGroupPattern } from './useRadioGroupPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface RadioGroupProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderRadio?: (item: ReactRadioRenderItem, dataItem: TItem) => ReactNode
}

export function RadioGroup<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderRadio }: RadioGroupProps<TItem>) {
  const radioGroup = useRadioGroupPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...radioGroup.rootProps, className } as DivProps,
    radioGroup.renderItems.map((item) =>
      createElement('div', { key: item.key, ...item.radioProps } as DivProps & { key: Key }, renderRadio?.(item, data.items[item.key]) ?? item.label),
    ),
  )
}

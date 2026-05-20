import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactCheckboxRenderItem } from './checkboxRenderItem'
import { useCheckboxPattern } from './useCheckboxPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface CheckboxProps<TItem extends PatternItem = PatternItem> {
  data: PatternData<TItem>
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderCheckbox?: (item: ReactCheckboxRenderItem, dataItem: TItem) => ReactNode
}

export function Checkbox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderCheckbox }: CheckboxProps<TItem>) {
  const checkbox = useCheckboxPattern(data, onEvent, options)

  return createElement(
    'div',
    { ...checkbox.rootProps, className } as DivProps,
    checkbox.renderItems.map((item) =>
      createElement('div', { key: item.key, ...item.checkboxProps } as DivProps & { key: Key }, renderCheckbox?.(item, data.items[item.key]) ?? item.label),
    ),
  )
}

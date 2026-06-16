import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import { renderItemCollection } from '../../adapters/reactPresetElements'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useComboboxPattern, type ComboboxData, type ReactComboboxOption } from './useComboboxPattern'

export interface ComboboxProps<TItem extends PatternItem = PatternItem> {
  data: ComboboxData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderOption?: (option: ReactComboboxOption, dataItem: TItem) => ReactNode
}

export function Combobox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderOption }: ComboboxProps<TItem>) {
  const combobox = useComboboxPattern(data, onEvent, options)

  return createElement(
    'div',
    { className },
    createElement('input', { ...combobox.inputProps, ref: combobox.setInputRef } as ComponentPropsWithoutRef<'input'>),
    combobox.open
      ? renderItemCollection({
          rootProps: combobox.listboxProps, items: combobox.options, dataItems: data.items,
          getItemProps: (option) => option.optionProps,
          children: (option, dataItem) => renderOption?.(option, dataItem) ?? option.label,
        })
      : null,
  )
}

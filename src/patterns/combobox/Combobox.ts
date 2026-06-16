import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { useComboboxPattern, type ComboboxData, type ReactComboboxOption } from './useComboboxPattern'

type DivProps = ComponentPropsWithoutRef<'div'>

export interface ComboboxProps<TItem extends PatternItem = PatternItem> {
  data: ComboboxData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderOption?: (option: ReactComboboxOption, dataItem: TItem) => ReactNode
}

export function Combobox<TItem extends PatternItem = PatternItem>({ data, onEvent, options, className, renderOption }: ComboboxProps<TItem>) {
  const combobox = useComboboxPattern(data, onEvent, options)

  return createElement('div', { className } as DivProps, [
    createElement('input', { key: 'input', ...combobox.inputProps, ref: combobox.setInputRef } as ComponentPropsWithoutRef<'input'>),
    combobox.open
      ? createElement(
          'div',
          { key: 'listbox', ...combobox.listboxProps } as DivProps,
          combobox.options.map((option) =>
            createElement('div', { key: option.key, ...option.optionProps } as DivProps & { key: Key }, renderOption?.(option, data.items[option.key]) ?? option.label),
          ),
        )
      : null,
  ])
}

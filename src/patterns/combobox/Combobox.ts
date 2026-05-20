import { createElement, type ComponentPropsWithoutRef, type ReactNode } from 'react'
import type { Key, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import type { ReactComboboxOption } from './comboboxOption'
import type { ComboboxData } from './comboboxRuntimeState'
import { useComboboxPattern } from './useComboboxPattern'

type ComboboxDataItem = PatternItem

type DivProps = ComponentPropsWithoutRef<'div'>
type InputProps = ComponentPropsWithoutRef<'input'>

export interface ComboboxProps<TItem extends ComboboxDataItem = ComboboxDataItem> {
  data: ComboboxData & { items: Record<Key, TItem> }
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
  className?: string
  renderOption?: (option: ReactComboboxOption, dataItem: TItem) => ReactNode
}

export function Combobox<TItem extends ComboboxDataItem = ComboboxDataItem>({ data, onEvent, options, className, renderOption }: ComboboxProps<TItem>) {
  const combobox = useComboboxPattern(data, onEvent, options)

  return createElement('div', { className } as DivProps, [
    createElement('input', { key: 'input', ...combobox.inputProps, ref: combobox.setInputRef } as InputProps),
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

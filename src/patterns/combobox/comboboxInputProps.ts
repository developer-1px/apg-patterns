import type { InputHTMLAttributes, KeyboardEvent } from 'react'
import type { PatternEvent } from '../../schema'
import { COMBOBOX_KEY } from './definition'

type ComboboxVariant = 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete'

export function createComboboxInputProps({
  rootProps,
  editable,
  displayValue,
  listboxId,
  open,
  variant,
  onEvent,
}: {
  rootProps: InputHTMLAttributes<HTMLInputElement>
  editable: boolean
  displayValue: string
  listboxId: string
  open: boolean
  variant: ComboboxVariant
  onEvent: (event: PatternEvent) => void
}): InputHTMLAttributes<HTMLInputElement> {
  return {
    ...rootProps,
    type: 'text',
    readOnly: !editable,
    value: displayValue,
    placeholder: editable ? 'Search fruit' : 'Select fruit',
    'aria-controls': listboxId,
    onChange: (event) => {
      if (editable) onEvent({ type: 'inputValue', key: COMBOBOX_KEY, value: event.currentTarget.value, inline: variant === 'listWithInlineAutocomplete' })
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (variant === 'selectOnly' && event.key.length === 1 && handleSelectOnlyTypeahead(event.key, onEvent)) {
        event.preventDefault()
        return
      }
      rootProps.onKeyDown?.(event)
    },
    onClick: () => {
      if (!open) onEvent({ type: 'expand', key: COMBOBOX_KEY, expanded: true })
    },
  }
}

function handleSelectOnlyTypeahead(key: string, onEvent: (event: PatternEvent) => void): boolean {
  if (!/^[\w]$/.test(key)) return false
  onEvent({ type: 'typeahead', query: key.toLowerCase() })
  return true
}

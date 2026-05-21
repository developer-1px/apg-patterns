import type { InputHTMLAttributes, KeyboardEvent } from 'react'
import type { PatternEvent } from '../../schema'
import { comboboxRootKey } from './navigation'

type ComboboxVariant =
  | 'selectOnly'
  | 'listNoAutocomplete'
  | 'listAutocomplete'
  | 'listWithInlineAutocomplete'
  | 'datepicker'
  | 'gridPopup'

export function createComboboxInputProps({
  rootProps,
  editable,
  displayValue,
  listboxId,
  open,
  variant,
  label,
  onEvent,
}: {
  rootProps: InputHTMLAttributes<HTMLInputElement>
  editable: boolean
  displayValue: string
  listboxId: string
  open: boolean
  variant: ComboboxVariant
  label: string
  onEvent: (event: PatternEvent) => void
}): InputHTMLAttributes<HTMLInputElement> {
  return {
    ...rootProps,
    type: 'text',
    readOnly: !editable,
    value: displayValue,
    placeholder: editable ? `Search ${label.toLowerCase()}` : `Select ${label.toLowerCase()}`,
    'aria-controls': listboxId,
    onChange: (event) => {
      if (editable) onEvent({ type: 'inputValue', key: comboboxRootKey, value: event.currentTarget.value, inline: variant === 'listWithInlineAutocomplete' })
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (variant === 'selectOnly' && event.key.length === 1 && handleSelectOnlyTypeahead(event.key, onEvent)) {
        event.preventDefault()
        return
      }
      rootProps.onKeyDown?.(event)
    },
    onClick: () => {
      if (!open) onEvent({ type: 'expand', key: comboboxRootKey, expanded: true })
    },
  }
}

function handleSelectOnlyTypeahead(key: string, onEvent: (event: PatternEvent) => void): boolean {
  if (!/^[\w]$/.test(key)) return false
  onEvent({ type: 'typeahead', query: key.toLowerCase() })
  return true
}

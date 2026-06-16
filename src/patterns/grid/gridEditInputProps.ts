import type { InputHTMLAttributes } from 'react'
import type { Key, PatternEvent } from '../../schema'
import type { GridValue } from './gridRuntimeState'

export type ReactGridEditInputProps = InputHTMLAttributes<HTMLInputElement> & { 'data-edit': string }

export function createGridEditInputProps({
  key,
  editDraftByKey,
  commitEdit,
  cancelEdit,
  onEvent,
}: {
  key: Key
  editDraftByKey: Record<string, GridValue>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): ReactGridEditInputProps {
  return {
    'data-edit': '',
    value: String(editDraftByKey[key] ?? ''),
    onChange: (event) => onEvent({ type: 'editDraft', key, value: event.currentTarget.value }),
    onKeyDown: (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        commitEdit()
      } else if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancelEdit()
      } else if (event.key === 'Tab') {
        event.stopPropagation()
        commitEdit()
      } else {
        event.stopPropagation()
      }
    },
    onBlur: commitEdit,
  }
}

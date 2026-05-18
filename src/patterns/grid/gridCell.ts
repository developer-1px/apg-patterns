import type { InputHTMLAttributes } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'

export interface ReactGridCell {
  key: Key
  label: string
  value: string
  kind: 'columnheader' | 'gridcell'
  state: ReactRenderItemState
  editable: boolean
  editing: boolean
  sort: 'ascending' | 'descending' | 'other' | null
  cellProps: ReactPatternProps
  editInputProps: InputHTMLAttributes<HTMLInputElement> & { 'data-edit': string }
}

export function createGridCell(input: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  editableKeys: readonly string[]
  editingKey: string | null
  editDraftByKey: Record<string, string | number | boolean | null>
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
  sortByKey: Readonly<Record<Key, 'ascending' | 'descending' | 'other'>>
  commitEdit(): void
  cancelEdit(): void
  onEvent(event: PatternEvent): void
}): ReactGridCell {
  const part = input.data.items[input.key]?.kind === 'columnheader' ? 'columnheader' : 'gridcell'
  const state = input.runtime.getItemState(input.key, part)
  const value = input.valueByKey[input.key] !== undefined ? String(input.valueByKey[input.key]) : input.data.items[input.key]?.label ?? ''
  return {
    key: input.key,
    label: input.data.items[input.key]?.label ?? input.key,
    value,
    kind: part,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.selected),
      disabled: Boolean(state.disabled),
    },
    editable: input.editableKeys.includes(input.key),
    editing: input.editingKey === input.key,
    sort: part === 'columnheader' ? input.sortByKey[input.key] ?? null : null,
    cellProps: reactProps(input.runtime.getPartProps(part, input.key)),
    editInputProps: {
      'data-edit': '',
      value: String(input.editDraftByKey[input.key] ?? ''),
      onChange: (event) => input.onEvent({ type: 'editDraft', key: input.key, value: event.currentTarget.value }),
      onKeyDown: (event) => {
        if (event.key === 'Enter') {
          event.preventDefault()
          event.stopPropagation()
          input.commitEdit()
        } else if (event.key === 'Escape') {
          event.preventDefault()
          event.stopPropagation()
          input.cancelEdit()
        } else if (event.key === 'Tab') {
          event.stopPropagation()
          input.commitEdit()
        } else {
          event.stopPropagation()
        }
      },
      onBlur: input.commitEdit,
    } as ReactGridCell['editInputProps'],
  }
}

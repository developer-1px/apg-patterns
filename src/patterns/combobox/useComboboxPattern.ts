import { useRef } from 'react'
import type { HTMLAttributes, InputHTMLAttributes, KeyboardEvent, MouseEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { COMBOBOX_KEY, comboboxDefinition } from './definition'

export interface ReactComboboxOption {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active' | 'selected'>
  optionProps: ReactPatternProps
}

export interface ReactComboboxRuntime {
  inputProps: InputHTMLAttributes<HTMLInputElement>
  listboxProps: HTMLAttributes<HTMLElement>
  options: readonly ReactComboboxOption[]
  open: boolean
  editable: boolean
  listboxId: string
  setInputRef(node: HTMLInputElement | null): void
}

export function useComboboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactComboboxRuntime {
  const variant = (data.state?.variant as string | undefined) ?? 'listAutocomplete'
  const autocomplete = variant === 'selectOnly' ? 'none' : variant === 'listAutocomplete' ? 'list' : 'both'
  const editable = variant !== 'selectOnly'
  const listboxId = options?.listboxId ? String(options.listboxId) : 'combobox-popup'
  const inputRef = useRef<HTMLInputElement>(null)
  const query = ((data.state as { query?: string } | undefined)?.query ?? '') as string
  const inlineCompletion = ((data.state as { inlineCompletion?: { start: number; end: number } | null } | undefined)?.inlineCompletion ?? null) as {
    start: number
    end: number
  } | null
  const runtime = createPatternRuntime({
    definition: comboboxDefinition,
    data,
    options: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete, ...(options ?? {}) },
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'combobox-option-'}${key}`,
  })
  const rootProps = runtime.getPartProps('combobox') as unknown as InputHTMLAttributes<HTMLInputElement>
  const open = data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false
  const selectedKey = data.state?.selectedKeys?.[0]
  const selectedLabel = selectedKey ? data.items[selectedKey]?.label ?? '' : ''
  const displayValue = editable ? (selectedKey && !open ? selectedLabel : query) : selectedLabel

  const handleSelectOnlyTypeahead = (key: string) => {
    if (!/^[\w]$/.test(key)) return false
    onEvent({ type: 'typeahead', query: key.toLowerCase() })
    return true
  }

  return {
    inputProps: {
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
        if (variant === 'selectOnly' && event.key.length === 1 && handleSelectOnlyTypeahead(event.key)) {
          event.preventDefault()
          return
        }
        rootProps.onKeyDown?.(event)
      },
      onClick: () => {
        if (!open) onEvent({ type: 'expand', key: COMBOBOX_KEY, expanded: true })
      },
    },
    listboxProps: runtime.getPartProps('listbox') as HTMLAttributes<HTMLElement>,
    get options() {
      return Object.keys(data.items).filter((key) => key !== COMBOBOX_KEY).map((key) => {
        const optionProps = runtime.getPartProps('option', key) as ReactPatternProps
        const state = runtime.getItemState(key, 'option')
        const active = Boolean(state.active)
        const selected = Boolean(state.selected)
        return {
          key,
          label: data.items[key]?.label ?? key,
          state: {
            active,
            selected,
          },
          optionProps: {
            ...optionProps,
            'aria-selected': open ? active : selected,
            onMouseDown: (event: MouseEvent<HTMLElement>) => {
              event.preventDefault()
              onEvent({ type: 'select', keys: [key], anchorKey: key, extentKey: key })
              onEvent({ type: 'expand', key: COMBOBOX_KEY, expanded: false })
              if (editable) onEvent({ type: 'commitValue', key, value: data.items[key]?.label ?? '' })
            },
          },
        }
      })
    },
    open,
    editable,
    listboxId,
    setInputRef: (node) => {
      inputRef.current = node
      if (variant === 'listWithInlineAutocomplete' && inlineCompletion && node) {
        node.setSelectionRange(inlineCompletion.start, inlineCompletion.end)
      }
    },
  }
}

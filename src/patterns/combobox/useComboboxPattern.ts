import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes, InputHTMLAttributes } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternState } from '../../schema'
import { createComboboxInputProps } from './comboboxInputProps'
import { createComboboxOption, type ReactComboboxOption } from './comboboxOption'
import { COMBOBOX_KEY, comboboxDefinition } from './definition'

type ComboboxVariant = 'selectOnly' | 'listAutocomplete' | 'listWithInlineAutocomplete'

interface ComboboxState extends PatternState {
  variant?: ComboboxVariant
  query?: string
  inlineCompletion?: { start: number; end: number } | null
}

type ComboboxData = PatternData<PatternItem, ComboboxState>

export type { ReactComboboxOption } from './comboboxOption'

export interface ReactComboboxRuntime {
  inputProps: InputHTMLAttributes<HTMLInputElement>
  listboxProps: HTMLAttributes<HTMLElement>
  options: readonly ReactComboboxOption[]
  open: boolean
  editable: boolean
  listboxId: string
  setInputRef(node: HTMLInputElement | null): void
}

export function useComboboxPattern(data: ComboboxData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactComboboxRuntime {
  const variant = data.state?.variant ?? 'listAutocomplete'
  const autocomplete = variant === 'selectOnly' ? 'none' : variant === 'listAutocomplete' ? 'list' : 'both'
  const editable = variant !== 'selectOnly'
  const listboxId = options?.listboxId ? String(options.listboxId) : 'combobox-popup'
  const inputRef = useRef<HTMLInputElement>(null)
  const query = data.state?.query ?? ''
  const inlineCompletion = data.state?.inlineCompletion ?? null
  const runtime = createPatternRuntime({
    definition: comboboxDefinition,
    data,
    options: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete, ...(options ?? {}) },
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'combobox-option-'}${key}`,
  })
  const rootProps = runtime.getPartProps('combobox') as InputHTMLAttributes<HTMLInputElement>
  const open = data.state?.expandedKeys?.includes(COMBOBOX_KEY) ?? false
  const selectedKey = data.state?.selectedKeys?.[0]
  const selectedLabel = selectedKey ? data.items[selectedKey]?.label ?? '' : ''
  const displayValue = editable ? (selectedKey && !open ? selectedLabel : query) : selectedLabel
  const activeKey = data.state?.activeKey

  useLayoutEffect(() => {
    if (!open || !activeKey || activeKey === COMBOBOX_KEY) return
    const activeOption = document.getElementById(runtime.keyToElementId(activeKey))
    if (typeof activeOption?.scrollIntoView !== 'function') return
    activeOption.scrollIntoView({ block: 'nearest' })
  }, [activeKey, open, runtime])

  return {
    inputProps: createComboboxInputProps({ rootProps, editable, displayValue, listboxId, open, variant, onEvent }),
    listboxProps: runtime.getPartProps('listbox') as HTMLAttributes<HTMLElement>,
    get options() {
      return Object.keys(data.items)
        .filter((key) => key !== COMBOBOX_KEY)
        .map((key) => createComboboxOption({ runtime, data, key, open, editable, onEvent }))
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

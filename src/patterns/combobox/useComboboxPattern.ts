import { useLayoutEffect, useRef, type HTMLAttributes, type InputHTMLAttributes, type KeyboardEvent, type MouseEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions, PatternState } from '../../schema'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { comboboxDefinition } from './definition'
import { comboboxRootKey } from './navigation'
import { usePatternElementId } from '../../adapters/reactDomIds'

export type ComboboxVariant =
  | 'selectOnly'
  | 'listNoAutocomplete'
  | 'listAutocomplete'
  | 'listWithInlineAutocomplete'
  | 'datepicker'
  | 'gridPopup'

interface ComboboxState extends PatternState {
  variant?: ComboboxVariant
  query?: string
  inlineCompletion?: { start: number; end: number } | null
}

export type ComboboxData = PatternData<PatternItem, ComboboxState>

interface ComboboxRuntimeState {
  runtimeOptions: PatternOptions
  variant: ComboboxVariant
  editable: boolean
  listboxId: string
  query: string
  inlineCompletion: { start: number; end: number } | null
  open: boolean
  displayValue: string
  activeKey: Key | null | undefined
  label: string
}

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

export function useComboboxPattern(data: ComboboxData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactComboboxRuntime {
  const { runtimeOptions, variant, editable, listboxId, inlineCompletion, open, displayValue, activeKey, label } = getComboboxRuntimeState(data, options)
  const keyToElementId = usePatternElementId(options, 'combobox-option-')
  const runtime = createPatternRuntime({
    definition: comboboxDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const rootProps = runtime.getPartProps('combobox') as InputHTMLAttributes<HTMLInputElement>
  const setInputRef = useComboboxInlineCompletionInputRef({ inlineCompletion, variant })

  useComboboxActiveOptionScroll({ activeKey, open, runtime })

  return {
    inputProps: createComboboxInputProps({ rootProps, editable, displayValue, listboxId, open, variant, label, onEvent }),
    listboxProps: runtime.getPartProps('listbox') as HTMLAttributes<HTMLElement>,
    get options() {
      return runtime.visibleKeys.map((key) => createComboboxOption({ runtime, data, key, open, editable, onEvent }))
    },
    open,
    editable,
    listboxId,
    setInputRef,
  }
}

function createComboboxInputProps({
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
      if (editable) onEvent(withDefaultReason({ type: 'inputValue', key: comboboxRootKey, value: event.currentTarget.value, inline: variant === 'listWithInlineAutocomplete' }, 'keyboard'))
    },
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => {
      if (variant === 'selectOnly' && event.key.length === 1 && handleSelectOnlyTypeahead(event.key, onEvent)) {
        event.preventDefault()
        return
      }
      rootProps.onKeyDown?.(event)
    },
    onClick: () => {
      if (!open) onEvent(withDefaultReason({ type: 'expand', key: comboboxRootKey, expanded: true }, 'pointer'))
    },
  }
}

function handleSelectOnlyTypeahead(key: string, onEvent: (event: PatternEvent) => void): boolean {
  if (!/^[\w]$/.test(key)) return false
  onEvent(withDefaultReason({ type: 'typeahead', query: key.toLowerCase() }, 'keyboard'))
  return true
}

function getComboboxRuntimeState(data: ComboboxData, options?: PatternOptions): ComboboxRuntimeState {
  const variant = data.state?.variant ?? 'listAutocomplete'
  const autocomplete = variant === 'listAutocomplete' || variant === 'gridPopup' ? 'list' : variant === 'listWithInlineAutocomplete' ? 'both' : 'none'
  const editable = variant !== 'selectOnly'
  const listboxId = options?.listboxId ? String(options.listboxId) : 'combobox-popup'
  const query = data.state?.query ?? ''
  const inlineCompletion = data.state?.inlineCompletion ?? null
  const open = data.state?.expandedKeys?.includes(comboboxRootKey) ?? false
  const selectedKey = data.state?.selectedKeys?.[0]
  const selectedLabel = selectedKey ? data.items[selectedKey]?.label ?? '' : ''
  const displayValue = editable ? (selectedKey && !open ? selectedLabel : query) : selectedLabel
  const label = typeof data.refs?.label === 'string' ? data.refs.label : data.items[comboboxRootKey]?.label ?? 'Option'

  return {
    runtimeOptions: { focusStrategy: 'ariaActiveDescendant', haspopup: 'listbox', autocomplete, ...(options ?? {}) },
    variant,
    editable,
    listboxId,
    query,
    inlineCompletion,
    open,
    displayValue,
    activeKey: data.state?.activeKey,
    label,
  }
}

function createComboboxOption({
  runtime,
  data,
  key,
  open,
  editable,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  open: boolean
  editable: boolean
  onEvent: (event: PatternEvent) => void
}): ReactComboboxOption {
  const optionProps = reactProps(runtime.getPartProps('option', key))
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
        onEvent(withDefaultReason({ type: 'select', keys: [key], anchorKey: key, extentKey: key }, 'pointer'))
        onEvent(withDefaultReason({ type: 'expand', key: comboboxRootKey, expanded: false }, 'pointer'))
        if (editable) onEvent(withDefaultReason({ type: 'commitValue', key, value: data.items[key]?.label ?? '' }, 'pointer'))
      },
    },
  }
}

function useComboboxInlineCompletionInputRef({
  inlineCompletion,
  variant,
}: {
  inlineCompletion: { start: number; end: number } | null
  variant: ComboboxVariant
}): (node: HTMLInputElement | null) => void {
  const inputRef = useRef<HTMLInputElement>(null)
  return (node) => {
    inputRef.current = node
    if (variant === 'listWithInlineAutocomplete' && inlineCompletion && node) {
      node.setSelectionRange(inlineCompletion.start, inlineCompletion.end)
    }
  }
}

function useComboboxActiveOptionScroll({
  activeKey,
  open,
  runtime,
}: {
  activeKey: Key | null | undefined
  open: boolean
  runtime: PatternRuntime
}): void {
  useLayoutEffect(() => {
    if (!open || !activeKey || activeKey === comboboxRootKey) return
    const activeOption = document.getElementById(runtime.keyToElementId(activeKey))
    if (typeof activeOption?.scrollIntoView !== 'function') return
    activeOption.scrollIntoView({ block: 'nearest' })
  }, [activeKey, open, runtime])
}

import { useLayoutEffect, useRef, type HTMLAttributes, type InputHTMLAttributes } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent, PatternOptions } from '../../schema'
import { createComboboxInputProps } from './comboboxInputProps'
import { createComboboxOption, type ReactComboboxOption } from './comboboxOption'
import { getComboboxRuntimeState, type ComboboxData, type ComboboxVariant } from './comboboxRuntimeState'
import { comboboxDefinition } from './definition'
import { comboboxRootKey } from './navigation'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
      return Object.keys(data.items)
        .filter((key) => key !== comboboxRootKey)
        .map((key) => createComboboxOption({ runtime, data, key, open, editable, onEvent }))
    },
    open,
    editable,
    listboxId,
    setInputRef,
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

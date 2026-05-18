import type { HTMLAttributes, InputHTMLAttributes } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { PatternEvent, PatternOptions } from '../../schema'
import { createComboboxInputProps } from './comboboxInputProps'
import { createComboboxOption, type ReactComboboxOption } from './comboboxOption'
import { getComboboxRuntimeState, type ComboboxData } from './comboboxRuntimeState'
import { COMBOBOX_KEY, comboboxDefinition } from './definition'
import { useComboboxActiveOptionScroll } from './useComboboxActiveOptionScroll'
import { useComboboxInlineCompletionInputRef } from './useComboboxInlineCompletionInputRef'
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
  const { runtimeOptions, variant, editable, listboxId, inlineCompletion, open, displayValue, activeKey } = getComboboxRuntimeState(data, options)
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
    setInputRef,
  }
}

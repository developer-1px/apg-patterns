import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactCheckboxRenderItem {
  key: Key
  label: string
  state: {
    checked: boolean | 'mixed'
    disabled: boolean
  }
  checkboxProps: ReactPatternProps
}

export function createCheckboxRenderItem(runtime: PatternRuntime, key: Key): ReactCheckboxRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('checkbox', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'checkbox')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      checked: state.checked === 'mixed' ? 'mixed' : Boolean(state.checked),
      disabled: Boolean(state.disabled),
    },
    checkboxProps: {
      ...props,
      tabIndex: 0,
      onKeyDown: (event) => handleCheckboxKeyDown(runtime, key, event),
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
  }
}

function handleCheckboxKeyDown(runtime: PatternRuntime, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}

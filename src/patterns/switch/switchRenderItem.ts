import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export interface ReactSwitchRenderItem {
  key: Key
  label: string
  state: {
    checked: boolean
    disabled: boolean
  }
  switchProps: ReactPatternProps
}

export function createSwitchRenderItem(runtime: PatternRuntime, key: Key): ReactSwitchRenderItem {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('switch', key) as ReactPatternProps
  const state = runtime.getItemState(key, 'switch')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      checked: state.checked === true,
      disabled: Boolean(state.disabled),
    },
    switchProps: {
      ...props,
      tabIndex: 0,
      onKeyDown: (event) => handleSwitchKeyDown(runtime, key, event),
      onFocus: () => runtime.emit({ type: 'focus', key }),
    },
  }
}

function handleSwitchKeyDown(runtime: PatternRuntime, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}

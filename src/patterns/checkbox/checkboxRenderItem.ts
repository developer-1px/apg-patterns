import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'

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
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('checkbox', key))
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
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => dispatchReactKeyboardBinding(runtime, key, event),
      onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
    },
  }
}

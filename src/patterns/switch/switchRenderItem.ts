import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'

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
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('switch', key))
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
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => dispatchReactKeyboardBinding(runtime, key, event),
      onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
    },
  }
}

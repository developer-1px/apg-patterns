import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { dispatchReactKeyboardBinding, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'

export function createButtonRootProps(runtime: PatternRuntime, key: Key | null): ReactPatternProps {
  if (!key) return {}
  const { role: _role, onKeyDown: _onKeyDown, ...props } = reactProps<ReactPatternProps & { role?: string }>(runtime.getPartProps('button', key))
  return reactProps({
    ...props,
    type: 'button',
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => dispatchReactKeyboardBinding(runtime, key, event),
    onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
  })
}

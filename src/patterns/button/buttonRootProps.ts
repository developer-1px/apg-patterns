import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createButtonRootProps(runtime: ReturnType<typeof createPatternRuntime>, key: Key | null): ReactPatternProps {
  if (!key) return {}
  const { role: _role, onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('button', key)) as ReactPatternProps & { role?: string }
  return reactProps({
    ...props,
    type: 'button',
    onKeyDown: (event) => handleButtonKeyDown(runtime, key, event),
    onFocus: () => runtime.emit({ type: 'focus', key }),
  })
}

function handleButtonKeyDown(runtime: ReturnType<typeof createPatternRuntime>, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}

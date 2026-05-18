import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createLinkProps(runtime: ReturnType<typeof createPatternRuntime>, key: Key | null): ReactPatternProps {
  if (!key) return {}
  const rootKeyboard = runtime.getRootKeyboardHandler()
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('link', key) as ReactPatternProps
  return {
    ...props,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyboard(reactKeyInput(event)),
  }
}

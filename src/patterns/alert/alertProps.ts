import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createAlertRootProps(runtime: ReturnType<typeof createPatternRuntime>, key: Key | null): ReactPatternProps {
  if (!key) return {}
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...(runtime.getPartProps('alert', key) as ReactPatternProps),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(reactKeyInput(event)),
    tabIndex: -1,
  }
}

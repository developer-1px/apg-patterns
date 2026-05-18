import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createTooltipTriggerProps(runtime: ReturnType<typeof createPatternRuntime>, triggerKey: Key | null): ReactPatternProps {
  if (!triggerKey) return {}
  const rootKeyDown = runtime.getRootKeyboardHandler()
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('trigger', triggerKey))
  return reactProps({
    ...props,
    type: 'button',
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(reactKeyInput(event)),
  })
}

import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createTooltipTriggerProps(runtime: ReturnType<typeof createPatternRuntime>, triggerKey: Key | null): ReactPatternProps {
  if (!triggerKey) return {}
  const rootKeyDown = runtime.getRootKeyboardHandler()
  const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('trigger', triggerKey) as ReactPatternProps
  return {
    ...props,
    type: 'button',
    onKeyDown: (event) => rootKeyDown(reactKeyInput(event)),
  } as ReactPatternProps
}

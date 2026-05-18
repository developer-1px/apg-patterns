import type { KeyboardEvent } from 'react'
import { handlePatternTrapFocus } from '../../adapters/reactPatternEffects'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'

export function createDialogProps({
  runtime,
  data,
  keyToElementId,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternDataWithOptions
  keyToElementId: (key: Key) => string
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...(runtime.getPartProps('dialog', 'dialog') as ReactPatternProps),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
    },
    tabIndex: -1,
  } as ReactPatternProps
}

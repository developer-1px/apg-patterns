import type { KeyboardEvent } from 'react'
import { handlePatternTrapFocus } from '../../adapters/reactPatternEffects'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { dialogDefinition } from './definition'

export function createDialogProps({
  runtime,
  data,
  keyToElementId,
}: {
  runtime: ReturnType<typeof createPatternRuntime>
  data: PatternData
  keyToElementId: (key: Key) => string
}): ReactPatternProps {
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return reactProps({
    ...runtime.getPartProps('dialog', 'dialog'),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      rootKeyDown(reactKeyInput(event))
      handlePatternTrapFocus({ event, definition: dialogDefinition, data, keyToElementId })
    },
    tabIndex: -1,
  })
}

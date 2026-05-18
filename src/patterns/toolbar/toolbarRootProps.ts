import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { PatternData } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createToolbarRootProps(runtime: PatternRuntime<PatternData>): ReactPatternProps {
  const rootProps = reactProps(runtime.getPartProps('toolbar'))
  const onKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...rootProps,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(reactKeyInput(event)),
  }
}

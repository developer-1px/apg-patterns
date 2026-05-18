import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { PatternData } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createRadioGroupRootProps(runtime: PatternRuntime<PatternData>): ReactPatternProps {
  const rootProps = reactProps(runtime.getPartProps('radiogroup'))
  const onKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...rootProps,
    onKeyDown: (event) => onKeyDown(reactKeyInput(event)),
  }
}

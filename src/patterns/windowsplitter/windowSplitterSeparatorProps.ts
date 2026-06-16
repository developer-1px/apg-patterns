import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'

export function createWindowSplitterSeparatorProps({
  runtime,
  key,
  min,
  max,
  options,
}: {
  runtime: PatternRuntime<PatternData>
  key: Key | null
  min: number
  max: number
  options: PatternOptions
}): ReactPatternProps {
  if (!key) return {}
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('separator', key))
  return {
    ...props,
    'aria-valuemin': min,
    'aria-valuemax': max,
    'aria-orientation': options.orientation === 'horizontal' || options.orientation === 'vertical' ? options.orientation : undefined,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      runtime.emit(withDefaultReason({ type: 'focus', key }, 'keyboard'))
      const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
      if (!result) return
      if (result.preventDefault) event.preventDefault()
      for (const next of result.events) runtime.emit(withDefaultReason(next, 'keyboard'))
    },
    onFocus: () => runtime.emit(withDefaultReason({ type: 'focus', key }, 'focus')),
  }
}

import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternDataWithOptions, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'

export function createWindowSplitterSeparatorProps({
  runtime,
  key,
  min,
  max,
  options,
}: {
  runtime: PatternRuntime<PatternDataWithOptions>
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
      runtime.emit({ type: 'focus', key })
      const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
      if (!result) return
      if (result.preventDefault) event.preventDefault()
      for (const next of result.events) runtime.emit(next)
    },
    onFocus: () => runtime.emit({ type: 'focus', key }),
  }
}

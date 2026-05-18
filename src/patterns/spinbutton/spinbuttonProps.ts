import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { SpinbuttonData } from './spinbuttonRenderItem'

export function createSpinbuttonProps({
  key,
  max,
  min,
  props,
  runtime,
}: {
  key: Key
  max: number
  min: number
  props: ReactPatternProps
  runtime: PatternRuntime<SpinbuttonData>
}): ReactPatternProps {
  return {
    ...props,
    'aria-valuemin': min,
    'aria-valuemax': max,
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

export function createSpinbuttonStepButtonProps({
  direction,
  key,
  label,
  runtime,
}: {
  direction: 'decrement' | 'increment'
  key: Key
  label: string
  runtime: PatternRuntime<SpinbuttonData>
}): ReactPatternProps {
  return reactProps({
    type: 'button',
    'aria-label': `${direction === 'decrement' ? 'Decrement' : 'Increment'} ${label}`,
    onClick: () => {
      runtime.emit({ type: 'focus', key })
      runtime.emit({ type: 'valueStep', key, direction })
    },
  })
}

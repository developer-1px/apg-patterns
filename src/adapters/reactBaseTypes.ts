import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '../internal/keyboard'
import { withDefaultReason } from '../kernel/domEventBindings'
import type { PatternRuntime } from '../kernel/patternRuntime'
import type { Key } from '../schema'

export type ReactPatternProps = HTMLAttributes<HTMLElement>

export function reactProps<TProps extends ReactPatternProps = ReactPatternProps>(props: Record<string, unknown>): TProps {
  return props as TProps
}

export function reactKeyInput(event: KeyboardEvent<HTMLElement>): KeyInput & { preventDefault: () => void } {
  return {
    key: event.key,
    code: event.code,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey,
    isComposing: event.nativeEvent.isComposing,
    repeat: event.repeat,
    location: event.location,
    keyCode: event.keyCode,
    timeStamp: event.timeStamp,
    preventDefault: () => event.preventDefault(),
  }
}

export function dispatchReactKeyboardBinding(runtime: PatternRuntime, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
  if (!result) return false
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(withDefaultReason(next, 'keyboard'))
  return true
}

export interface ReactRenderItemState {
  active: boolean
  selected: boolean
  disabled: boolean
}

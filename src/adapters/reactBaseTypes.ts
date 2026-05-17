import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'

export type ReactPatternProps = HTMLAttributes<HTMLElement>

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

export interface ReactRenderItemState {
  active: boolean
  selected: boolean
  disabled: boolean
}

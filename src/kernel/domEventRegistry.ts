import type { PatternEventReason } from '../schema'

export type DomEventDescriptor = {
  handlerProp: string
  reason?: PatternEventReason
}

const domEventRegistry = new Map<string, DomEventDescriptor>([
  ['focus', { handlerProp: 'onFocus', reason: 'focus' }],
  ['blur', { handlerProp: 'onBlur', reason: 'external' }],
  ['click', { handlerProp: 'onClick', reason: 'pointer' }],
  ['dblclick', { handlerProp: 'onDoubleClick', reason: 'pointer' }],
  ['mousedown', { handlerProp: 'onMouseDown', reason: 'pointer' }],
  ['keydown', { handlerProp: 'onKeyDown', reason: 'keyboard' }],
  ['keyup', { handlerProp: 'onKeyUp', reason: 'keyboard' }],
  ['input', { handlerProp: 'onInput', reason: 'keyboard' }],
  ['change', { handlerProp: 'onChange', reason: 'external' }],
  ['pointerdown', { handlerProp: 'onPointerDown', reason: 'pointer' }],
  ['pointerup', { handlerProp: 'onPointerUp', reason: 'pointer' }],
  ['pointermove', { handlerProp: 'onPointerMove', reason: 'pointer' }],
  ['mouseenter', { handlerProp: 'onMouseEnter', reason: 'external' }],
  ['mouseleave', { handlerProp: 'onMouseLeave', reason: 'external' }],
])

export const defineDomEvent = (eventName: string, descriptor: DomEventDescriptor) =>
  void domEventRegistry.set(eventName, descriptor)

export function getDomEventDescriptor(eventName: string): DomEventDescriptor | undefined {
  return domEventRegistry.get(eventName)
}

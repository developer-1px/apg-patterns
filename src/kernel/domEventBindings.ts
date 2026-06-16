import type { PatternEvent, PatternEventReason, PartEventBinding } from '../schema'
import { evaluatePredicate, resolveEventTemplate, type PatternRuntimeContext } from './patternKernel'
import type { SlotProps } from './patternRuntime'

type DomEventDescriptor = {
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

export function resolvePartEventBindings(
  bindings: readonly PartEventBinding[],
  ctx: PatternRuntimeContext,
  emit: (event: PatternEvent) => void,
): SlotProps {
  const byEvent = new Map<string, PartEventBinding[]>()
  for (const binding of bindings) {
    const group = byEvent.get(binding.event)
    if (group) group.push(binding)
    else byEvent.set(binding.event, [binding])
  }
  const out: SlotProps = {}
  for (const [eventName, eventBindings] of byEvent) {
    const descriptor = domEventRegistry.get(eventName)
    if (!descriptor) throw new Error(`[apg-pattern] unknown domEvent token: "${eventName}" — register via defineDomEvent()`)
    out[descriptor.handlerProp] = () => {
      for (const binding of eventBindings) {
        if (binding.when && !evaluatePredicate(binding.when, ctx)) continue
        const active = ctx.activeKey ?? ctx.key
        if (!active) continue
        for (const event of binding.events.flatMap((t) => resolveEventTemplate(t, active, ctx.data, ctx.key, ctx))) {
          if (event.type === 'focus' && event.key === ctx.data.state?.activeKey) continue
          if (event.type === 'select' && event.keys.length === 1 && ctx.data.state?.selectedKeys?.length === 1 && ctx.data.state.selectedKeys[0] === event.keys[0]) continue
          emit(withDefaultReason(event, descriptor.reason ?? 'external'))
        }
      }
    }
  }
  return out
}

export function withDefaultReason(event: PatternEvent, reason: PatternEventReason): PatternEvent {
  if (event.meta?.reason) return event
  const next = { ...event } as PatternEvent
  Object.defineProperty(next, 'meta', {
    value: { ...event.meta, reason },
    enumerable: false,
    configurable: true,
  })
  return next
}

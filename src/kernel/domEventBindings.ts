import type { PatternEvent, PatternEventReason, PartEventBinding } from '../schema'
import { evaluatePredicate, resolveEventTemplate, type PatternRuntimeContext } from './patternKernel'
import type { SlotProps } from './patternRuntime'
import { defineDomEvent, defineDomEventHandlerProp, getDomEventDescriptor } from './domEventRegistry'

export { defineDomEvent, defineDomEventHandlerProp }

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
    const descriptor = getDomEventDescriptor(eventName)
    if (!descriptor) throw new Error(`[apg-pattern] unknown domEvent token: "${eventName}" — register via defineDomEvent()`)
    out[descriptor.handlerProp] = () => {
      for (const binding of eventBindings) {
        if (binding.when && !evaluatePredicate(binding.when, ctx)) continue
        const active = ctx.activeKey ?? ctx.key
        if (!active) continue
        for (const event of binding.events.flatMap((t) => resolveEventTemplate(t, active, ctx.data, ctx.key, ctx))) {
          if (isNoopDomEvent(event, ctx)) continue
          emit(withDefaultReason(event, descriptor.reason ?? 'external'))
        }
      }
    }
  }
  return out
}

function isNoopDomEvent(event: PatternEvent, ctx: PatternRuntimeContext): boolean {
  if (event.type === 'focus') return event.key === ctx.data.state?.activeKey
  if (event.type === 'select' && event.keys.length === 1) return ctx.data.state?.selectedKeys?.length === 1 && ctx.data.state.selectedKeys[0] === event.keys[0]
  return false
}

export function withDefaultReason(event: PatternEvent, reason: PatternEventReason): PatternEvent {
  if (event.meta?.reason) return event
  return withEventReason(event, reason)
}

function withEventReason(event: PatternEvent, reason: PatternEventReason): PatternEvent {
  const next = { ...event } as PatternEvent
  Object.defineProperty(next, 'meta', {
    value: { ...event.meta, reason },
    enumerable: false,
    configurable: true,
  })
  return next
}

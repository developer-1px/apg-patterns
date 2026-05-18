import type { PatternEvent } from '../../schema'

export function withNonEnumerableMeta(event: PatternEvent): PatternEvent {
  if (!event.meta) return event
  const next = { ...event } as PatternEvent
  Object.defineProperty(next, 'meta', {
    value: event.meta,
    enumerable: false,
    configurable: true,
  })
  return next
}

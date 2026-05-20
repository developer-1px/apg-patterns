import type { PatternEvent } from '../../../src/react'

export function formatEvent(event: PatternEvent): string {
  const fields = Object.entries(event)
    .filter(([key, value]) => key !== 'type' && key !== 'meta' && value !== undefined && value !== null)
    .map(([key, value]) => `${key}=${formatEventValue(value)}`)
  const reason = event.meta?.reason ? ` via ${event.meta.reason}` : ''
  return fields.length > 0 ? `${event.type} ${fields.join(' ')}${reason}` : `${event.type}${reason}`
}

function formatEventValue(value: unknown): string {
  if (Array.isArray(value)) return `[${value.join(',')}]`
  return String(value)
}

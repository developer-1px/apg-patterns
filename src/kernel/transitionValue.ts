import type { PatternData, PatternEvent, TransitionValue } from '../schema'

export function resolveTransitionValue(value: TransitionValue, event: PatternEvent, data: PatternData): unknown {
  if ('literal' in value) return value.literal
  if (value.from === '$activeKey') return data.state?.activeKey ?? null
  if (value.from === '$event.key') return 'key' in event ? event.key : null
  if (value.from === '$event.keys') return 'keys' in event ? event.keys : []
  if (value.from === '$event.anchorKey') return 'anchorKey' in event ? event.anchorKey : null
  if (value.from === '$event.extentKey') return 'extentKey' in event ? event.extentKey : null
  if (value.from === '$event.expanded') return 'expanded' in event ? event.expanded : null
  if (value.from === '$event.checked') return 'checked' in event ? event.checked : null
  if (value.from === '$event.pressed') return 'pressed' in event ? event.pressed : null
  if (value.from === '$event.value') return 'value' in event ? event.value : null
  return null
}

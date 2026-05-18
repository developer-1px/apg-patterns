import type { PatternData, PatternEvent } from '../schema'

export function reduceExpandEvent(data: PatternData, event: Extract<PatternEvent, { type: 'expand' }>): PatternData {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  if (event.expanded) expanded.add(event.key)
  else expanded.delete(event.key)
  const nextActive = data.state?.activeKey ?? event.key
  return { ...data, state: { ...data.state, activeKey: nextActive, expandedKeys: [...expanded] } }
}

export function reduceExpandActiveRowEvent(data: PatternData, event: Extract<PatternEvent, { type: 'expandActiveRow' }>): PatternData {
  const activeKey = data.state?.activeKey
  const rowKey = activeKey ? data.relations?.cells?.find((cell) => cell.cellKey === activeKey)?.rowKey : undefined
  if (!rowKey) return data

  const expanded = new Set(data.state?.expandedKeys ?? [])
  if (event.expanded) expanded.add(rowKey)
  else expanded.delete(rowKey)
  return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
}

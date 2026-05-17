import type { PatternData, PatternEvent } from '../../src'
import { reducePatternData } from '../../src'
import { alertDefinition } from '../../src/patterns/alert/definition'

// Single-alert demo: one alert key, one dismiss-button key.
// Visibility is encoded in state.expandedKeys (true iff 'alert' ∈ expandedKeys).
export const initialAlertData: PatternData = {
  items: {
    alert: { label: 'Status alert' },
    dismiss: { label: 'Dismiss alert' },
  },
  relations: {
    rootKeys: ['alert'],
    controlsByKey: { dismiss: ['alert'] },
  },
  state: {
    activeKey: 'alert',
    expandedKeys: [],
  },
}

export const initialAlertMessage = ''

// Custom event: 'spawn' (a non-pattern domain event) carries the message text.
// Pattern reducer handles expand; alertData reducer additionally tracks message text.
export type AlertSpawnEvent = { type: 'spawn'; key: string; message: string }
export type AlertDomainEvent = PatternEvent | AlertSpawnEvent

export interface AlertReducerState {
  data: PatternData
  message: string
}

export function reduceAlertState(state: AlertReducerState, event: AlertDomainEvent): AlertReducerState {
  if (event.type === 'spawn') {
    const expanded = new Set(state.data.state?.expandedKeys ?? [])
    expanded.add(event.key)
    return {
      data: {
        ...state.data,
        state: { ...state.data.state, activeKey: event.key, expandedKeys: [...expanded] },
      },
      message: event.message,
    }
  }
  if (event.type === 'dismiss') {
    const targetKey = event.key ?? state.data.state?.activeKey
    if (!targetKey) return state
    const expanded = (state.data.state?.expandedKeys ?? []).filter((k) => k !== targetKey)
    return {
      ...state,
      data: { ...state.data, state: { ...state.data.state, expandedKeys: expanded } },
    }
  }
  return { ...state, data: reducePatternData(alertDefinition, state.data, event) }
}

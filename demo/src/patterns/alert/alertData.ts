import type { PatternData, PatternEvent } from '../../../../src/react'
import { reducePatternData } from '../../../../src/react'
import { alertDefinition } from '../../../../src/patterns/alert/definition'

export const initialAlertData: PatternData = {
  items: {
    alert: { label: 'Status alert', message: '' },
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

type AlertSpawnEvent = { type: 'spawn'; key: string; message: string }
export type AlertDomainEvent = PatternEvent | AlertSpawnEvent

export interface AlertReducerState {
  data: PatternData
}

export function reduceAlertState(state: AlertReducerState, event: AlertDomainEvent): AlertReducerState {
  if (event.type === 'spawn') {
    const expanded = new Set(state.data.state?.expandedKeys ?? [])
    expanded.add(event.key)
    return {
      data: {
        ...state.data,
        items: {
          ...state.data.items,
          [event.key]: { ...state.data.items[event.key], message: event.message },
        },
        state: { ...state.data.state, activeKey: event.key, expandedKeys: [...expanded] },
      },
    }
  }
  if (event.type === 'dismiss') {
    const targetKey = event.key ?? state.data.state?.activeKey
    if (!targetKey) return state
    const expanded = (state.data.state?.expandedKeys ?? []).filter((k) => k !== targetKey)
    return { data: { ...state.data, state: { ...state.data.state, expandedKeys: expanded } } }
  }
  return { data: reducePatternData(alertDefinition, state.data, event) }
}

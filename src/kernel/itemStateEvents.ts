import type { PatternData, PatternEvent } from '../schema'

export function reduceCheckEvent(data: PatternData, event: Extract<PatternEvent, { type: 'check' }>): PatternData {
  return { ...data, state: { ...data.state, checkedByKey: { ...data.state?.checkedByKey, [event.key]: event.checked } } }
}

export function reducePressEvent(data: PatternData, event: Extract<PatternEvent, { type: 'press' }>): PatternData {
  return { ...data, state: { ...data.state, pressedByKey: { ...data.state?.pressedByKey, [event.key]: event.pressed ?? true } } }
}

export function reduceValueEvent(data: PatternData, event: Extract<PatternEvent, { type: 'value' }>): PatternData {
  return { ...data, state: { ...data.state, valueByKey: { ...data.state?.valueByKey, [event.key]: event.value } } }
}

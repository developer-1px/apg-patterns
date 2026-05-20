import type { PatternData, PatternEvent, PatternDefinition } from '../schema'
import { reduceDeclarativeTransitions } from './patternTransitions'
import { reduceExpandActiveRowEvent, reduceExpandEvent } from './expansionEvents'
import { reduceCheckEvent, reducePressEvent, reduceValueEvent } from './itemStateEvents'
import { reduceFocusEvent, reduceNavigateEvent } from './navigationEvents'
import { reduceExtendSelectionEvent, reduceSelectAllEvent, reduceSelectColumnEvent, reduceSelectRowEvent, withSelection } from './selectionEvents'

export function reducePatternData(definition: PatternDefinition, data: PatternData, event: PatternEvent): PatternData {
  const declarative = reduceDeclarativeTransitions(definition, data, event)
  if (declarative) return withLastEventReason(declarative, event)

  if (event.type === 'focus') return withLastEventReason(reduceFocusEvent(data, event), event)

  if (event.type === 'navigate') {
    return withLastEventReason(reduceNavigateEvent(definition, data, event), event)
  }

  if (event.type === 'select') {
    return withLastEventReason({
      ...data,
      state: {
        ...data.state,
        activeKey: event.extentKey ?? event.anchorKey ?? event.keys[0] ?? data.state?.activeKey,
        selectedKeys: [...event.keys],
        anchorKey: event.anchorKey,
        extentKey: event.extentKey,
      },
    }, event)
  }

  if (event.type === 'selectAll') {
    return withLastEventReason(reduceSelectAllEvent(definition, data), event)
  }

  if (event.type === 'selectColumn') {
    return withLastEventReason(reduceSelectColumnEvent(definition, data), event)
  }

  if (event.type === 'selectRow') {
    return withLastEventReason(reduceSelectRowEvent(definition, data), event)
  }

  if (event.type === 'extendSelection') {
    return withLastEventReason(reduceExtendSelectionEvent(definition, data, event), event)
  }

  if (event.type === 'expand') {
    return withLastEventReason(reduceExpandEvent(data, event), event)
  }

  if (event.type === 'expandActiveRow') {
    return withLastEventReason(reduceExpandActiveRowEvent(data, event), event)
  }

  if (event.type === 'check') {
    return withLastEventReason(reduceCheckEvent(data, event), event)
  }

  if (event.type === 'press') {
    return withLastEventReason(reducePressEvent(data, event), event)
  }

  if (event.type === 'value') {
    return withLastEventReason(reduceValueEvent(data, event), event)
  }

  // 'activate'/'typeahead'/'dismiss'/'extension' are outbound-only signals.
  return withLastEventReason(data, event)
}

function withLastEventReason(data: PatternData, event: PatternEvent): PatternData {
  if (!event.meta?.reason) return data
  return { ...data, state: { ...data.state, lastEventReason: event.meta.reason } }
}

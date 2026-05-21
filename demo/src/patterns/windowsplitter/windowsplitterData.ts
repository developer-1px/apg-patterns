import { PatternDataSchema, type PatternData, type PatternEvent, type PatternItem, type PatternOptions, type PatternState } from '../../../../src/react'
import { valueStepDelta } from '../../shared/demoPatternTypes'

interface WindowSplitterDemoState extends PatternState {
  previousValueByKey?: Record<string, number>
}

type WindowSplitterDemoData = PatternData<PatternItem, WindowSplitterDemoState>

export const initialWindowSplitterData: PatternData = PatternDataSchema.parse({
  items: {
    splitter: { label: 'Resize panes' },
    primary: { label: 'Primary pane' },
  },
  relations: {
    rootKeys: ['splitter'],
    controlsByKey: { splitter: ['primary'] },
  },
  state: {
    activeKey: 'splitter',
    valueByKey: { splitter: 50 },
  },
})

export const windowSplitterOptions: PatternOptions = {
  focusStrategy: 'rovingTabIndex',
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
}

export function reduceWindowSplitterData(
  data: WindowSplitterDemoData,
  event: PatternEvent,
  options: PatternOptions = windowSplitterOptions,
): WindowSplitterDemoData {
  if (event.type === 'focus' && event.key) {
    return { ...data, state: { ...data.state, activeKey: event.key } }
  }
  if ((event.type !== 'collapse' && event.type !== 'valueStep') || !event.key) return data
  const key = event.key
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)
  const large = Math.max(step, Math.round((max - min) / 10))
  const current = Number(data.state?.valueByKey?.[key] ?? min)
  const previousValueByKey = { ...(data.state?.previousValueByKey ?? {}) }

  if (event.type === 'collapse') {
    let next: number
    if (current === min) {
      next = previousValueByKey[key] ?? Math.round((min + max) / 2)
      delete previousValueByKey[key]
    } else {
      previousValueByKey[key] = current
      next = min
    }
    return {
      ...data,
      state: {
        ...data.state,
        activeKey: key,
        valueByKey: { ...data.state?.valueByKey, [key]: next },
        previousValueByKey,
      },
    }
  }

  let nextValue: number
  if (event.direction === 'min') nextValue = min
  else if (event.direction === 'max') nextValue = max
  else nextValue = current + valueStepDelta(event.direction, step, large)
  const clamped = Math.min(max, Math.max(min, nextValue))
  if (clamped === current) return { ...data, state: { ...data.state, activeKey: key } }
  return {
    ...data,
    state: {
      ...data.state,
      activeKey: key,
      valueByKey: { ...data.state?.valueByKey, [key]: clamped },
    },
  }
}

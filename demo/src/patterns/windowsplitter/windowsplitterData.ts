import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src'

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
    options: {
      focusStrategy: 'rovingTabIndex',
      min: 0,
      max: 100,
      step: 1,
      orientation: 'horizontal',
    },
  },
})

export const windowSplitterOptions: PatternOptions = {
  focusStrategy: 'rovingTabIndex',
  min: 0,
  max: 100,
  step: 1,
  orientation: 'horizontal',
}

const computeDelta = (direction: unknown, step: number): number => {
  if (direction === 'increment') return step
  if (direction === 'decrement') return -step
  return 0
}

export function reduceWindowSplitterData(
  data: PatternData,
  event: PatternEvent,
  options: PatternOptions = windowSplitterOptions,
): PatternData {
  if (event.type === 'focus' && event.key) {
    return { ...data, state: { ...data.state, activeKey: event.key } }
  }
  if ((event.type !== 'collapse' && event.type !== 'valueStep') || !event.key) return data
  const key = event.key
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)
  const current = Number(data.state?.valueByKey?.[key] ?? min)
  const prev = data.state as { previousValueByKey?: Record<string, number> } | undefined
  const previousValueByKey = { ...(prev?.previousValueByKey ?? {}) }

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
  else nextValue = current + computeDelta(event.direction, step)
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

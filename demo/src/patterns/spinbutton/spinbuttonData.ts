import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternItem, type PatternOptions, type PatternState } from '../../../../src'

interface SpinbuttonDemoItem extends PatternItem {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}

interface SpinbuttonDemoState extends PatternState {
  options?: PatternOptions
}

type SpinbuttonDemoData = PatternData<SpinbuttonDemoItem, SpinbuttonDemoState>

export type SpinbuttonVariantKey = 'numeric' | 'time'

const pad2 = (n: number) => n.toString().padStart(2, '0')

const timeValuetext = (key: Key, value: number): string => {
  if (key === 'hours') return `${value} hour${value === 1 ? '' : 's'}`
  if (key === 'minutes') return `${value} minute${value === 1 ? '' : 's'}`
  return String(value)
}

const numericData = (): SpinbuttonDemoData =>
  PatternDataSchema.parse({
    items: { count: { label: 'Quantity' } },
    relations: { rootKeys: ['count'] },
    state: { activeKey: 'count', valueByKey: { count: 5 } },
  })

const timeData = (): SpinbuttonDemoData =>
  PatternDataSchema.parse({
    items: {
      hours: { label: 'Hours', valuemin: 0, valuemax: 23, valuetext: timeValuetext('hours', 9) },
      minutes: { label: 'Minutes', valuemin: 0, valuemax: 59, valuetext: timeValuetext('minutes', 30) },
    },
    relations: { rootKeys: ['hours', 'minutes'] },
    state: { activeKey: 'hours', valueByKey: { hours: 9, minutes: 30 } },
  })

export interface SpinbuttonVariant {
  key: SpinbuttonVariantKey
  label: string
  data: SpinbuttonDemoData
  options: PatternOptions
}

const withOptions = (data: SpinbuttonDemoData, options: PatternOptions): SpinbuttonDemoData => ({
  ...data,
  state: { ...data.state, options },
})

export const spinbuttonVariants: Record<SpinbuttonVariantKey, SpinbuttonVariant> = {
  numeric: {
    key: 'numeric',
    label: 'Numeric',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 100, step: 1 },
    data: withOptions(numericData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 100, step: 1 }),
  },
  time: {
    key: 'time',
    label: 'Time Picker',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 59, step: 1 },
    data: withOptions(timeData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 59, step: 1 }),
  },
}

export const initialSpinbuttonData = spinbuttonVariants.numeric.data
export const spinbuttonOptions: PatternOptions = spinbuttonVariants.numeric.options

const computeDelta = (direction: unknown, step: number, large: number): number => {
  if (direction === 'increment') return step
  if (direction === 'decrement') return -step
  if (direction === 'incrementLarge') return large
  if (direction === 'decrementLarge') return -large
  return 0
}

const itemRange = (data: SpinbuttonDemoData, key: Key, fallbackMin: number, fallbackMax: number): [number, number] => {
  const item = data.items[key]
  return [item?.valuemin ?? fallbackMin, item?.valuemax ?? fallbackMax]
}

export function reduceSpinbuttonData(
  data: SpinbuttonDemoData,
  event: PatternEvent,
  options: PatternOptions = spinbuttonOptions,
): SpinbuttonDemoData {
  if (event.type === 'focus' && event.key) {
    return { ...data, state: { ...data.state, activeKey: event.key } }
  }
  if ((event.type !== 'valueStep' && event.type !== 'value') || !event.key) return data
  const key = event.key
  const defaultMin = Number(options.min ?? 0)
  const defaultMax = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)
  const large = Math.max(step, Math.round((defaultMax - defaultMin) / 10))
  const [min, max] = itemRange(data, key, defaultMin, defaultMax)
  const current = Number(data.state?.valueByKey?.[key] ?? min)

  let nextValue: number
  if (event.type === 'value') nextValue = typeof event.value === 'number' ? event.value : current
  else if (event.direction === 'min') nextValue = min
  else if (event.direction === 'max') nextValue = max
  else nextValue = current + computeDelta(event.direction, step, large)

  const clamped = Math.min(max, Math.max(min, Math.round(nextValue / step) * step))
  if (clamped === current) return { ...data, state: { ...data.state, activeKey: key } }

  const valueByKey = { ...data.state?.valueByKey, [key]: clamped }
  let items = data.items
  const item = items[key]
  if (item?.valuetext !== undefined) {
    items = { ...items, [key]: { ...items[key], valuetext: timeValuetext(key, clamped) } }
  }

  return {
    ...data,
    items,
    state: { ...data.state, activeKey: key, valueByKey },
  }
}

export const formatTime = (h: number, m: number) => `${pad2(h)}:${pad2(m)}`

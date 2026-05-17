import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

export type SpinbuttonVariantKey = 'numeric' | 'time'

const pad2 = (n: number) => n.toString().padStart(2, '0')

const timeValuetext = (key: Key, value: number): string => {
  if (key === 'hours') return `${value} hour${value === 1 ? '' : 's'}`
  if (key === 'minutes') return `${value} minute${value === 1 ? '' : 's'}`
  return String(value)
}

const numericData = (): PatternData =>
  PatternDataSchema.parse({
    items: { count: { label: 'Quantity' } },
    relations: { rootKeys: ['count'] },
    state: { activeKey: 'count', valueByKey: { count: 5 } },
  })

const timeData = (): PatternData =>
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
  data: PatternData
  options: PatternOptions
}

const withOptions = (data: PatternData, options: PatternOptions): PatternData => ({
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

const itemRange = (data: PatternData, key: Key, fallbackMin: number, fallbackMax: number): [number, number] => {
  const item = data.items[key] as { valuemin?: number; valuemax?: number } | undefined
  return [item?.valuemin ?? fallbackMin, item?.valuemax ?? fallbackMax]
}

export function reduceSpinbuttonData(
  data: PatternData,
  event: PatternEvent,
  options: PatternOptions = spinbuttonOptions,
): PatternData {
  if (event.type === 'focus' && event.key) {
    return { ...data, state: { ...data.state, activeKey: event.key } }
  }
  if (event.type !== 'extension' || event.name !== 'value-change' || !event.key) return data
  const payload = (event.payload ?? {}) as { direction?: unknown; value?: unknown }
  const key = event.key as Key
  const defaultMin = Number(options.min ?? 0)
  const defaultMax = Number(options.max ?? 100)
  const step = Number(options.step ?? 1)
  const large = Math.max(step, Math.round((defaultMax - defaultMin) / 10))
  const [min, max] = itemRange(data, key, defaultMin, defaultMax)
  const current = Number(data.state?.valueByKey?.[key] ?? min)

  let nextValue: number
  if (payload.direction === 'min') nextValue = min
  else if (payload.direction === 'max') nextValue = max
  else if (typeof payload.value === 'number') nextValue = payload.value
  else nextValue = current + computeDelta(payload.direction, step, large)

  const clamped = Math.min(max, Math.max(min, Math.round(nextValue / step) * step))
  if (clamped === current) return { ...data, state: { ...data.state, activeKey: key } }

  const valueByKey = { ...data.state?.valueByKey, [key]: clamped }
  let items = data.items
  const item = items[key] as { valuetext?: string } | undefined
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

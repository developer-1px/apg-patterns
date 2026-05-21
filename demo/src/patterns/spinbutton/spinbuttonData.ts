import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternItem, type PatternOptions } from '../../../../src/react'
import { valueStepDelta, variantItemsFrom } from '../../shared/demoPatternTypes'

interface SpinbuttonDemoItem extends PatternItem {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}

type SpinbuttonDemoData = PatternData<SpinbuttonDemoItem>

export type SpinbuttonVariantKey = 'numeric' | 'time'

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

interface SpinbuttonVariant {
  label: string
  data: SpinbuttonDemoData
  options: PatternOptions
}

export const spinbuttonVariants: Record<SpinbuttonVariantKey, SpinbuttonVariant> = {
  numeric: {
    label: 'Numeric',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 100, step: 1 },
    data: numericData(),
  },
  time: {
    label: 'Time',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 59, step: 1 },
    data: timeData(),
  },
}

export const spinbuttonVariantItems = variantItemsFrom(spinbuttonVariants)

export function reduceSpinbuttonData(
  data: SpinbuttonDemoData,
  event: PatternEvent,
  options: PatternOptions = spinbuttonVariants.numeric.options,
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
  const item = data.items[key]
  const min = item?.valuemin ?? defaultMin
  const max = item?.valuemax ?? defaultMax
  const current = Number(data.state?.valueByKey?.[key] ?? min)

  let nextValue: number
  if (event.type === 'value') nextValue = typeof event.value === 'number' ? event.value : current
  else if (event.direction === 'min') nextValue = min
  else if (event.direction === 'max') nextValue = max
  else nextValue = current + valueStepDelta(event.direction, step, large)

  const clamped = Math.min(max, Math.max(min, Math.round(nextValue / step) * step))
  if (clamped === current) return { ...data, state: { ...data.state, activeKey: key } }

  const valueByKey = { ...data.state?.valueByKey, [key]: clamped }
  let items = data.items
  if (item?.valuetext !== undefined) {
    items = { ...items, [key]: { ...items[key], valuetext: timeValuetext(key, clamped) } }
  }

  return {
    ...data,
    items,
    state: { ...data.state, activeKey: key, valueByKey },
  }
}

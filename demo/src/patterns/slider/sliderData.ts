import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternItem, type PatternOptions } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type SliderVariantKey = 'color' | 'temperature' | 'rating' | 'seek' | 'range'

interface SliderDemoItem extends PatternItem {
  valuemin?: number
  valuemax?: number
  valuetext?: string
}

type SliderDemoData = PatternData<SliderDemoItem>

const parseSliderData = (data: unknown): SliderDemoData => PatternDataSchema.parse(data) as SliderDemoData

const formatTime = (seconds: number) => {
  const total = Math.max(0, Math.round(seconds))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const ratingLabels = [
  'No rating', 'Strongly disagree', 'Disagree', 'Slightly disagree',
  'Neutral, leaning negative', 'Neutral', 'Neutral, leaning positive',
  'Slightly agree', 'Agree', 'Strongly agree',
]

const ratingLabel = (n: number) => ratingLabels[Math.max(0, Math.min(ratingLabels.length - 1, Math.round(n)))]

const tempLabel = (n: number) => `${n} degrees Celsius`

const colorData = (): SliderDemoData =>
  parseSliderData({
    items: {
      red: { label: 'Red color value' },
      green: { label: 'Green color value' },
      blue: { label: 'Blue color value' },
    },
    relations: { rootKeys: ['red', 'green', 'blue'] },
    state: {
      activeKey: 'red',
      valueByKey: { red: 128, green: 200, blue: 64 },
    },
  })

const temperatureData = (): SliderDemoData =>
  parseSliderData({
    items: { temp: { label: 'Thermostat', valuetext: tempLabel(21) } },
    relations: { rootKeys: ['temp'] },
    state: { activeKey: 'temp', valueByKey: { temp: 21 } },
  })

const ratingData = (): SliderDemoData =>
  parseSliderData({
    items: { rating: { label: 'Rate your experience', valuetext: ratingLabel(5) } },
    relations: { rootKeys: ['rating'] },
    state: { activeKey: 'rating', valueByKey: { rating: 5 } },
  })

const seekData = (): SliderDemoData =>
  parseSliderData({
    items: { seek: { label: 'Playback position', valuetext: formatTime(45) } },
    relations: { rootKeys: ['seek'] },
    state: { activeKey: 'seek', valueByKey: { seek: 45 } },
  })

const rangeData = (): SliderDemoData =>
  parseSliderData({
    items: {
      min: { label: 'Minimum price', valuemin: 0, valuemax: 200 },
      max: { label: 'Maximum price', valuemin: 200, valuemax: 500 },
    },
    relations: { rootKeys: ['min', 'max'] },
    state: {
      activeKey: 'min',
      valueByKey: { min: 200, max: 400 },
    },
  })

interface SliderVariant {
  label: string
  data: SliderDemoData
  options: PatternOptions
}

export const sliderVariants: Record<SliderVariantKey, SliderVariant> = {
  color: {
    label: 'Color Viewer',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 255, step: 1, orientation: 'horizontal' },
    data: colorData(),
  },
  temperature: {
    label: 'Vertical Temperature',
    options: { focusStrategy: 'rovingTabIndex', min: 10, max: 38, step: 1, orientation: 'vertical' },
    data: temperatureData(),
  },
  rating: {
    label: 'Rating',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 9, step: 1, orientation: 'horizontal' },
    data: ratingData(),
  },
  seek: {
    label: 'Media Seek',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 300, step: 1, orientation: 'horizontal' },
    data: seekData(),
  },
  range: {
    label: 'Multi-Thumb (Range)',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 500, step: 10, orientation: 'horizontal' },
    data: rangeData(),
  },
}

export const sliderVariantItems = variantItemsFrom(sliderVariants)

const computeDelta = (direction: unknown, step: number, large: number): number => {
  if (direction === 'increment') return step
  if (direction === 'decrement') return -step
  if (direction === 'incrementLarge') return large
  if (direction === 'decrementLarge') return -large
  return 0
}

const itemRange = (data: SliderDemoData, key: Key, fallbackMin: number, fallbackMax: number): [number, number] => {
  const item = data.items[key]
  return [item?.valuemin ?? fallbackMin, item?.valuemax ?? fallbackMax]
}

const valuetextFor = (data: SliderDemoData, key: Key, next: number): string | undefined => {
  const item = data.items[key]
  if (!item?.valuetext) return undefined
  if (key === 'temp') return tempLabel(next)
  if (key === 'rating') return ratingLabel(next)
  if (key === 'seek') return formatTime(next)
  return item.valuetext
}

export function reduceSliderData(
  data: SliderDemoData,
  event: PatternEvent,
  options: PatternOptions,
): SliderDemoData {
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
  if (key === 'min' && items.max && typeof items.max.valuemin === 'number') {
    items = { ...items, max: { ...items.max, valuemin: clamped } }
  } else if (key === 'max' && items.min && typeof items.min.valuemax === 'number') {
    items = { ...items, min: { ...items.min, valuemax: clamped } }
  }

  const text = valuetextFor(data, key, clamped)
  if (text !== undefined) {
    items = { ...items, [key]: { ...items[key], valuetext: text } }
  }

  return {
    ...data,
    items,
    state: { ...data.state, activeKey: key, valueByKey },
  }
}

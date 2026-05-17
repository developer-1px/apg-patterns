import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

// ── Variant definitions ─────────────────────────────────────────────
//
// Each variant maps 1:1 to a W3C APG slider example:
//   - color:       Color Viewer Slider (3 horizontal R/G/B)
//   - temperature: Vertical Temperature Slider (aria-valuetext + aria-orientation=vertical)
//   - rating:      Rating Slider (10-point scale, aria-valuetext)
//   - seek:        Media Seek Slider (time → mm:ss valuetext)
//   - range:       Multi-Thumb Slider (two thumbs with mutual valuemin/max constraints)

export type SliderVariantKey = 'color' | 'temperature' | 'rating' | 'seek' | 'range'

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

// ── Color (3 thumbs, independent) ────────────────────────────────
const colorData = (): PatternData =>
  PatternDataSchema.parse({
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

// ── Temperature (vertical, single thumb, valuetext) ──────────────
const temperatureData = (): PatternData =>
  PatternDataSchema.parse({
    items: { temp: { label: 'Thermostat', valuetext: tempLabel(21) } },
    relations: { rootKeys: ['temp'] },
    state: { activeKey: 'temp', valueByKey: { temp: 21 } },
  })

// ── Rating (single thumb, valuetext from label table) ────────────
const ratingData = (): PatternData =>
  PatternDataSchema.parse({
    items: { rating: { label: 'Rate your experience', valuetext: ratingLabel(5) } },
    relations: { rootKeys: ['rating'] },
    state: { activeKey: 'rating', valueByKey: { rating: 5 } },
  })

// ── Seek (media position with mm:ss valuetext) ───────────────────
const seekData = (): PatternData =>
  PatternDataSchema.parse({
    items: { seek: { label: 'Playback position', valuetext: formatTime(45) } },
    relations: { rootKeys: ['seek'] },
    state: { activeKey: 'seek', valueByKey: { seek: 45 } },
  })

// ── Range (two thumbs with mutual constraint) ────────────────────
const rangeData = (): PatternData =>
  PatternDataSchema.parse({
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

export interface SliderVariant {
  key: SliderVariantKey
  label: string
  data: PatternData
  options: PatternOptions
}

const withOptions = (data: PatternData, options: PatternOptions): PatternData => ({
  ...data,
  state: { ...data.state, options },
})

export const sliderVariants: Record<SliderVariantKey, SliderVariant> = {
  color: {
    key: 'color',
    label: 'Color Viewer',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 255, step: 1, orientation: 'horizontal' },
    data: withOptions(colorData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 255, step: 1, orientation: 'horizontal' }),
  },
  temperature: {
    key: 'temperature',
    label: 'Vertical Temperature',
    options: { focusStrategy: 'rovingTabIndex', min: 10, max: 38, step: 1, orientation: 'vertical' },
    data: withOptions(temperatureData(), { focusStrategy: 'rovingTabIndex', min: 10, max: 38, step: 1, orientation: 'vertical' }),
  },
  rating: {
    key: 'rating',
    label: 'Rating',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 9, step: 1, orientation: 'horizontal' },
    data: withOptions(ratingData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 9, step: 1, orientation: 'horizontal' }),
  },
  seek: {
    key: 'seek',
    label: 'Media Seek',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 300, step: 1, orientation: 'horizontal' },
    data: withOptions(seekData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 300, step: 1, orientation: 'horizontal' }),
  },
  range: {
    key: 'range',
    label: 'Multi-Thumb (Range)',
    options: { focusStrategy: 'rovingTabIndex', min: 0, max: 500, step: 10, orientation: 'horizontal' },
    data: withOptions(rangeData(), { focusStrategy: 'rovingTabIndex', min: 0, max: 500, step: 10, orientation: 'horizontal' }),
  },
}

export const sliderVariantItems = Object.values(sliderVariants).map((v) => ({ key: v.key, label: v.label }))

// Back-compat exports — test suite uses these (single-thumb volume slider).
export const initialSliderData = PatternDataSchema.parse({
  items: { volume: { label: 'Volume' } },
  relations: { rootKeys: ['volume'] },
  state: { activeKey: 'volume', valueByKey: { volume: 50 }, options: { focusStrategy: 'rovingTabIndex', min: 0, max: 100, step: 5, orientation: 'horizontal' } },
})
export const sliderOptions: PatternOptions = {
  focusStrategy: 'rovingTabIndex',
  min: 0,
  max: 100,
  step: 5,
  orientation: 'horizontal',
}

// ── Reducer ──────────────────────────────────────────────────────
//
// Direction tokens emitted by the kernel keyboard bindings:
//   increment / decrement       — ±1 step
//   incrementLarge / decrementLarge — ±10% of range (PageUp/Down or Shift+Arrow)
//   min / max                   — Home / End
// Plus pointer-driven { value } payloads.

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

const valuetextFor = (data: PatternData, key: Key, next: number): string | undefined => {
  // Heuristic: if item already had a valuetext, refresh it using its shape.
  const item = data.items[key] as { valuetext?: string } | undefined
  if (!item?.valuetext) return undefined
  if (key === 'temp') return tempLabel(next)
  if (key === 'rating') return ratingLabel(next)
  if (key === 'seek') return formatTime(next)
  return item.valuetext
}

export function reduceSliderData(
  data: PatternData,
  event: PatternEvent,
  options: PatternOptions = sliderOptions,
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

  // Multi-thumb constraint propagation: 'min' thumb's max == 'max' thumb's current; vice versa.
  const valueByKey = { ...data.state?.valueByKey, [key]: clamped }
  let items = data.items
  if (key === 'min' && items.max && typeof (items.max as { valuemin?: number }).valuemin === 'number') {
    items = { ...items, max: { ...items.max, valuemin: clamped } }
  } else if (key === 'max' && items.min && typeof (items.min as { valuemax?: number }).valuemax === 'number') {
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

import { PatternDataSchema, type Key, type PatternData, type PatternEvent, type PatternOptions } from '../../src'

export const initialSliderData = PatternDataSchema.parse({
  items: {
    volume: { label: 'Volume' },
  },
  relations: {
    rootKeys: ['volume'],
    childrenByKey: { volume: [] },
  },
  state: {
    activeKey: 'volume',
    valueByKey: { volume: 50 },
  },
})

export const sliderOptions = {
  focusStrategy: 'rovingTabIndex',
  min: 0,
  max: 100,
  step: 5,
} satisfies PatternOptions

export function reduceSliderData(data: PatternData, event: PatternEvent, options: PatternOptions = sliderOptions): PatternData {
  if (event.type !== 'extension' || event.name !== 'value-change' || !event.key) return data
  const direction = (event.payload as { direction?: unknown } | undefined)?.direction
  const value = (event.payload as { value?: unknown } | undefined)?.value
  const delta = direction === 'increment' ? Number(options.step ?? 1) : direction === 'decrement' ? -Number(options.step ?? 1) : 0
  const key = event.key as Key
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const current = Number(data.state?.valueByKey?.[key] ?? min)
  const nextValue = typeof value === 'number' ? value : current + delta
  if (nextValue === current) return data
  const next = Math.min(max, Math.max(min, nextValue))
  return {
    ...data,
    state: {
      ...data.state,
      valueByKey: {
        ...data.state?.valueByKey,
        [key]: next,
      },
    },
  }
}

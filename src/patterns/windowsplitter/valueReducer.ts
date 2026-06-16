import type {
  Key,
  PatternData,
  PatternEvent,
  PatternItem,
  PatternOptions,
  PatternState,
  PatternValueStepDirection,
} from '../../schema'

export interface WindowSplitterValueOptions {
  readonly defaultValue?: number
  readonly largeStep?: number
  readonly max?: number
  readonly min?: number
  readonly step?: number
}

export interface WindowSplitterValueRange {
  readonly largeStep: number
  readonly max: number
  readonly min: number
  readonly step: number
}

export interface WindowSplitterValueState extends PatternState {
  previousValueByKey?: Record<Key, number>
}

export type WindowSplitterValueData<
  TItem extends PatternItem = PatternItem,
> = PatternData<TItem, WindowSplitterValueState>

export function resolveWindowSplitterValueRange(
  options: WindowSplitterValueOptions | PatternOptions = {},
): WindowSplitterValueRange {
  const min = numberOption(options.min, 0)
  const rawMax = numberOption(options.max, 100)
  const max = rawMax === Infinity ? Infinity : Math.max(min, rawMax)
  const step = positiveFiniteOption(options.step, 1)
  const defaultLargeStep = Number.isFinite(max)
    ? Math.max(step, Math.round((max - min) / 10))
    : step * 10
  const largeStep = Math.max(
    step,
    positiveFiniteOption(options.largeStep, defaultLargeStep),
  )

  return { largeStep, max, min, step }
}

export function resolveWindowSplitterStepValue(
  currentValue: number,
  direction: PatternValueStepDirection,
  options: WindowSplitterValueOptions | PatternOptions = {},
): number {
  const range = resolveWindowSplitterValueRange(options)
  const current = clampWindowSplitterValue(
    numberOption(currentValue, range.min),
    range,
  )

  if (direction === 'min') return range.min
  if (direction === 'max') {
    return Number.isFinite(range.max) ? range.max : current
  }

  return clampWindowSplitterValue(
    current + windowSplitterStepDelta(direction, range),
    range,
  )
}

export function reduceWindowSplitterValue<TData extends WindowSplitterValueData>(
  data: TData,
  event: PatternEvent,
  options: WindowSplitterValueOptions | PatternOptions = {},
): TData {
  if (event.type === 'focus') {
    return withWindowSplitterState(data, { activeKey: event.key })
  }

  if (event.type !== 'collapse' && event.type !== 'valueStep') return data

  const range = resolveWindowSplitterValueRange(options)
  const key = event.key
  const current = currentWindowSplitterValue(data, key, range)
  const previousValueByKey = numericRecord(data.state?.previousValueByKey)

  if (event.type === 'collapse') {
    if (current === range.min) {
      const restored = previousValueByKey[key] ??
        fallbackWindowSplitterRestoreValue(range, options)
      delete previousValueByKey[key]
      return withWindowSplitterValue(
        data,
        key,
        clampWindowSplitterValue(restored, range),
        previousValueByKey,
      )
    }

    return withWindowSplitterValue(
      data,
      key,
      range.min,
      { ...previousValueByKey, [key]: current },
    )
  }

  return withWindowSplitterValue(
    data,
    key,
    resolveWindowSplitterStepValue(current, event.direction, options),
    previousValueByKey,
  )
}

export function clampWindowSplitterValue(
  value: number,
  range: WindowSplitterValueRange,
): number {
  const lower = Math.max(range.min, value)
  return Number.isFinite(range.max) ? Math.min(range.max, lower) : lower
}

function windowSplitterStepDelta(
  direction: PatternValueStepDirection,
  range: WindowSplitterValueRange,
): number {
  if (direction === 'increment') return range.step
  if (direction === 'decrement') return -range.step
  if (direction === 'incrementLarge') return range.largeStep
  if (direction === 'decrementLarge') return -range.largeStep
  return 0
}

function currentWindowSplitterValue(
  data: WindowSplitterValueData,
  key: Key,
  range: WindowSplitterValueRange,
): number {
  return clampWindowSplitterValue(
    numberOption(data.state?.valueByKey?.[key], range.min),
    range,
  )
}

function fallbackWindowSplitterRestoreValue(
  range: WindowSplitterValueRange,
  options: WindowSplitterValueOptions | PatternOptions,
): number {
  const defaultValue = options.defaultValue
  if (typeof defaultValue === 'number' && Number.isFinite(defaultValue)) return defaultValue
  if (Number.isFinite(range.max)) return Math.round((range.min + range.max) / 2)
  return range.min + range.largeStep
}

function withWindowSplitterValue<TData extends WindowSplitterValueData>(
  data: TData,
  key: Key,
  value: number,
  previousValueByKey: Record<Key, number>,
): TData {
  const nextPrevious = Object.keys(previousValueByKey).length > 0
    ? { previousValueByKey }
    : {}

  return withWindowSplitterState(data, {
    activeKey: key,
    valueByKey: { ...data.state?.valueByKey, [key]: value },
    ...nextPrevious,
  })
}

function withWindowSplitterState<TData extends WindowSplitterValueData>(
  data: TData,
  state: WindowSplitterValueState,
): TData {
  return {
    ...data,
    state: {
      ...data.state,
      ...state,
    },
  }
}

function numericRecord(value: unknown): Record<Key, number> {
  if (!value || typeof value !== 'object') return {}
  return Object.fromEntries(
    Object.entries(value)
      .filter((entry): entry is [Key, number] => typeof entry[1] === 'number'),
  )
}

function numberOption(value: unknown, fallback: number): number {
  return typeof value === 'number' && !Number.isNaN(value) ? value : fallback
}

function positiveFiniteOption(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? value
    : fallback
}

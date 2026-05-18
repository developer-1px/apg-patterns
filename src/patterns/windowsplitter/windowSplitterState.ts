import type { Key, PatternDataWithOptions, PatternOptions } from '../../schema'

export interface ReactWindowSplitterState {
  value: number
  min: number
  max: number
  position: number
}

export function getWindowSplitterState({
  data,
  key,
  options,
}: {
  data: PatternDataWithOptions
  key: Key | null
  options: PatternOptions
}): ReactWindowSplitterState {
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const value = key ? Number(data.state?.valueByKey?.[key] ?? min) : min
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100
  return { value, min, max, position }
}

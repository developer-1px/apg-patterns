import { PatternDataSchema, reduceWindowSplitterValue, type PatternData, type PatternEvent, type PatternOptions, type WindowSplitterValueData } from '../../../../src/react'

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
  data: WindowSplitterValueData,
  event: PatternEvent,
  options: PatternOptions = windowSplitterOptions,
): WindowSplitterValueData {
  return reduceWindowSplitterValue(data, event, options)
}

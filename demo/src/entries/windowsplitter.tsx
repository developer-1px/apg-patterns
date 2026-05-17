import { useState } from 'react'
import { WindowSplitter } from '../WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from '../windowsplitterData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'windowsplitter',
  label: 'Window Splitter',
  order: 27,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialWindowSplitterData)
    return {
      key: 'windowsplitter',
      label: 'Window Splitter',
      keyboardShortcuts: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'],
      sourceNames: ['WindowSplitter.tsx', 'windowsplitterData.ts', 'windowsplitter/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      preview: <WindowSplitter data={data} options={windowSplitterOptions} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceWindowSplitterData(current, event, windowSplitterOptions))
      }} />,
      reset: () => setData(initialWindowSplitterData),
    }
  },
}

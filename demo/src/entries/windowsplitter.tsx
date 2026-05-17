import { usePatternDataHost } from '../demoHostState'
import { WindowSplitter } from '../WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from '../windowsplitterData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'windowsplitter',
  label: 'Window Splitter',
  order: 27,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialWindowSplitterData, (data, event) => reduceWindowSplitterData(data, event, windowSplitterOptions))
    return {
      key: 'windowsplitter',
      label: 'Window Splitter',
      keyboardShortcuts: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'],
      sourceNames: ['WindowSplitter.tsx', 'windowsplitterData.ts', 'windowsplitter/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      preview: <WindowSplitter data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

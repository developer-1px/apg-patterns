import { usePatternDataHost } from '../../shared/demoHostState'
import { WindowSplitter } from './WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from './windowsplitterData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'windowsplitter',
  label: 'Window Splitter',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialWindowSplitterData, (data, event) => reduceWindowSplitterData(data, event, windowSplitterOptions))
    return {
      key: 'windowsplitter',
      label: 'Window Splitter',
      keyboardShortcuts: ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter'],
      sourceNames: ['WindowSplitter.tsx', 'windowsplitter/entry.tsx', 'windowsplitter/useWindowSplitterPattern.ts', 'windowsplitterData.ts', 'windowsplitter/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <WindowSplitter data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} options={windowSplitterOptions} />,
    }
  },
}

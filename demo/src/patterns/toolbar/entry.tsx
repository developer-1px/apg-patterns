import { usePatternDataHost } from '../../shared/demoHostState'
import { Toolbar } from './Toolbar'
import { initialToolbarData, reduceToolbarData } from './toolbarData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'toolbar',
  label: 'Toolbar',
  order: 24,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialToolbarData, reduceToolbarData)
    return {
      key: 'toolbar',
      label: 'Toolbar',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Space'],
      sourceNames: ['Toolbar.tsx', 'toolbarData.ts', 'toolbar/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      preview: <Toolbar data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

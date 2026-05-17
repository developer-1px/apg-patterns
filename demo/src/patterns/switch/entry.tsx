import { usePatternDataHost } from '../../shared/demoHostState'
import { Switch } from './Switch'
import { initialSwitchData, reduceSwitchData } from './switchData'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

export const entry: PatternEntry = {
  key: 'switch',
  label: 'Switch',
  order: 22,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialSwitchData, reduceSwitchData)
    return {
      key: 'switch',
      label: 'Switch',
      keyboardShortcuts: ['Space', 'Enter'],
      sourceNames: ['Switch.tsx', 'switchData.ts', 'switch/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      preview: <Switch data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

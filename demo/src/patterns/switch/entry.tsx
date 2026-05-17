import { usePatternDataHost } from '../../shared/demoHostState'
import { Switch } from './Switch'
import { initialSwitchData, reduceSwitchData } from './switchData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'switch',
  label: 'Switch',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialSwitchData, reduceSwitchData)
    return {
      key: 'switch',
      label: 'Switch',
      keyboardShortcuts: ['Space', 'Enter'],
      sourceNames: ['Switch.tsx', 'switchData.ts', 'switch/useSwitchPattern.ts', 'switch/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Switch data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
    }
  },
}

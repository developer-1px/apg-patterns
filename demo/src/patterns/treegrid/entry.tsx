import { reducePatternData } from '../../../../src'
import { treegridDefinition } from '../../../../src/patterns/treegrid/definition'
import { usePatternDataHost } from '../../shared/demoHostState'
import { Treegrid } from './Treegrid'
import { initialTreegridData } from './treegridData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

export const entry: PatternEntry = {
  key: 'treegrid',
  label: 'Treegrid',
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialTreegridData, (data, event) => reducePatternData(treegridDefinition, data, event))
    return {
      key: 'treegrid',
      label: 'Treegrid',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'],
      sourceNames: ['Treegrid.tsx', 'treegridData.ts', 'treegrid/definition.ts', 'treegrid/navigation.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      preview: <Treegrid data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

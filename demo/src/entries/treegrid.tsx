import { reducePatternData } from '../../../src'
import { treegridDefinition } from '../../../src/patterns/treegrid/definition'
import { usePatternDataHost } from '../demoHostState'
import { Treegrid } from '../Treegrid'
import { initialTreegridData } from '../treegridData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'treegrid',
  label: 'Treegrid',
  order: 26,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialTreegridData, (data, event) => reducePatternData(treegridDefinition, data, event))
    return {
      key: 'treegrid',
      label: 'Treegrid',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'PageUp', 'PageDown'],
      sourceNames: ['Treegrid.tsx', 'treegridData.ts', 'treegrid/definition.ts', 'treegrid/navigation.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      preview: <Treegrid data={host.data} options={{ focusStrategy: 'rovingTabIndex' }} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

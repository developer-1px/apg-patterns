import { usePatternDataHost } from '../../shared/demoHostState'
import { Switch } from './Switch'
import { initialSwitchData, reduceSwitchData } from './switchData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import type { PatternEvent } from '../../../../src'

const switchDemoDefinition = {
  key: 'switch',
  label: 'Switch',
  keyboardShortcuts: ['Space', 'Enter'],
  sources: {
    main: 'Switch.tsx',
    entry: 'switch/entry.tsx',
    data: ['switchData.ts'],
    hooks: ['switch/useSwitchPattern.ts'],
    definition: 'switch/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'Switch',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: switchDemoDefinition,
  useRuntime: (onEvent) => {
    const host = usePatternDataHost(initialSwitchData, reduceSwitchData)
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            data: host.data,
          },
        },
        actions: {
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: {
          Switch,
        },
      },
    }
  },
})

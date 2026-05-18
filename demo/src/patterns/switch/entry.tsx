import { Switch } from './Switch'
import { initialSwitchData, reduceSwitchData } from './switchData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

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

export const entry = defineStateDemoPattern({
  definition: switchDemoDefinition,
  initialData: initialSwitchData,
  reduce: reduceSwitchData,
  componentName: 'Switch',
  component: Switch,
})

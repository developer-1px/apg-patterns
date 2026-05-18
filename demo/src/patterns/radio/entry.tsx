import { RadioGroup } from './RadioGroup'
import { initialRadioData, reduceRadioData } from './radioData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const radioDemoDefinition = {
  key: 'radio',
  label: 'Radio Group',
  keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
  sources: {
    main: 'RadioGroup.tsx',
    entry: 'radio/entry.tsx',
    data: ['radioData.ts'],
    hooks: ['radio/useRadioGroupPattern.ts'],
    definition: 'radio/definition.ts',
  },
  view: {
    kind: 'component',
    component: 'RadioGroup',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: radioDemoDefinition,
  initialData: initialRadioData,
  reduce: reduceRadioData,
  componentName: 'RadioGroup',
  component: RadioGroup,
})

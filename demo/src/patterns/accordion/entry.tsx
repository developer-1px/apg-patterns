import { Accordion } from './Accordion'
import { initialAccordionData, reduceAccordionData } from './accordionData'
import { defineStateDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'

const accordionDemoDefinition = {
  key: 'accordion',
  label: 'Accordion',
  keyboardShortcuts: ['Enter', 'Space', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
  sources: {
    main: 'Accordion.tsx',
    entry: 'accordion/entry.tsx',
    data: ['accordionData.ts'],
    hooks: ['accordion/useAccordionPattern.ts'],
    definition: 'accordion/definition.ts',
    extra: ['accordion/keyboard.ts', 'accordion/parts.ts', 'accordion/react.ts'],
  },
  view: {
    kind: 'component',
    component: 'Accordion',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineStateDemoPattern({
  definition: accordionDemoDefinition,
  initialData: initialAccordionData,
  reduce: reduceAccordionData,
  componentName: 'Accordion',
  component: Accordion,
})

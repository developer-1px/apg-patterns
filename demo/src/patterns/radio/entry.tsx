import { usePatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { RadioGroup } from './RadioGroup'
import { initialRadioData, reduceRadioData } from './radioData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/defineDemoPattern'
import type { PatternEvent } from '../../../../src'

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

export const entry = defineDemoPattern({
  definition: radioDemoDefinition,
  useRuntime: (onEvent) => {
    const host = usePatternDataHost(initialRadioData, reduceRadioData)
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
          RadioGroup,
        },
      },
    }
  },
})

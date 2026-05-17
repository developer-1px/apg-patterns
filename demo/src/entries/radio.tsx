import { usePatternDataHost } from '../demoHostState'
import { renderRadioInspect } from '../inspect'
import { RadioGroup } from '../RadioGroup'
import { initialRadioData, reduceRadioData } from '../radioData'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'radio',
  label: 'Radio Group',
  order: 8,
  useDemoPattern: (onEvent) => {
    const host = usePatternDataHost(initialRadioData, reduceRadioData)
    return {
      key: 'radio',
      label: 'Radio Group',
      keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
      sourceNames: ['RadioGroup.tsx', 'radioData.ts', 'radio/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderRadioInspect(host.data),
      preview: <RadioGroup data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

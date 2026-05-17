import { useState } from 'react'
import { renderRadioInspect } from '../inspect'
import { RadioGroup } from '../RadioGroup'
import { initialRadioData, reduceRadioData } from '../radioData'
import { type PatternEntry } from '../demoPatternTypes'

export const entry: PatternEntry = {
  key: 'radio',
  label: 'Radio Group',
  order: 8,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialRadioData)
    return {
      key: 'radio',
      label: 'Radio Group',
      keyboardShortcuts: ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End', 'Space'],
      sourceNames: ['RadioGroup.tsx', 'radioData.ts', 'radio/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderRadioInspect(data),
      preview: <RadioGroup data={data} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceRadioData(current, event))
      }} />,
      reset: () => setData(initialRadioData),
    }
  },
}

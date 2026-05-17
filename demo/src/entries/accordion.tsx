import { useState } from 'react'
import { Accordion } from '../Accordion'
import { initialAccordionData, reduceAccordionData } from '../accordionData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'accordion',
  label: 'Accordion',
  order: 11,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialAccordionData)
    return {
      key: 'accordion',
      label: 'Accordion',
      keyboardShortcuts: ['Enter', 'Space', 'ArrowDown', 'ArrowUp', 'Home', 'End'],
      sourceNames: ['Accordion.tsx', 'accordionData.ts', 'accordion/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      preview: <Accordion data={data} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceAccordionData(current, event))
      }} />,
      reset: () => setData(initialAccordionData),
    }
  },
}

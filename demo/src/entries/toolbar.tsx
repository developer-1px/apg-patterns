import { useState } from 'react'
import { Toolbar } from '../Toolbar'
import { initialToolbarData, reduceToolbarData } from '../toolbarData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'toolbar',
  label: 'Toolbar',
  order: 24,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialToolbarData)
    return {
      key: 'toolbar',
      label: 'Toolbar',
      keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'Home', 'End', 'Enter', 'Space'],
      sourceNames: ['Toolbar.tsx', 'toolbarData.ts', 'toolbar/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      preview: <Toolbar data={data} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceToolbarData(current, event))
      }} />,
      reset: () => setData(initialToolbarData),
    }
  },
}

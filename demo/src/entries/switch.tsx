import { useState } from 'react'
import { Switch } from '../Switch'
import { initialSwitchData, reduceSwitchData } from '../switchData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'switch',
  label: 'Switch',
  order: 22,
  useDemoPattern: (onEvent) => {
    const [data, setData] = useState(initialSwitchData)
    return {
      key: 'switch',
      label: 'Switch',
      keyboardShortcuts: ['Space', 'Enter'],
      sourceNames: ['Switch.tsx', 'switchData.ts', 'switch/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      preview: <Switch data={data} onEvent={(event) => {
        onEvent(event)
        setData((current) => reduceSwitchData(current, event))
      }} />,
      reset: () => setData(initialSwitchData),
    }
  },
}

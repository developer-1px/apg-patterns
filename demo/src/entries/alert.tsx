import { useState } from 'react'
import { Alert } from '../Alert'
import { initialAlertData, reduceAlertState } from '../alertData'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

export const entry: PatternEntry = {
  key: 'alert',
  label: 'Alert',
  order: 12,
  useDemoPattern: (onEvent) => {
    const [state, setState] = useState({ data: initialAlertData })
    return {
      key: 'alert',
      label: 'Alert',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Alert.tsx', 'alertData.ts', 'alert/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(state.data),
      preview: <Alert data={state.data} onEvent={(event) => {
        if (event.type !== 'spawn') onEvent(event)
        setState((current) => reduceAlertState(current, event))
      }} />,
      reset: () => setState({ data: initialAlertData }),
    }
  },
}

import { useReducer } from 'react'
import { PatternDataSchema } from '../../../../src'
import { Alert } from './Alert'
import { type AlertDomainEvent, initialAlertData, reduceAlertState } from './alertData'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

type AlertDemoAction =
  | { type: 'event'; event: AlertDomainEvent }
  | { type: 'reset' }

const reduceAlertDemoState = (data: typeof initialAlertData, action: AlertDemoAction) => {
  if (action.type === 'reset') return PatternDataSchema.parse(initialAlertData)
  return PatternDataSchema.parse(reduceAlertState({ data }, action.event).data)
}

export const entry: PatternEntry = {
  key: 'alert',
  label: 'Alert',
  useDemoPattern: (onEvent) => {
    const [data, dispatch] = useReducer(reduceAlertDemoState, PatternDataSchema.parse(initialAlertData))
    return {
      key: 'alert',
      label: 'Alert',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Alert.tsx', 'alertData.ts', 'alert/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(data),
      preview: <Alert data={data} onEvent={(event) => {
        if (event.type !== 'spawn') onEvent(event)
        dispatch({ type: 'event', event })
      }} />,
      reset: () => dispatch({ type: 'reset' }),
    }
  },
}

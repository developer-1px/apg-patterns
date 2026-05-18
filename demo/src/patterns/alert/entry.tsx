import { useReducer } from 'react'
import { PatternDataSchema } from '../../../../src'
import { Alert } from './Alert'
import { type AlertDomainEvent, initialAlertData, reduceAlertState } from './alertData'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

type AlertDemoAction =
  | { type: 'event'; event: AlertDomainEvent }

const reduceAlertDemoState = (data: typeof initialAlertData, action: AlertDemoAction) => {
  return PatternDataSchema.parse(reduceAlertState({ data }, action.event).data)
}

const alertDemoDefinition = {
  key: 'alert',
  label: 'Alert',
  keyboardShortcuts: ['Enter', 'Space'],
  sources: {
    main: 'Alert.tsx',
    entry: 'alert/entry.tsx',
    data: ['alertData.ts'],
    hooks: ['alert/useAlertPattern.ts'],
    definition: 'alert/definition.ts',
    extra: ['alert/alertProps.ts', 'alert/keyboard.ts', 'alert/parts.ts'],
  },
  view: {
    kind: 'component',
    component: 'Alert',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: alertDemoDefinition,
  useRuntime: (onEvent) => {
    const [data, dispatch] = useReducer(reduceAlertDemoState, PatternDataSchema.parse(initialAlertData))
    return {
      inspect: renderDataInspect(data),
      context: {
        values: { state: { data } },
        actions: {
          dispatchEvent: (event: AlertDomainEvent) => {
            if (event.type !== 'spawn') onEvent(event)
            dispatch({ type: 'event', event })
          },
        },
        components: { Alert },
      },
    }
  },
})

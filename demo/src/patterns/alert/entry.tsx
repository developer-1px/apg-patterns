import { useReducer } from 'react'
import { PatternDataSchema } from '../../../../src/react'
import { Alert } from './Alert'
import { type AlertDomainEvent, initialAlertData, reduceAlertState } from './alertData'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const reduceAlertDemoData = (data: typeof initialAlertData, event: AlertDomainEvent) => {
  return PatternDataSchema.parse(reduceAlertState({ data }, event).data)
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
    const [data, dispatch] = useReducer(reduceAlertDemoData, PatternDataSchema.parse(initialAlertData))
    return {
      inspect: renderDataInspect(data),
      context: {
        values: { state: { data } },
        actions: {
          dispatchEvent: (event: AlertDomainEvent) => {
            if (event.type !== 'spawn') onEvent(event)
            dispatch(event)
          },
        },
        components: { Alert },
      },
    }
  },
})

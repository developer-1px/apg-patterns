import { useState } from 'react'
import { Alert } from '../Alert'
import { initialAlertData, reduceAlertState, type AlertDomainEvent, type AlertReducerState } from '../alertData'

export function AlertDemo() {
  const [state, setState] = useState<AlertReducerState>({ data: initialAlertData })
  const handleEvent = (event: AlertDomainEvent) => setState((current) => reduceAlertState(current, event))
  return <Alert data={state.data} onEvent={handleEvent} />
}

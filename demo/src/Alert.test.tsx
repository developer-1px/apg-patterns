import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'
import {
  initialAlertData,
  initialAlertMessage,
  reduceAlertState,
  type AlertDomainEvent,
  type AlertReducerState,
} from './alertData'

function AlertDemo() {
  const [state, setState] = useState<AlertReducerState>({ data: initialAlertData, message: initialAlertMessage })
  const handleEvent = (event: AlertDomainEvent) => setState((current) => reduceAlertState(current, event))
  return <Alert data={state.data} message={state.message} onEvent={handleEvent} />
}

describe('Alert demo', () => {
  it('renders trigger and no alert initially', () => {
    render(<AlertDemo />)
    expect(screen.getByRole('button', { name: 'Trigger alert' })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('trigger click spawns role=alert with message text', () => {
    render(<AlertDemo />)
    const trigger = screen.getByRole('button', { name: 'Trigger alert' })

    fireEvent.click(trigger)

    const alert = screen.getByRole('alert')
    expect(alert).toBeTruthy()
    expect(alert.textContent ?? '').toMatch(/Alert at /)
  })

  it('dismiss button click hides role=alert', () => {
    render(<AlertDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Trigger alert' }))
    expect(screen.getByRole('alert')).toBeTruthy()

    const dismiss = screen.getByRole('button', { name: 'Dismiss alert' })
    fireEvent.click(dismiss)
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('Escape on alert dismisses it', () => {
    render(<AlertDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Trigger alert' }))
    const alert = screen.getByRole('alert')
    fireEvent.keyDown(alert, { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

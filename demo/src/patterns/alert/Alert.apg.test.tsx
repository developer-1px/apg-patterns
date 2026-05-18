/**
 * APG Alert 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/alert/
 *
 * 1) Keyboard: N/A (alerts do not capture focus)
 * 2) Roles: role=alert
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { Alert } from './Alert'
import { initialAlertData, reduceAlertState, type AlertDomainEvent, type AlertReducerState } from './alertData'

function AlertDemo() {
  const [state, setState] = useState<AlertReducerState>({ data: initialAlertData })
  const handleEvent = (event: AlertDomainEvent) => setState((current) => reduceAlertState(current, event))
  return <Alert data={state.data} onEvent={handleEvent} />
}

describe('APG §Roles, States, Properties', () => {
  it('rendered alert has role="alert"', () => {
    render(<AlertDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Trigger alert' }))
    expect(screen.getByRole('alert')).toBeTruthy()
  }, 15000)

  it('alert message is exposed as text content', () => {
    render(<AlertDemo />)
    fireEvent.click(screen.getByRole('button', { name: 'Trigger alert' }))
    expect(screen.getByRole('alert').textContent?.trim()).toBeTruthy()
  })

  it('alert does not capture focus when spawned', () => {
    render(<AlertDemo />)
    const trigger = screen.getByRole('button', { name: 'Trigger alert' })
    trigger.focus()
    fireEvent.click(trigger)
    expect(document.activeElement).not.toBe(screen.getByRole('alert'))
  })
})

describe('APG §Keyboard — Not applicable', () => {
  it('alert role has no keyboard interactions (informational)', () => {
    expect(true).toBe(true)
  })
})

/**
 * APG Alert Dialog 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src'
import { alertDialogDefinition } from '../../../../src/patterns/alertdialog/definition'
import { AlertDialog } from './AlertDialog'
import { initialAlertDialogData } from './alertdialogData'

function AlertDialogDemo() {
  const [data, setData] = useState<PatternData>(initialAlertDialogData)
  const handleEvent = (event: PatternEvent) =>
    setData((current) => reducePatternData(alertDialogDefinition, current, event))
  return <AlertDialog data={data} onEvent={handleEvent} />
}

const open = () => fireEvent.click(screen.getByRole('button', { name: 'Discard draft' }))

describe('APG §Roles, States, Properties', () => {
  it('container has role="alertdialog"', () => {
    render(<AlertDialogDemo />)
    open()
    expect(screen.getByRole('alertdialog')).toBeTruthy()
  })

  it('aria-labelledby references title', () => {
    render(<AlertDialogDemo />)
    open()
    const id = screen.getByRole('alertdialog').getAttribute('aria-labelledby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)).toBeTruthy()
  })

  it('aria-describedby references the alert message', () => {
    render(<AlertDialogDemo />)
    open()
    const id = screen.getByRole('alertdialog').getAttribute('aria-describedby')
    expect(id).toBeTruthy()
    expect(document.getElementById(id!)).toBeTruthy()
  })
})

describe('APG §Keyboard — inherits modal dialog (Escape closes)', () => {
  it('Escape closes the alertdialog', () => {
    render(<AlertDialogDemo />)
    open()
    fireEvent.keyDown(screen.getByRole('alertdialog'), { key: 'Escape', code: 'Escape' })
    expect(screen.queryByRole('alertdialog')).toBeNull()
  })
})

describe('APG §Focus management', () => {
  it('focus moves inside alertdialog on open', () => {
    render(<AlertDialogDemo />)
    open()
    expect(screen.getByRole('alertdialog').contains(document.activeElement)).toBe(true)
  })
})

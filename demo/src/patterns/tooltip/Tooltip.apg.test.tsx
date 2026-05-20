/**
 * APG Tooltip 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 *   1) Keyboard: Escape dismisses
 *   2) Roles: role=tooltip; trigger has aria-describedby
 *   3) Focus: tooltip does not steal focus
 */
import { act, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { tooltipDefinition } from '../../../../src/patterns/tooltip/definition'
import { Tooltip } from './Tooltip'
import { initialTooltipData } from './tooltipData'

function TooltipDemo() {
  const [data, setData] = useState<PatternData>(initialTooltipData)
  const handleEvent = (event: PatternEvent) => setData((current) => reducePatternData(tooltipDefinition, current, event))
  return <Tooltip data={data} onEvent={handleEvent} />
}

describe('APG §Roles, States, Properties', () => {
  it('tooltip element uses role="tooltip"', () => {
    render(<TooltipDemo />)
    act(() => { fireEvent.focus(screen.getByRole('button')) })
    expect(screen.getByRole('tooltip')).toBeTruthy()
  })

  it('trigger references tooltip via aria-describedby', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    const describedby = trigger.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    act(() => { fireEvent.focus(trigger) })
    expect(screen.getByRole('tooltip').id).toBe(describedby)
  })
})

describe('APG §Keyboard — Escape dismisses', () => {
  it('Escape on focused trigger hides the tooltip', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    act(() => { fireEvent.focus(trigger) })
    expect(screen.getByRole('tooltip')).toBeTruthy()
    act(() => { fireEvent.keyDown(trigger, { key: 'Escape', code: 'Escape' }) })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

describe('APG §Focus — tooltip does not steal focus', () => {
  it('focus stays on trigger when tooltip shows', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    act(() => { trigger.focus() })
    act(() => { fireEvent.focus(trigger) })
    expect(document.activeElement).toBe(trigger)
  })

  it('blur on trigger dismisses focus-triggered tooltip', () => {
    render(<TooltipDemo />)
    const trigger = screen.getByRole('button')
    act(() => { fireEvent.focus(trigger) })
    expect(screen.getByRole('tooltip')).toBeTruthy()
    act(() => { fireEvent.blur(trigger) })
    expect(screen.queryByRole('tooltip')).toBeNull()
  })
})

/**
 * APG Button 스펙 전수 테스트.
 *
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/button/
 *
 *   1) Keyboard Interaction (Space / Enter)
 *   2) WAI-ARIA Roles, States, and Properties (role=button, aria-pressed, aria-label, aria-disabled)
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src/react'
import { Button } from './Button'
import { buttonVariants } from './buttonData'

function ActionDemo({ onActivate }: { onActivate?: () => void }) {
  const variant = buttonVariants.action
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => {
    if (event.type === 'activate') onActivate?.()
    setData((current) => variant.reduce(current, event))
  }
  return <Button data={data} onEvent={handleEvent} />
}

function ToggleDemo() {
  const variant = buttonVariants.toggle
  const [data, setData] = useState(variant.data)
  const handleEvent = (event: PatternEvent) => setData((current) => variant.reduce(current, event))
  return <Button data={data} onEvent={handleEvent} />
}

// ---------------------------------------------------------------------------
// §1. Roles, States, and Properties
// ---------------------------------------------------------------------------

describe('APG §Roles, States, Properties', () => {
  it('element has role="button"', () => {
    render(<ActionDemo />)
    expect(screen.getByRole('button')).toBeTruthy()
  })

  it('has accessible name from text content (or aria-label / aria-labelledby)', () => {
    render(<ActionDemo />)
    const btn = screen.getByRole('button')
    const name = btn.textContent || btn.getAttribute('aria-label') || btn.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })

  it('action button does not expose aria-pressed', () => {
    render(<ActionDemo />)
    expect(screen.getByRole('button').hasAttribute('aria-pressed')).toBe(false)
  })

  it('toggle button exposes aria-pressed', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    expect(['true', 'false']).toContain(btn.getAttribute('aria-pressed'))
  })

  it('toggle button label does not change between pressed states (APG: label must stay stable)', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    const labelBefore = btn.textContent
    fireEvent.click(btn)
    expect(btn.textContent).toBe(labelBefore)
  })

  it('aria-disabled (if present) is "true" or "false"', () => {
    render(<ActionDemo />)
    document.querySelectorAll('[aria-disabled]').forEach((el) => {
      expect(['true', 'false']).toContain(el.getAttribute('aria-disabled'))
    })
  })
})

// ---------------------------------------------------------------------------
// §2. Keyboard Interaction
// ---------------------------------------------------------------------------

describe('APG §Keyboard — Space activates', () => {
  it('Space on action button fires activate', () => {
    let count = 0
    render(<ActionDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: ' ', code: 'Space' })
    expect(count).toBe(1)
  })

  it('Space on toggle button toggles aria-pressed', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    const before = btn.getAttribute('aria-pressed')
    fireEvent.keyDown(btn, { key: ' ', code: 'Space' })
    expect(btn.getAttribute('aria-pressed')).not.toBe(before)
  })
})

describe('APG §Keyboard — Enter activates', () => {
  it('Enter on action button fires activate', () => {
    let count = 0
    render(<ActionDemo onActivate={() => count++} />)
    fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter', code: 'Enter' })
    expect(count).toBe(1)
  })

  it('Enter on toggle button toggles aria-pressed', () => {
    render(<ToggleDemo />)
    const btn = screen.getByRole('button')
    const before = btn.getAttribute('aria-pressed')
    fireEvent.keyDown(btn, { key: 'Enter', code: 'Enter' })
    expect(btn.getAttribute('aria-pressed')).not.toBe(before)
  })
})

describe('APG §Focus management', () => {
  it('button is focusable (tabIndex >= 0 or native button)', () => {
    render(<ActionDemo />)
    const btn = screen.getByRole('button')
    const ti = btn.getAttribute('tabindex')
    expect(btn.tagName === 'BUTTON' || (ti !== null && Number(ti) >= 0)).toBe(true)
  })
})

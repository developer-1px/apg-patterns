/**
 * APG Meter 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/meter/
 */
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Meter } from './Meter'
import { meterVariants } from './meterData'

function DiskMeter() {
  const variant = meterVariants.disk
  return <Meter data={variant.data} onEvent={() => {}} options={variant.options} />
}

describe('APG §Roles, States, Properties', () => {
  it('element has role="meter"', () => {
    render(<DiskMeter />)
    expect(screen.getByRole('meter')).toBeTruthy()
  })

  it('exposes aria-valuenow', () => {
    render(<DiskMeter />)
    expect(screen.getByRole('meter').getAttribute('aria-valuenow')).toBeTruthy()
  })

  it('exposes aria-valuemin', () => {
    render(<DiskMeter />)
    expect(screen.getByRole('meter').getAttribute('aria-valuemin')).toBeTruthy()
  })

  it('exposes aria-valuemax', () => {
    render(<DiskMeter />)
    expect(screen.getByRole('meter').getAttribute('aria-valuemax')).toBeTruthy()
  })

  it('valuenow falls within [valuemin, valuemax]', () => {
    render(<DiskMeter />)
    const m = screen.getByRole('meter')
    const now = Number(m.getAttribute('aria-valuenow'))
    const min = Number(m.getAttribute('aria-valuemin'))
    const max = Number(m.getAttribute('aria-valuemax'))
    expect(now).toBeGreaterThanOrEqual(min)
    expect(now).toBeLessThanOrEqual(max)
  })

  it('aria-valuetext (if present) is a non-empty string', () => {
    render(<DiskMeter />)
    const vt = screen.getByRole('meter').getAttribute('aria-valuetext')
    if (vt !== null) expect(vt.length).toBeGreaterThan(0)
  })

  it('has accessible label', () => {
    render(<DiskMeter />)
    const m = screen.getByRole('meter')
    const name = m.getAttribute('aria-label') || m.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })
})

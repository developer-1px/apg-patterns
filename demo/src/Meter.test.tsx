import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Meter } from './Meter'
import { initialMeterData, meterOptions, meterVariants } from './meterData'

describe('Meter demo — back-compat (single disk meter)', () => {
  it('renders role=meter with aria-valuemin/max/now/valuetext', () => {
    render(<Meter data={initialMeterData} options={meterOptions} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('72')
    expect(meter.getAttribute('aria-valuetext')).toBe('72%')
  })

  it('exposes the label', () => {
    render(<Meter data={initialMeterData} options={meterOptions} />)
    expect(screen.getByText('Disk usage')).toBeTruthy()
  })
})

describe('Meter demo — variant: Battery', () => {
  it('renders battery level meter', () => {
    const v = meterVariants.battery
    render(<Meter data={v.data} options={v.options} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuenow')).toBe('35')
    expect(meter.getAttribute('aria-valuetext')).toBe('35%')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
  })
})

describe('Meter demo — variant: CPU (per-item range override)', () => {
  it('uses item valuemin/valuemax over options', () => {
    const v = meterVariants.cpu
    render(<Meter data={v.data} options={v.options} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('48')
  })
})

describe('Meter demo — variant: Storage', () => {
  it('renders custom valuetext with options-driven max', () => {
    const v = meterVariants.storage
    render(<Meter data={v.data} options={v.options} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('256')
    expect(meter.getAttribute('aria-valuenow')).toBe('180')
    expect(meter.getAttribute('aria-valuetext')).toBe('180 GB of 256 GB used')
  })
})

describe('Meter demo — no keyboard interaction', () => {
  it('does not expose a tabIndex (read-only display)', () => {
    render(<Meter data={initialMeterData} options={meterOptions} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('tabindex')).toBeNull()
  })
})

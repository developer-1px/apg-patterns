import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useMeterPattern, type PatternData } from '../../../../src/react'
import { Meter } from './Meter'
import { initialMeterData, meterVariants } from './meterData'

function MeterRuntimeEdgeDemo({ data }: { data: PatternData }) {
  const meter = useMeterPattern(data, () => undefined, { elementIdPrefix: 'edge-meter-' })
  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const item = meter.renderItems[0]
          document.getElementById('meter-runtime-output')!.textContent = [
            meter.rootProps.role ?? 'none',
            item?.key ?? 'none',
            meter.state.valueByKey[item?.key ?? 'missing'] ?? 'missing',
            meter.ids.forKey(item?.key ?? 'missing'),
            meter.keyToElementId(item?.key ?? 'missing'),
          ].join('|')
        }}
      >
        Read meter runtime
      </button>
      <output id="meter-runtime-output" />
    </div>
  )
}

describe('Meter demo — back-compat (single disk meter)', () => {
  it('renders role=meter with aria-valuemin/max/now/valuetext', () => {
    render(<Meter data={initialMeterData} onEvent={() => {}} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('72')
    expect(meter.getAttribute('aria-valuetext')).toBe('72%')
  })

  it('exposes the label', () => {
    render(<Meter data={initialMeterData} onEvent={() => {}} />)
    expect(screen.getByText('Disk usage')).toBeTruthy()
  })
})

describe('Meter demo — variant: Battery', () => {
  it('renders battery level meter', () => {
    const v = meterVariants.battery
    render(<Meter data={v.data} onEvent={() => {}} options={v.options} />)
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
    render(<Meter data={v.data} onEvent={() => {}} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('100')
    expect(meter.getAttribute('aria-valuenow')).toBe('48')
  })
})

describe('Meter demo — variant: Storage', () => {
  it('renders custom valuetext with options-driven max', () => {
    const v = meterVariants.storage
    render(<Meter data={v.data} onEvent={() => {}} options={v.options} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('aria-valuemin')).toBe('0')
    expect(meter.getAttribute('aria-valuemax')).toBe('256')
    expect(meter.getAttribute('aria-valuenow')).toBe('180')
    expect(meter.getAttribute('aria-valuetext')).toBe('180 GB of 256 GB used')
  })
})

describe('Meter demo — no keyboard interaction', () => {
  it('does not expose a tabIndex (read-only display)', () => {
    render(<Meter data={initialMeterData} onEvent={() => {}} />)
    const meter = screen.getByRole('meter')
    expect(meter.getAttribute('tabindex')).toBeNull()
  })

  it('exposes meter runtime getters from pointer input', () => {
    render(<MeterRuntimeEdgeDemo data={initialMeterData} />)

    fireEvent.click(screen.getByRole('button', { name: 'Read meter runtime' }))

    expect(screen.getByText('none|disk|72|edge-meter-disk|edge-meter-disk')).toBeTruthy()
  })
})

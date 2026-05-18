import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { formatTimelineAsText, type ReproEvent, type ReproMeta } from './reproRecorderFormat'

const meta: ReproMeta = {
  url: '/demo',
  startedAt: '2026-05-19T00:00:00.000Z',
  duration: 250,
  eventCount: 3,
}

function FormatHost() {
  const [text, setText] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const timeline: ReproEvent[] = [
            { seq: 1, time: '+0ms', ch: 'input', type: 'focus', target: 'button', source: null, focus: 'button', prevented: false, ariaTree: '(no changes)' },
            { seq: 2, time: '+1ms', ch: 'input', type: 'click', target: 'button', source: 'Button.tsx', focus: 'input', prevented: true, ariaTree: 'button aria-expanded=true' },
            { seq: 3, time: '+2ms', ch: 'input', type: 'click', target: 'button', source: 'Button.tsx', focus: 'button', prevented: false, ariaTree: '(no changes)' },
            { seq: 4, time: '+3ms', ch: 'state', command: 'toggle', payload: {}, diff: [] },
            { seq: 5, time: '+4ms', ch: 'input', type: 'click', target: 'other', source: null, focus: 'other', prevented: false, ariaTree: 'other' },
          ]
          setText(formatTimelineAsText(meta, timeline))
        }}
      >
        Format input timeline
      </button>
      <button
        type="button"
        onClick={() => {
          const timeline: ReproEvent[] = [
            { seq: 1, time: '+0ms', ch: 'input', type: 'focus', target: 'field', source: null, focus: 'field', prevented: false, ariaTree: 'field' },
            { seq: 2, time: '+1ms', ch: 'input', type: 'keydown', key: 'Enter', target: 'field', source: null, focus: 'field', prevented: false, ariaTree: '(no changes)' },
          ]
          setText(formatTimelineAsText(meta, timeline))
        }}
      >
        Format adjacent inputs
      </button>
      <output data-testid="format-output">{text}</output>
    </div>
  )
}

describe('repro recorder formatter input coverage', () => {
  it('formats input timeline branches from pointer input', () => {
    render(<FormatHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Format input timeline' }))
    expect(screen.getByTestId('format-output').textContent).toContain('[1] +0ms focus -> button (no changes)')
    expect(screen.getByTestId('format-output').textContent).toContain('focus: input | prevented')
    expect(screen.getByTestId('format-output').textContent).toContain('-> toggle: no diff')

    fireEvent.click(screen.getByRole('button', { name: 'Format adjacent inputs' }))
    expect(screen.getByTestId('format-output').textContent).toContain('[2] +1ms keydown Enter -> field (no changes)')
  })
})

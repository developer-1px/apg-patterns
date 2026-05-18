import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { entry as comboboxEntry } from './combobox/entry'
import { entry as sliderEntry } from './slider/entry'
import { entry as tableEntry } from './table/entry'

function EntryDemo({ kind }: { kind: 'combobox' | 'slider' | 'table' }) {
  const entry = kind === 'combobox' ? comboboxEntry : kind === 'slider' ? sliderEntry : tableEntry
  const demo = entry.useDemoPattern(() => undefined)
  return (
    <>
      {demo.variants}
      {demo.preview}
    </>
  )
}

describe('demo entry coverage from pointer input', () => {
  it('renders variant entries and switches previews through clicks', () => {
    const { unmount } = render(<EntryDemo kind="combobox" />)
    fireEvent.click(screen.getByRole('option', { name: 'Select-Only' }))
    expect(screen.getByRole('combobox').getAttribute('aria-haspopup')).toBe('listbox')
    unmount()

    const slider = render(<EntryDemo kind="slider" />)
    fireEvent.click(screen.getByRole('option', { name: 'Rating' }))
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Neutral')
    slider.unmount()

    render(<EntryDemo kind="table" />)
    fireEvent.click(screen.getByRole('option', { name: 'Sortable planets' }))
    expect(screen.getByRole('table').getAttribute('aria-label')).toBe('Sortable planets')
  })
})

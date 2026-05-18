import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { VariantListbox } from './VariantListbox'

const items = [
  { key: 'one', label: 'One' },
  { key: 'two', label: 'Two' },
  { key: 'three', label: 'Three' },
] as const

function VariantListboxDemo() {
  const [value, setValue] = useState<(typeof items)[number]['key']>('one')
  return <VariantListbox value={value} items={items} label="variants" idPrefix="variant" onChange={setValue} />
}

function HorizontalVariantListboxDemo() {
  const [value, setValue] = useState<(typeof items)[number]['key']>('one')
  return <VariantListbox orientation="horizontal" value={value} items={items} label="variants" idPrefix="variant" onChange={setValue} />
}

describe('VariantListbox', () => {
  it('uses listbox roles for variants', () => {
    render(<VariantListboxDemo />)

    expect(screen.getByRole('listbox', { name: 'variants' })).toBeTruthy()
    expect(screen.getByRole('option', { name: 'One' }).getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowDown changes the selected variant', () => {
    render(<VariantListboxDemo />)

    fireEvent.keyDown(screen.getByRole('listbox', { name: 'variants' }), { key: 'ArrowDown', code: 'ArrowDown' })

    expect(screen.getByRole('option', { name: 'Two' }).getAttribute('aria-selected')).toBe('true')
  })

  it('ArrowDown moves DOM focus to the selected variant', () => {
    render(<VariantListboxDemo />)
    const listbox = screen.getByRole('listbox', { name: 'variants' })

    screen.getByRole('option', { name: 'One' }).focus()
    fireEvent.keyDown(listbox, { key: 'ArrowDown', code: 'ArrowDown' })

    expect(document.activeElement).toBe(screen.getByRole('option', { name: 'Two' }))
  })

  it('ArrowRight and ArrowLeft change the selected horizontal variant', () => {
    render(<HorizontalVariantListboxDemo />)

    const listbox = screen.getByRole('listbox', { name: 'variants' })
    fireEvent.keyDown(listbox, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(screen.getByRole('option', { name: 'Two' }).getAttribute('aria-selected')).toBe('true')

    fireEvent.keyDown(listbox, { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(screen.getByRole('option', { name: 'One' }).getAttribute('aria-selected')).toBe('true')
  })

  it('click changes the selected variant', () => {
    render(<VariantListboxDemo />)

    fireEvent.click(screen.getByRole('option', { name: 'Three' }))

    expect(screen.getByRole('option', { name: 'Three' }).getAttribute('aria-selected')).toBe('true')
  })
})

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

  it('click changes the selected variant', () => {
    render(<VariantListboxDemo />)

    fireEvent.click(screen.getByRole('option', { name: 'Three' }))

    expect(screen.getByRole('option', { name: 'Three' }).getAttribute('aria-selected')).toBe('true')
  })
})

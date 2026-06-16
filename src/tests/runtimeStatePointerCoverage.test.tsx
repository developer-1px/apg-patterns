import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useComboboxPattern } from '../patterns/combobox/useComboboxPattern'

function RuntimeStateHost() {
  const [result, setResult] = useState('')
  const combobox = useComboboxPattern(
    {
      items: { combobox: { label: 'Choose' }, selected: {} },
      relations: {},
      state: { selectedKeys: ['selected'] },
    },
    () => undefined,
  )

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setResult([
            combobox.listboxId,
            combobox.inputProps.value,
            combobox.inputProps.placeholder,
          ].join('|'))
        }}
      >
        Read empty runtime state
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('runtime state coverage from pointer input', () => {
  it('covers empty runtime-state fallbacks from clicks', () => {
    render(<RuntimeStateHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Read empty runtime state' }))
    expect(screen.getByText('combobox-popup||Search choose')).toBeTruthy()
  })
})

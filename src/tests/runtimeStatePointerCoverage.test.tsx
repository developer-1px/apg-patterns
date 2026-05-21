import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { getComboboxRuntimeState } from '../patterns/combobox/comboboxRuntimeState'

function RuntimeStateHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const combobox = getComboboxRuntimeState({
            items: { combobox: { label: 'Choose' }, selected: {} },
            relations: {},
            state: { selectedKeys: ['selected'] },
          })
          setResult([
            combobox.listboxId,
            combobox.displayValue,
            combobox.label,
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
    expect(screen.getByText('combobox-popup||Choose')).toBeTruthy()
  })
})

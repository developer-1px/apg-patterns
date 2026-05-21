import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { getComboboxRuntimeState } from '../patterns/combobox/comboboxRuntimeState'
import { getCheckboxRuntimeState } from '../patterns/checkbox/checkboxRuntimeState'
import { getRadioGroupRuntimeState } from '../patterns/radio/radioGroupRuntimeState'
import { getSwitchRuntimeState } from '../patterns/switch/switchRuntimeState'
import { getToolbarRuntimeState } from '../patterns/toolbar/toolbarRuntimeState'

function RuntimeStateHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const checkbox = getCheckboxRuntimeState({ items: {}, relations: {}, state: {} })
          const radio = getRadioGroupRuntimeState({ items: {}, relations: {}, state: {} })
          const switchState = getSwitchRuntimeState({ items: {}, relations: {}, state: {} })
          const toolbar = getToolbarRuntimeState({ items: {}, relations: {}, state: {} })
          const combobox = getComboboxRuntimeState({
            items: { combobox: { label: 'Choose' }, selected: {} },
            relations: {},
            state: { selectedKeys: ['selected'] },
          })
          setResult([
            checkbox.activeKey ?? 'null',
            Object.keys(checkbox.checkedByKey).length,
            checkbox.disabledKeys.length,
            radio.activeKey ?? 'null',
            radio.selectedKeys.length,
            radio.disabledKeys.length,
            switchState.activeKey ?? 'null',
            Object.keys(switchState.checkedByKey).length,
            switchState.disabledKeys.length,
            toolbar.activeKey ?? 'null',
            toolbar.selectedKeys.length,
            toolbar.disabledKeys.length,
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
    expect(screen.getByText('null|0|0|null|0|0|null|0|0|null|0|0|combobox-popup||Choose')).toBeTruthy()
  })
})

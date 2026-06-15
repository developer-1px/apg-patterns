import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  MenuButton,
  RadioGroup,
  Toolbar,
  createMenuButtonPatternData,
  createRadioGroupPatternData,
  createToolbarPatternData,
  menuButtonDefinition,
  radioGroupDefinition,
  toolbarDefinition,
  usePatternStateReducer,
  type PatternState,
} from '../react'

function SearchActionsToolbarDogfood() {
  const controller = usePatternStateReducer(
    toolbarDefinition,
    createToolbarPatternData([
      { key: 'find', label: 'Find', selected: true },
      { key: 'replace', label: 'Replace' },
      { key: 'goTo', label: 'Go to cell' },
    ], {
      label: 'Search actions',
    }),
  )

  return (
    <>
      <Toolbar data={controller.data} onEvent={controller.onEvent} />
      <output data-testid="toolbar-selected">
        {controller.state.selectedKeys?.join(',') ?? ''}
      </output>
    </>
  )
}

function RadioCommandSurfaceDogfood() {
  const controller = usePatternStateReducer(
    radioGroupDefinition,
    createRadioGroupPatternData([
      { key: 'ascending', label: 'Ascending' },
      { key: 'descending', label: 'Descending', selected: true },
      { key: 'custom', label: 'Custom', disabled: true },
    ], {
      label: 'Sort direction',
    }),
  )

  return (
    <>
      <RadioGroup data={controller.data} onEvent={controller.onEvent} />
      <output data-testid="radio-selected">
        {controller.state.selectedKeys?.join(',') ?? ''}
      </output>
    </>
  )
}

function MenuButtonCommandSurfaceDogfood() {
  const controller = usePatternStateReducer(
    menuButtonDefinition,
    createMenuButtonPatternData(
      { key: 'actions', label: 'Actions' },
      [
        { key: 'copy', label: 'Copy' },
        { key: 'pasteSpecial', label: 'Paste special' },
        { key: 'deleteRows', label: 'Delete rows', disabled: true },
      ],
      { menuKey: 'actionsMenu' },
    ),
  )

  return (
    <>
      <MenuButton data={controller.data} onEvent={controller.onEvent} />
      <output data-testid="menu-expanded">
        {controller.state.expandedKeys?.join(',') ?? ''}
      </output>
    </>
  )
}

function DynamicToolbarDogfood() {
  const [advanced, setAdvanced] = useState(false)
  const controller = usePatternStateReducer(
    toolbarDefinition,
    createToolbarPatternData([
      { key: 'bold', label: 'Bold' },
      { key: 'italic', label: 'Italic' },
      ...(advanced ? [{ key: 'clear', label: 'Clear formatting' }] : []),
    ], {
      label: 'Formatting actions',
    }),
  )

  return (
    <>
      <button type="button" onClick={() => setAdvanced(true)}>Advanced</button>
      <Toolbar data={controller.data} onEvent={controller.onEvent} />
      <output data-testid="dynamic-selected">
        {controller.state.selectedKeys?.join(',') ?? ''}
      </output>
    </>
  )
}

function ControlledToolbarDogfood() {
  const [patternState, setPatternState] = useState<PatternState>({
    activeKey: 'bold',
    selectedKeys: [],
  })
  const controller = usePatternStateReducer(
    toolbarDefinition,
    createToolbarPatternData([
      { key: 'bold', label: 'Bold' },
      { key: 'italic', label: 'Italic' },
    ], {
      label: 'Formatting actions',
    }),
    {
      state: patternState,
      onStateChange: setPatternState,
    },
  )

  return (
    <>
      <Toolbar data={controller.data} onEvent={controller.onEvent} />
      <output data-testid="controlled-selected">
        {patternState.selectedKeys?.join(',') ?? ''}
      </output>
    </>
  )
}

describe('command surface helpers', () => {
  it('dogfoods SearchActionsToolbar-style toolbar data without manual PatternData wiring', () => {
    render(<SearchActionsToolbarDogfood />)

    expect(screen.getByRole('toolbar', { name: 'Search actions' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Find' }).getAttribute('aria-pressed')).toBe('true')

    fireEvent.click(screen.getByRole('button', { name: 'Replace' }))

    expect(screen.getByRole('button', { name: 'Replace' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('toolbar-selected').textContent).toBe('replace')
  })

  it('creates radio group PatternData from command items and controlled reducer state', () => {
    render(<RadioCommandSurfaceDogfood />)

    expect(screen.getByRole('radiogroup', { name: 'Sort direction' })).toBeTruthy()
    expect(screen.getByRole('radio', { name: 'Descending' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByRole('radio', { name: 'Custom' }).getAttribute('aria-disabled')).toBe('true')

    fireEvent.click(screen.getByRole('radio', { name: 'Ascending' }))

    expect(screen.getByRole('radio', { name: 'Ascending' }).getAttribute('aria-checked')).toBe('true')
    expect(screen.getByTestId('radio-selected').textContent).toBe('ascending')
  })

  it('dogfoods menu button data from a trigger and menu command array', () => {
    render(<MenuButtonCommandSurfaceDogfood />)

    fireEvent.click(screen.getByRole('button', { name: 'Actions' }))

    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'Delete rows' }).getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByTestId('menu-expanded').textContent).toBe('actions')

    fireEvent.click(screen.getByRole('menuitem', { name: 'Paste special' }))

    expect(screen.queryByRole('menu')).toBeNull()
    expect(screen.getByTestId('menu-expanded').textContent).toBe('')
  })

  it('reduces events against the latest data shape instead of stale initial data', () => {
    render(<DynamicToolbarDogfood />)

    fireEvent.click(screen.getByRole('button', { name: 'Advanced' }))
    fireEvent.click(screen.getByRole('button', { name: 'Clear formatting' }))

    expect(screen.getByTestId('dynamic-selected').textContent).toBe('clear')
  })

  it('supports caller-owned reducer state', () => {
    render(<ControlledToolbarDogfood />)

    fireEvent.click(screen.getByRole('button', { name: 'Italic' }))

    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByTestId('controlled-selected').textContent).toBe('italic')
  })

  it('rejects duplicate command keys before rendering invalid PatternData', () => {
    expect(() =>
      createToolbarPatternData([
        { key: 'duplicate', label: 'First' },
        { key: 'duplicate', label: 'Second' },
      ]),
    ).toThrow('command surface keys must be unique')
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { PatternDataSchema, type PatternData } from '../../../../src/react'
import { Toolbar } from './Toolbar'
import { reduceToolbarData } from './toolbarData'
import { ToolbarDemo } from './testing/ToolbarTestHost'
import { initialToolbarData } from './toolbarData'

const commandToolbarData = {
  items: {
    undo: { label: 'Undo' },
    bold: { label: 'Bold' },
    italic: { label: 'Italic' },
    delete: { label: 'Delete' },
  },
  relations: {
    rootKeys: ['undo', 'bold', 'italic', 'delete'],
  },
  state: {
    activeKey: 'undo',
    pressedByKey: { bold: true, italic: false },
  },
  refs: {
    label: 'Mixed actions',
  },
} satisfies PatternData

function MixedToolbarDemo() {
  return <Toolbar data={commandToolbarData} onEvent={() => undefined} />
}

const mixedControlToolbarData = PatternDataSchema.parse({
  items: {
    bold: { label: 'Bold', kind: 'toggleButton' },
    format: { label: 'Number format', kind: 'select' },
    fill: { label: 'Fill color', kind: 'colorInput' },
    more: { label: 'More', kind: 'menuButton' },
  },
  relations: {
    rootKeys: ['bold', 'format', 'fill', 'more'],
  },
  state: {
    activeKey: 'format',
    selectedKeys: ['bold'],
  },
  refs: {
    label: 'Mixed controls',
  },
})

function ToolbarDataDemo({ initialData }: { initialData: PatternData }) {
  const [data, setData] = useState<PatternData>(initialData)
  return <Toolbar data={data} onEvent={(event) => setData((current) => reduceToolbarData(current, event))} />
}

function tabIndexes() {
  return screen.getAllByRole('button').map((el) => el.getAttribute('tabindex'))
}

function activeLabel() {
  const active = screen.getAllByRole('button').find((el) => el.getAttribute('tabindex') === '0')
  return active?.textContent
}

describe('Toolbar demo', () => {
  it('renders a single tabstop initially (roving tabindex)', () => {
    render(<ToolbarDemo />)
    const indexes = tabIndexes()
    expect(indexes.filter((t) => t === '0')).toHaveLength(1)
    expect(indexes[0]).toBe('0')
    expect(activeLabel()).toBe('Bold')
  })

  it('moves focus to the next item on ArrowRight', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight', code: 'ArrowRight' })
    expect(activeLabel()).toBe('Italic')
    expect(tabIndexes().filter((t) => t === '0')).toHaveLength(1)
  })

  it('moves focus to the previous item on ArrowLeft', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight', code: 'ArrowRight' })
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight', code: 'ArrowRight' })
    expect(activeLabel()).toBe('Underline')
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(activeLabel()).toBe('Italic')
  })

  it('jumps to first/last with Home/End', () => {
    render(<ToolbarDemo />)
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'End', code: 'End' })
    expect(activeLabel()).toBe('Align right')
    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'Home', code: 'Home' })
    expect(activeLabel()).toBe('Bold')
    expect(tabIndexes().filter((t) => t === '0')).toHaveLength(1)
  })

  it('supports native controls without projecting button role or pressed state', () => {
    render(<ToolbarDataDemo initialData={mixedControlToolbarData} />)
    const toolbar = screen.getByRole('toolbar')
    const select = screen.getByRole('combobox', { name: 'Number format' })
    const colorInput = screen.getByLabelText('Fill color')
    const menuButton = screen.getByRole('button', { name: 'More' })

    expect(select.getAttribute('role')).toBeNull()
    expect(select.getAttribute('aria-pressed')).toBeNull()
    expect(select.getAttribute('tabindex')).toBe('0')
    expect(colorInput.getAttribute('role')).toBeNull()
    expect(colorInput.getAttribute('aria-pressed')).toBeNull()
    expect(colorInput.getAttribute('tabindex')).toBe('-1')
    expect(menuButton.getAttribute('role')).toBeNull()
    expect(menuButton.getAttribute('aria-pressed')).toBeNull()
    expect(menuButton.getAttribute('aria-haspopup')).toBe('menu')
    expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1)

    fireEvent.keyDown(toolbar, { key: 'ArrowRight', code: 'ArrowRight' })

    expect(screen.getByLabelText('Fill color').getAttribute('tabindex')).toBe('0')
    expect(toolbar.querySelectorAll('[tabindex="0"]')).toHaveLength(1)
  })

  it('omits aria-pressed for command buttons and keeps explicit toggle state', () => {
    render(<MixedToolbarDemo />)

    expect(screen.getByRole('button', { name: 'Undo' }).getAttribute('aria-pressed')).toBeNull()
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Delete' }).getAttribute('aria-pressed')).toBeNull()
  })

  it('skips disabled items during arrow navigation', () => {
    render(<ToolbarDemo data={{ ...initialToolbarData, state: { ...initialToolbarData.state, disabledKeys: ['italic'] } }} />)

    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(activeLabel()).toBe('Underline')
    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-disabled')).toBe('true')
  })

  it('uses enabled boundary items for Home and End', () => {
    render(<ToolbarDemo data={{ ...initialToolbarData, state: { ...initialToolbarData.state, activeKey: 'underline', disabledKeys: ['bold', 'alignRight'] } }} />)

    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'End', code: 'End' })
    expect(activeLabel()).toBe('Align center')

    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'Home', code: 'Home' })
    expect(activeLabel()).toBe('Italic')
  })

  it('keeps active item when the previous candidate is disabled', () => {
    render(<ToolbarDemo data={{ ...initialToolbarData, state: { ...initialToolbarData.state, activeKey: 'italic', disabledKeys: ['bold'] } }} />)

    fireEvent.keyDown(screen.getByRole('toolbar'), { key: 'ArrowLeft', code: 'ArrowLeft' })

    expect(activeLabel()).toBe('Italic')
  })
})

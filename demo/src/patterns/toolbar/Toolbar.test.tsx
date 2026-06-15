import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ToolbarDemo } from './testing/ToolbarTestHost'
import { initialToolbarData } from './toolbarData'

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

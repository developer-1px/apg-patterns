import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { PatternData } from '../../../../src/react'
import { Toolbar } from './Toolbar'
import { ToolbarDemo } from './testing/ToolbarTestHost'

const mixedToolbarData = {
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
  return <Toolbar data={mixedToolbarData} onEvent={() => undefined} />
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

  it('omits aria-pressed for command buttons and keeps explicit toggle state', () => {
    render(<MixedToolbarDemo />)

    expect(screen.getByRole('button', { name: 'Undo' }).getAttribute('aria-pressed')).toBeNull()
    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true')
    expect(screen.getByRole('button', { name: 'Italic' }).getAttribute('aria-pressed')).toBe('false')
    expect(screen.getByRole('button', { name: 'Delete' }).getAttribute('aria-pressed')).toBeNull()
  })
})

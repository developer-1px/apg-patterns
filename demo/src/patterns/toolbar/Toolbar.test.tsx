import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternEvent } from '../../../../src'
import { initialToolbarData, reduceToolbarData } from './toolbarData'
import { Toolbar } from './Toolbar'

function ToolbarDemo() {
  const [data, setData] = useState(initialToolbarData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceToolbarData(current, event))
  return <Toolbar data={data} onEvent={handleEvent} />
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
})

import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useWindowSplitterPattern, type PatternEvent } from '../../../../src'
import { WindowSplitter } from './WindowSplitter'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from './windowsplitterData'

function Demo() {
  const [data, setData] = useState(initialWindowSplitterData)
  const handleEvent = (event: PatternEvent) => {
    setData((current) => reduceWindowSplitterData(current, event, windowSplitterOptions))
  }
  return <WindowSplitter data={data} onEvent={handleEvent} />
}

function ActionsDemo() {
  const [data, setData] = useState(initialWindowSplitterData)
  const splitter = useWindowSplitterPattern(
    data,
    (event) => setData((current) => reduceWindowSplitterData(current, event, windowSplitterOptions)),
    windowSplitterOptions,
  )
  return (
    <div>
      <div {...splitter.separatorProps} />
      <button type="button" onClick={() => splitter.actions.focus()}>Focus separator</button>
      <button type="button" onClick={() => splitter.actions.step('increment')}>Increase separator</button>
      <button type="button" onClick={() => splitter.actions.collapse()}>Collapse separator</button>
    </div>
  )
}

describe('WindowSplitter demo', () => {
  it('renders role=separator with aria-valuemin/max/now and orientation', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    expect(sep.getAttribute('aria-valuemin')).toBe('0')
    expect(sep.getAttribute('aria-valuemax')).toBe('100')
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal')
    expect(sep.getAttribute('aria-controls')).toBe('windowsplitter-primary')
  })

  it('ArrowRight/ArrowLeft change aria-valuenow by ±1', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    fireEvent.keyDown(sep, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(sep.getAttribute('aria-valuenow')).toBe('51')
    fireEvent.keyDown(sep, { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    fireEvent.keyDown(sep, { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(sep.getAttribute('aria-valuenow')).toBe('49')
  })

  it('Home/End jump to min/max', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    fireEvent.keyDown(sep, { key: 'End', code: 'End' })
    expect(sep.getAttribute('aria-valuenow')).toBe('100')
    fireEvent.keyDown(sep, { key: 'Home', code: 'Home' })
    expect(sep.getAttribute('aria-valuenow')).toBe('0')
  })

  it('Enter collapses to min and restores previous value', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    fireEvent.keyDown(sep, { key: 'Enter', code: 'Enter' })
    expect(sep.getAttribute('aria-valuenow')).toBe('0')
    fireEvent.keyDown(sep, { key: 'Enter', code: 'Enter' })
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
  })

  it('imperative actions emit focus, step, and collapse from pointer controls', () => {
    render(<ActionsDemo />)
    const sep = screen.getByRole('separator')
    const controls = screen.getAllByRole('button')

    fireEvent.click(controls[0]!)
    fireEvent.click(controls[1]!)
    expect(sep.getAttribute('aria-valuenow')).toBe('51')

    fireEvent.click(controls[2]!)
    expect(sep.getAttribute('aria-valuenow')).toBe('0')
  })
})

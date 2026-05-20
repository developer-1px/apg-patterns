import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useWindowSplitterPattern, type PatternEvent } from '../../../../src'
import { createWindowSplitterSeparatorProps } from '../../../../src/patterns/windowsplitter/windowSplitterSeparatorProps'
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

function WindowSplitterReducerEdgesDemo() {
  const [data, setData] = useState(initialWindowSplitterData)
  const apply = (event: PatternEvent) => setData((current) => reduceWindowSplitterData(current, event, { focusStrategy: 'rovingTabIndex' }))

  return (
    <div>
      <button type="button" onClick={() => apply({ type: 'focus', key: 'splitter' })}>Focus reducer</button>
      <button type="button" onClick={() => apply({ type: 'valueStep', key: 'splitter', direction: 'unknown' } as unknown as PatternEvent)}>Unknown reducer step</button>
      <button type="button" onClick={() => apply({ type: 'collapse', key: 'splitter' })}>Collapse reducer</button>
      <output data-testid="splitter-value">{String(data.state?.valueByKey?.splitter ?? '')}</output>
    </div>
  )
}

function SeparatorPropsEdgesDemo() {
  const [events, setEvents] = useState<string[]>([])
  const [focused, setFocused] = useState(false)
  const runtime = {
    getPartProps: () => ({ role: 'separator', id: 'edge-separator', onKeyDown: () => undefined }),
    emit: (event: PatternEvent) => setEvents((current) => [...current, `${event.type}:${'key' in event ? event.key ?? '' : ''}`]),
    resolveKeyboardBinding: (input: { key: string }) =>
      input.key === 'ArrowRight'
        ? { preventDefault: false, events: [{ type: 'valueStep', key: 'splitter', direction: 'increment' }] }
        : null,
  }
  const emptyProps = createWindowSplitterSeparatorProps({
    runtime: runtime as never,
    key: null,
    min: 0,
    max: 100,
    options: { orientation: 'diagonal' as never },
  })
  const props = createWindowSplitterSeparatorProps({
    runtime: runtime as never,
    key: 'splitter',
    min: 0,
    max: 100,
    options: { orientation: 'vertical' },
  })

  return (
    <div>
      <div
        {...props}
        onFocus={(event) => {
          props.onFocus?.(event)
          setFocused(true)
        }}
      />
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByRole('separator'), { key: 'A', code: 'KeyA' })}>No binding</button>
      <button type="button" onClick={() => fireEvent.keyDown(screen.getByRole('separator'), { key: 'ArrowRight', code: 'ArrowRight' })}>Emit binding</button>
      <button type="button" onClick={() => fireEvent.focus(screen.getByRole('separator'))}>Focus props</button>
      <output data-testid="empty-props">{String(Object.keys(emptyProps).length)}</output>
      <output data-testid="separator-orientation">{String(props['aria-orientation'] ?? '')}</output>
      <output data-testid="separator-events">{events.join('|')}</output>
      <output data-testid="separator-focused">{String(focused)}</output>
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

  it('covers reducer fallback and no-op branches from pointer controls', () => {
    render(<WindowSplitterReducerEdgesDemo />)

    fireEvent.click(screen.getByRole('button', { name: 'Focus reducer' }))
    expect(screen.getByTestId('splitter-value').textContent).toBe('50')

    fireEvent.click(screen.getByRole('button', { name: 'Unknown reducer step' }))
    expect(screen.getByTestId('splitter-value').textContent).toBe('50')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse reducer' }))
    expect(screen.getByTestId('splitter-value').textContent).toBe('0')
  })

  it('covers separator prop guard branches from pointer controls', () => {
    render(<SeparatorPropsEdgesDemo />)

    expect(screen.getByTestId('empty-props').textContent).toBe('0')
    expect(screen.getByTestId('separator-orientation').textContent).toBe('vertical')

    fireEvent.click(screen.getByRole('button', { name: 'No binding' }))
    expect(screen.getByTestId('separator-events').textContent).toBe('focus:splitter')

    fireEvent.click(screen.getByRole('button', { name: 'Emit binding' }))
    expect(screen.getByTestId('separator-events').textContent).toBe('focus:splitter|focus:splitter|valueStep:splitter')

    fireEvent.click(screen.getByRole('button', { name: 'Focus props' }))
    expect(screen.getByTestId('separator-focused').textContent).toBe('true')
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  reduceWindowSplitterValue,
  resolveWindowSplitterStepValue,
  resolveWindowSplitterValueRange,
  useWindowSplitterPattern,
  type PatternData,
  type PatternEvent,
  type WindowSplitterValueData,
  type WindowSplitterValueState,
} from '../../../../src/react'
import { initialWindowSplitterData, reduceWindowSplitterData, windowSplitterOptions } from './windowsplitterData'
import { WindowSplitterDemo as Demo } from './testing/WindowSplitterTestHost'

const missingControlsData: PatternData = {
  items: {
    splitter: { label: 'Resize panes' },
  },
  relations: {
    rootKeys: ['splitter'],
  },
  state: {
    activeKey: 'splitter',
    valueByKey: { splitter: 50 },
  },
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

function DiagnosticsDemo() {
  const splitter = useWindowSplitterPattern(missingControlsData, () => undefined, windowSplitterOptions)

  return (
    <div>
      <div {...splitter.separatorProps} />
      <output data-testid="diagnostic-code">{splitter.diagnostics[0]?.code ?? ''}</output>
      <output data-testid="controlled-key">{splitter.controlledKey ?? 'none'}</output>
    </div>
  )
}

const spreadsheetResizeOptions = {
  min: 40,
  max: 400,
  step: 8,
  largeStep: 32,
  orientation: 'horizontal',
} as const

function createSpreadsheetResizeData(
  state: WindowSplitterValueState,
): WindowSplitterValueData {
  return {
    items: {
      columnResize: { label: 'Resize column A' },
      columnA: { label: 'Column A' },
    },
    relations: {
      rootKeys: ['columnResize'],
      controlsByKey: { columnResize: ['columnA'] },
    },
    state,
  }
}

function SpreadsheetResizeHandleDemo() {
  const [splitterState, setSplitterState] = useState<WindowSplitterValueState>({
    activeKey: 'columnResize',
    valueByKey: { columnResize: 120 },
  })
  const data = createSpreadsheetResizeData(splitterState)
  const splitter = useWindowSplitterPattern(
    data,
    (event) => setSplitterState((current) =>
      reduceWindowSplitterValue(
        createSpreadsheetResizeData(current),
        event,
        spreadsheetResizeOptions,
      ).state ?? current,
    ),
    spreadsheetResizeOptions,
  )

  return (
    <div>
      <div {...splitter.separatorProps} />
      <output data-testid="column-width">
        {String(splitterState.valueByKey?.columnResize ?? '')}
      </output>
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
  const empty = useWindowSplitterPattern(
    { items: {}, relations: { rootKeys: [] }, state: {} },
    () => undefined,
  )
  const splitter = useWindowSplitterPattern(
    initialWindowSplitterData,
    (event) => setEvents((current) => [...current, `${event.type}:${'key' in event ? event.key ?? '' : ''}`]),
    { ...windowSplitterOptions, orientation: 'vertical' },
  )
  const props = splitter.separatorProps

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
      <output data-testid="empty-props">{String(Object.keys(empty.separatorProps).length)}</output>
      <output data-testid="separator-orientation">{String(props['aria-orientation'] ?? '')}</output>
      <output data-testid="separator-events">{events.join('|')}</output>
      <output data-testid="separator-focused">{String(focused)}</output>
    </div>
  )
}

describe('WindowSplitter demo', () => {
  it('resolves value step ranges, finite clamps, and unbounded max', () => {
    expect(resolveWindowSplitterValueRange({
      min: 40,
      max: Infinity,
      step: 8,
    })).toEqual({
      largeStep: 80,
      max: Infinity,
      min: 40,
      step: 8,
    })
    expect(resolveWindowSplitterStepValue(98, 'incrementLarge', {
      min: 0,
      max: 100,
      step: 1,
      largeStep: 20,
    })).toBe(100)
    expect(resolveWindowSplitterStepValue(120, 'max', {
      min: 40,
      max: Infinity,
      step: 8,
      largeStep: 32,
    })).toBe(120)
  })

  it('connects APG separator props to app-owned spreadsheet resize state', () => {
    render(<SpreadsheetResizeHandleDemo />)
    const sep = screen.getByRole('separator')

    fireEvent.keyDown(sep, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(screen.getByTestId('column-width').textContent).toBe('128')
    expect(sep.getAttribute('aria-valuenow')).toBe('128')

    fireEvent.keyDown(sep, { key: 'PageUp', code: 'PageUp' })
    expect(screen.getByTestId('column-width').textContent).toBe('160')

    fireEvent.keyDown(sep, { key: 'Enter', code: 'Enter' })
    expect(screen.getByTestId('column-width').textContent).toBe('40')

    fireEvent.keyDown(sep, { key: 'Enter', code: 'Enter' })
    expect(screen.getByTestId('column-width').textContent).toBe('160')
  })

  it('renders role=separator with aria-valuemin/max/now and orientation', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    expect(sep.getAttribute('aria-valuemin')).toBe('0')
    expect(sep.getAttribute('aria-valuemax')).toBe('100')
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    expect(sep.getAttribute('aria-orientation')).toBe('horizontal')
    expect(sep.getAttribute('aria-controls')).toBe('windowsplitter-primary')
  })

  it('reports missing controlled pane relations', () => {
    render(<DiagnosticsDemo />)
    const sep = screen.getByRole('separator')

    expect(sep.getAttribute('aria-controls')).toBeNull()
    expect(screen.getByTestId('controlled-key').textContent).toBe('none')
    expect(screen.getByTestId('diagnostic-code').textContent).toBe('windowsplitter.separator.missingControls')
  })

  it('arrow and page keys change aria-valuenow', () => {
    render(<Demo />)
    const sep = screen.getByRole('separator')
    fireEvent.keyDown(sep, { key: 'ArrowRight', code: 'ArrowRight' })
    expect(sep.getAttribute('aria-valuenow')).toBe('51')
    fireEvent.keyDown(sep, { key: 'ArrowLeft', code: 'ArrowLeft' })
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    fireEvent.keyDown(sep, { key: 'ArrowUp', code: 'ArrowUp' })
    expect(sep.getAttribute('aria-valuenow')).toBe('51')
    fireEvent.keyDown(sep, { key: 'ArrowDown', code: 'ArrowDown' })
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
    fireEvent.keyDown(sep, { key: 'PageUp', code: 'PageUp' })
    expect(sep.getAttribute('aria-valuenow')).toBe('60')
    fireEvent.keyDown(sep, { key: 'PageDown', code: 'PageDown' })
    expect(sep.getAttribute('aria-valuenow')).toBe('50')
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

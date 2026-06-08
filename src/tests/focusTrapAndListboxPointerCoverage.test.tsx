import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { registerKernelBuiltins } from '../kernel/kernelBuiltins'
import type { PatternData, PatternDefinition, PatternEvent } from '../schema'
import type { PatternRuntime } from '../kernel/patternRuntime'
import { handlePatternTrapFocus } from '../adapters/reactPatternTrapFocus'
import { handleListboxMultiClick } from '../patterns/listbox/handleListboxMultiClick'

registerKernelBuiltins()

const trapData: PatternData = {
  items: {
    trigger: { label: 'Trigger' },
    dialog: { label: 'Dialog' },
  },
  relations: { rootKeys: ['trigger'], controlsByKey: { trigger: ['dialog'] } },
  state: { activeKey: 'trigger', expandedKeys: ['trigger'] },
}

const trapDefinition: PatternDefinition = {
  apgPattern: 'trap-host',
  rootRole: 'dialog',
  containedRoles: ['button'],
  focusModel: 'focusTrap',
  parts: { dialog: { role: 'dialog' } },
  navigation: { visibleOrder: { kind: 'flat' }, targets: {} },
  keyboard: [],
  effects: [
    { kind: 'trapFocus', when: { kind: 'isExpanded', key: '$activeKey' }, root: { kind: 'controlledBy', key: '$activeKey' } },
  ],
}

function FocusTrapHost() {
  const [result, setResult] = useState('')
  const keyToElementId = (key: string) => `trap-${key}`
  const runTrap = (shiftKey = false) => {
    let prevented = false
    handlePatternTrapFocus({
      event: { key: 'Tab', shiftKey, preventDefault: () => { prevented = true } },
      definition: trapDefinition,
      data: trapData,
      keyToElementId,
    })
    setResult(`${prevented}:${(document.activeElement as HTMLElement | null)?.id ?? ''}`)
  }

  return (
    <div>
      <button id="trap-trigger" type="button">Trigger</button>
      <div id="trap-dialog" role="dialog">
        <button id="first" type="button">First</button>
        <button id="last" type="button">Last</button>
      </div>
      <button type="button" onClick={() => { document.getElementById('last')?.focus(); runTrap() }}>Trap forward</button>
      <button type="button" onClick={() => { document.getElementById('first')?.focus(); runTrap(true) }}>Trap backward</button>
      <button type="button" onClick={() => {
        let prevented = false
        handlePatternTrapFocus({ event: { key: 'ArrowDown', preventDefault: () => { prevented = true } }, definition: trapDefinition, data: trapData, keyToElementId })
        setResult(`${prevented}:${(document.activeElement as HTMLElement | null)?.id ?? ''}`)
      }}>Ignore non-tab</button>
      <button type="button" onClick={() => {
        let prevented = false
        handlePatternTrapFocus({ event: { key: 'Tab', preventDefault: () => { prevented = true } }, definition: { ...trapDefinition, effects: [] }, data: trapData, keyToElementId })
        setResult(`${prevented}:${(document.activeElement as HTMLElement | null)?.id ?? ''}`)
      }}>No trap configured</button>
      <button type="button" onClick={() => {
        let prevented = false
        handlePatternTrapFocus({ event: { key: 'Tab', preventDefault: () => { prevented = true } }, definition: trapDefinition, data: { ...trapData, relations: { rootKeys: ['trigger'], controlsByKey: { trigger: ['empty'] } } }, keyToElementId })
        setResult(`${prevented}:${(document.activeElement as HTMLElement | null)?.id ?? ''}`)
      }}>Empty trap target</button>
      <div id="trap-empty" role="dialog" />
      <output data-testid="trap-result">{result}</output>
    </div>
  )
}

function ListboxPointerHost() {
  const [result, setResult] = useState('')
  const [events, setEvents] = useState<PatternEvent[]>([])
  const makeRuntime = (selectionMode: 'single' | 'multiple', disabledKeys: string[] = []): PatternRuntime => ({
    definition: {} as PatternDefinition,
    data: { items: {}, relations: {}, state: { selectedKeys: ['a'], activeKey: 'a', anchorKey: 'a', disabledKeys } },
    options: { selectionMode },
    visibleKeys: ['a', 'b', 'c'],
    getRootProps: () => ({}),
    getItemProps: () => ({}),
    getPartProps: () => ({}),
    getRootKeyboardHandler: () => () => undefined,
    resolveKeyboardBinding: () => null,
    getItemState: () => ({}),
    keyToElementId: (key) => key,
    emit: (event) => setEvents((current) => [...current, event]),
  })
  const run = (label: string, runtime: PatternRuntime, key: string, eventInit: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}) => {
    let prevented = false
    let stopped = false
    const handled = handleListboxMultiClick(runtime, key, {
      ...eventInit,
      preventDefault: () => { prevented = true },
      stopPropagation: () => { stopped = true },
    } as Parameters<typeof handleListboxMultiClick>[2])
    setResult(`${label}:${handled}:${prevented}:${stopped}`)
  }

  return (
    <div>
      <button type="button" onClick={() => run('single', makeRuntime('single'), 'b')}>Single click path</button>
      <button type="button" onClick={() => run('disabled', makeRuntime('multiple', ['b']), 'b')}>Disabled click path</button>
      <button type="button" onClick={() => run('plain', makeRuntime('multiple'), 'c')}>Plain multi click path</button>
      <button type="button" onClick={() => run('meta', makeRuntime('multiple'), 'b', { metaKey: true })}>Meta click path</button>
      <button type="button" onClick={() => run('shift-miss', makeRuntime('multiple'), 'missing', { shiftKey: true })}>Shift missing range</button>
      <output data-testid="listbox-click-result">{result}</output>
      <output data-testid="listbox-click-events">{events.map((event) => event.type === 'select' ? event.keys.join(',') : event.type).join('|')}</output>
    </div>
  )
}

describe('focus trap and listbox pointer edge coverage', () => {
  it('wraps focus from pointer-triggered Tab trap controls', () => {
    render(<FocusTrapHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Trap forward' }))
    expect(screen.getByTestId('trap-result').textContent).toBe('true:first')

    fireEvent.click(screen.getByRole('button', { name: 'Trap backward' }))
    expect(screen.getByTestId('trap-result').textContent).toBe('true:last')

    fireEvent.click(screen.getByRole('button', { name: 'Ignore non-tab' }))
    expect(screen.getByTestId('trap-result').textContent).toBe('false:last')

    fireEvent.click(screen.getByRole('button', { name: 'No trap configured' }))
    expect(screen.getByTestId('trap-result').textContent).toBe('false:last')

    fireEvent.click(screen.getByRole('button', { name: 'Empty trap target' }))
    expect(screen.getByTestId('trap-result').textContent).toBe('true:last')
  })

  it('covers listbox multi-click edge paths from pointer controls', () => {
    render(<ListboxPointerHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Single click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('single:false:false:false')

    fireEvent.click(screen.getByRole('button', { name: 'Disabled click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('disabled:true:false:false')

    fireEvent.click(screen.getByRole('button', { name: 'Plain multi click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('plain:true:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('c')

    fireEvent.click(screen.getByRole('button', { name: 'Meta click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('meta:true:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('c|a,b')

    fireEvent.click(screen.getByRole('button', { name: 'Shift missing range' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('shift-miss:true:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('c|a,b')
  })
})

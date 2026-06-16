import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { registerKernelBuiltins } from '../kernel/kernelBuiltins'
import type { PatternData, PatternDefinition, PatternEvent } from '../schema'
import { handlePatternTrapFocus } from '../adapters/reactPatternTrapFocus'
import { useListboxPattern } from '../patterns/listbox/useListboxPattern'

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
  const [events, setEvents] = useState('')
  const emittedEvents = useRef<PatternEvent[]>([])
  const listboxData = {
    items: { a: { label: 'Alpha' }, b: { label: 'Beta' }, c: { label: 'Gamma' }, hidden: { label: 'Hidden' } },
    relations: { rootKeys: ['a', 'b', 'c'] },
    state: { selectedKeys: ['a'], activeKey: 'a', anchorKey: 'a' },
  } satisfies PatternData
  const captureEvent = (event: PatternEvent) => emittedEvents.current.push(event)
  const singleListbox = useListboxPattern(listboxData, captureEvent, { selectionMode: 'single' })
  const multiListbox = useListboxPattern(listboxData, captureEvent, { selectionMode: 'multiple' })
  const disabledListbox = useListboxPattern(
    { ...listboxData, state: { ...listboxData.state, disabledKeys: ['b'] } },
    captureEvent,
    { selectionMode: 'multiple' },
  )
  const shiftMissingListbox = useListboxPattern(
    { ...listboxData, state: { ...listboxData.state, anchorKey: 'hidden' } },
    captureEvent,
    { selectionMode: 'multiple' },
  )
  const run = (label: string, item: (typeof singleListbox.renderItems)[number] | undefined, eventInit: { shiftKey?: boolean; ctrlKey?: boolean; metaKey?: boolean } = {}) => {
    emittedEvents.current = []
    let prevented = false
    let stopped = false
    item?.optionProps.onClick?.({
      ...eventInit,
      preventDefault: () => { prevented = true },
      stopPropagation: () => { stopped = true },
    } as never)
    setResult(`${label}:${prevented}:${stopped}`)
    setEvents(emittedEvents.current.map(formatListboxEvent).join('|'))
  }

  return (
    <div>
      <button type="button" onClick={() => run('single', singleListbox.renderItems.find((item) => item.key === 'b'))}>Single click path</button>
      <button type="button" onClick={() => run('disabled', disabledListbox.renderItems.find((item) => item.key === 'b'))}>Disabled click path</button>
      <button type="button" onClick={() => run('plain', multiListbox.renderItems.find((item) => item.key === 'c'))}>Plain multi click path</button>
      <button type="button" onClick={() => run('meta', multiListbox.renderItems.find((item) => item.key === 'b'), { metaKey: true })}>Meta click path</button>
      <button type="button" onClick={() => run('shift-miss', shiftMissingListbox.renderItems.find((item) => item.key === 'c'), { shiftKey: true })}>Shift missing range</button>
      <output data-testid="listbox-click-result">{result}</output>
      <output data-testid="listbox-click-events">{events}</output>
    </div>
  )
}

function formatListboxEvent(event: PatternEvent): string {
  if (event.type === 'select') return event.keys.join(',')
  if ('key' in event) return `${event.type}:${event.key ?? ''}`
  return event.type
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
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('single:false:false')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('focus:b|b')

    fireEvent.click(screen.getByRole('button', { name: 'Disabled click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('disabled:false:false')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Plain multi click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('plain:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('c')

    fireEvent.click(screen.getByRole('button', { name: 'Meta click path' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('meta:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('a,b')

    fireEvent.click(screen.getByRole('button', { name: 'Shift missing range' }))
    expect(screen.getByTestId('listbox-click-result').textContent).toBe('shift-miss:true:true')
    expect(screen.getByTestId('listbox-click-events').textContent).toBe('')
  })
})

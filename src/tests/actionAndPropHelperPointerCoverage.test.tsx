import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { defineDomEvent, defineDomEventHandlerProp, resolvePartEventBindings, withDefaultReason } from '../kernel/domEventBindings'
import { createAlertActions } from '../patterns/alert/alertActions'
import { createButtonRootProps } from '../patterns/button/buttonRootProps'
import { createGridEditInputProps } from '../patterns/grid/gridEditInputProps'
import { getMenuButtonRuntimeState } from '../patterns/menu/menuButtonRuntimeState'
import { createSpinbuttonActions } from '../patterns/spinbutton/spinbuttonActions'
import type { PatternData, PatternEvent } from '../index'

function HelperHost() {
  const [result, setResult] = useState('')
  const [draft, setDraft] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = { emit: (event: PatternEvent) => events.push(event) }
          createAlertActions(runtime as never, null).dismiss()
          createAlertActions(runtime as never, 'alert').dismiss()
          const spin = createSpinbuttonActions(runtime as never)
          spin.focus('spin')
          spin.step('spin', 'increment')
          setResult(events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|'))
        }}
      >
        Run action helpers
      </button>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const runtime = {
            getPartProps: () => ({ role: 'button', id: 'runtime-button' }),
            emit: (event: PatternEvent) => events.push(event),
            resolveKeyboardBinding: (input: { key: string }) =>
              input.key === 'Enter'
                ? { preventDefault: false, events: [{ type: 'activate', key: 'button' }] }
                : null,
          }
          const empty = createButtonRootProps(runtime as never, null)
          const props = createButtonRootProps(runtime as never, 'button')
          fireEvent.focus(screen.getByTestId('button-props-target'))
          props.onFocus?.({} as never)
          const eventBase = {
            altKey: false,
            ctrlKey: false,
            metaKey: false,
            shiftKey: false,
            repeat: false,
            location: 0,
            nativeEvent: { isComposing: false },
            preventDefault: () => undefined,
          }
          props.onKeyDown?.({ ...eventBase, key: 'Escape', code: 'Escape' } as never)
          props.onKeyDown?.({ ...eventBase, key: 'Enter', code: 'Enter' } as never)
          setResult(`${Object.keys(empty).length}|${events.map((event) => event.type).join('|')}`)
        }}
      >
        Run button props
      </button>
      <button data-testid="button-props-target" type="button">Button props target</button>
      <input
        aria-label="Edit value"
        {...createGridEditInputProps({
          key: 'cell',
          editDraftByKey: { cell: draft },
          commitEdit: () => setResult('commit'),
          cancelEdit: () => setResult('cancel'),
          onEvent: (event) => {
            if (event.type === 'editDraft') setDraft(String(event.value))
          },
        })}
      />
      <button
        type="button"
        onClick={() => {
          const empty = getMenuButtonRuntimeState({ items: {}, relations: {}, state: {} })
          setResult([
            empty.triggerKey ?? 'null',
            empty.menuKey ?? 'null',
            String(empty.expanded),
            empty.itemKeys.length,
          ].join('|'))
        }}
      >
        Read empty menu state
      </button>
      <button
        type="button"
        onClick={() => {
          const data: PatternData = { items: { item: { label: 'Item' } }, relations: { rootKeys: ['item'] }, state: { activeKey: 'item' } }
          const events: PatternEvent[] = []
          defineDomEvent('coverage-unknown-test', { handlerProp: 'onCoverageUnknownTest' })
          defineDomEventHandlerProp('coverage-known-test', 'onCoverageKnownTest')
          try {
            resolvePartEventBindings([{ event: 'missing-dom-event' as never, events: [{ type: 'focus', key: '$activeKey' }] }], { data, key: undefined, activeKey: null }, (event) => events.push(event))
          } catch (error) {
            events.push({ type: 'activate', key: (error as Error).message })
          }
          const props = resolvePartEventBindings([
            { event: 'coverage-known-test' as never, events: [{ type: 'focus', key: '$activeKey', meta: { reason: 'keyboard' } }] },
            { event: 'coverage-known-test' as never, events: [{ type: 'activate', key: '$activeKey' }] },
          ], { data, key: undefined, activeKey: null }, (event) => events.push(event))
          props.onCoverageKnownTest?.()
          events.push(withDefaultReason({ type: 'activate', key: 'kept', meta: { reason: 'pointer' } }, 'external'))
          setResult(events.map((event) => `${event.type}:${'key' in event ? String(event.key).slice(0, 18) : ''}:${event.meta?.reason ?? ''}`).join('|'))
        }}
      >
        Resolve dom bindings
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('action and prop helper coverage from pointer input', () => {
  it('covers action, prop, and dom binding helpers through input events', () => {
    render(<HelperHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Run action helpers' }))
    expect(screen.getByText('dismiss:alert|focus:spin|focus:spin|valueStep:spin')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run button props' }))
    expect(screen.getByText('0|focus|activate')).toBeTruthy()

    const input = screen.getByRole('textbox', { name: 'Edit value' })
    fireEvent.change(input, { target: { value: 'draft' } })
    fireEvent.keyDown(input, { key: 'Tab', code: 'Tab' })
    expect(screen.getByText('commit')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'Escape', code: 'Escape' })
    expect(screen.getByText('cancel')).toBeTruthy()
    fireEvent.keyDown(input, { key: 'A', code: 'KeyA' })

    fireEvent.click(screen.getByRole('button', { name: 'Read empty menu state' }))
    expect(screen.getByText('null|null|false|0')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve dom bindings' }))
    expect(screen.getByText(/\[apg-pattern\] unk/)).toBeTruthy()
    expect(screen.getByText(/activate:kept:pointer/)).toBeTruthy()
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import '../kernel/kernelBuiltins'
import { resolveAriaSource, type PatternData, type PatternEvent } from '../index'
import { createGridEditActions, createGridRuntimeEventHandler } from '../patterns/grid/gridRuntimeEvents'
import { resolveMenuButtonKey } from '../patterns/menu/menuButtonKeyboard'
import '../patterns/menu/menuAriaSources'

const menuData = {
  items: {
    file: { label: 'File' },
    edit: { label: 'Edit' },
    help: {},
  },
  relations: { rootKeys: ['file', 'edit', 'help'], childrenByKey: { file: ['new'] } },
  state: { expandedKeys: ['file'] },
} satisfies PatternData

function MenuGridHelperHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setResult([
            resolveMenuButtonKey('ArrowDown', [], null, menuData),
            resolveMenuButtonKey('Home', ['file', 'edit'], null, menuData),
            resolveMenuButtonKey('End', ['file', 'edit'], null, menuData),
            resolveMenuButtonKey('x', ['file', 'edit'], null, menuData),
            resolveMenuButtonKey('h', ['file', 'help'], 'file', menuData),
          ].map(String).join('|'))
        }}
      >
        Resolve menu keys
      </button>
      <button
        type="button"
        onClick={() => {
          setResult([
            resolveAriaSource('menu.hasPopup', { data: menuData, key: undefined, activeKey: null }),
            resolveAriaSource('menu.hasPopup', { data: menuData, key: 'edit', activeKey: 'edit' }),
            resolveAriaSource('menu.expandedIfHasPopup', { data: menuData, key: undefined, activeKey: null }),
            resolveAriaSource('menu.expandedIfHasPopup', { data: menuData, key: 'edit', activeKey: 'edit' }),
            resolveAriaSource('items.kind', { data: menuData, key: undefined, activeKey: null }),
          ].map(String).join('|'))
        }}
      >
        Resolve menu aria
      </button>
      <button
        type="button"
        onClick={() => {
          const events: PatternEvent[] = []
          const handle = createGridRuntimeEventHandler({
            data: { items: { name: { label: 'Name' }, value: { label: 'Value' } }, relations: {}, state: {} },
            editableKeys: ['value'],
            editingKey: null,
            valueByKey: {},
            sortByKey: {},
            onEvent: (event) => events.push(event),
          })
          handle({ type: 'activate', key: 'value' })
          handle({ type: 'dismiss' })
          const emptyActions = createGridEditActions({ editingKey: null, editDraftByKey: {}, onEvent: (event) => events.push(event) })
          emptyActions.commitEdit()
          emptyActions.cancelEdit()
          setResult(events.map((event) => `${event.type}:${'key' in event ? event.key ?? '' : ''}`).join('|'))
        }}
      >
        Run grid helpers
      </button>
      <output>{result}</output>
    </div>
  )
}

describe('menu and grid helper coverage from pointer input', () => {
  it('covers helper branches through button clicks', () => {
    render(<MenuGridHelperHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Resolve menu keys' }))
    expect(screen.getByText('undefined|file|edit|undefined|help')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Resolve menu aria' }))
    expect(screen.getByText('undefined|undefined|undefined|undefined|undefined')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Run grid helpers' }))
    expect(screen.getByText('editStart:value|editEnd:|editEnd:')).toBeTruthy()
  })
})

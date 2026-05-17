import { describe, expect, it } from 'vitest'
import { activeKey, item, press, renderHost, tree } from './keyboardBehaviorHost'

describe('focus strategy', () => {
  it('rovingTabIndex: only active item has tabindex=0', () => {
    renderHost()
    expect(item('docs').tabIndex).toBe(0)
    expect(item('adr').tabIndex).toBe(-1)
    press('ArrowDown')
    expect(item('docs').tabIndex).toBe(-1)
    expect(item('adr').tabIndex).toBe(0)
  })

  it('ariaActiveDescendant: tree tracks active descendant; items do not roam', () => {
    renderHost({ focusStrategy: 'ariaActiveDescendant' })
    expect(tree().tabIndex).toBe(0)
    expect(tree().getAttribute('aria-activedescendant')).toBe('treeitem-docs')
    expect(item('docs').getAttribute('tabindex')).not.toBe('0')
    press('ArrowDown')
    expect(tree().getAttribute('aria-activedescendant')).toBe('treeitem-adr')
  })
})

describe('APG-spec behavior convergence', () => {
  it('B3 — Enter follows itemClickAction', () => {
    const selectModeEvents = renderHost({ itemClickAction: 'select' })
    press('Enter')
    expect(selectModeEvents.find((event) => event.type === 'select')).toBeTruthy()
    expect(selectModeEvents.find((event) => event.type === 'expand')).toBeUndefined()
    document.body.innerHTML = ''
    const toggleModeEvents = renderHost({ itemClickAction: 'toggleExpand' })
    press('Enter')
    expect(toggleModeEvents.find((event) => event.type === 'expand')).toBeTruthy()
    expect(toggleModeEvents.find((event) => event.type === 'select')).toBeUndefined()
  })

  it('M1 — pressing a character jumps by typeahead when typeaheadEnabled', () => {
    const events = renderHost()
    press('r')
    expect(events.find((event) => event.type === 'focus')).toEqual({ type: 'focus', key: 'runtime' })
    expect(activeKey()).toBe('runtime')
  })

  it('M1 — typeahead buffer survives React runtime recreation', () => {
    const events = renderHost()
    press('s')
    press('c')
    expect(events.filter((event) => event.type === 'focus').slice(0, 2)).toEqual([
      { type: 'focus', key: 'schema' },
      { type: 'focus', key: 'schema' },
    ])
    expect(activeKey()).toBe('schema')
  })

  it('M1 — character keys are silent when typeaheadEnabled is false', () => {
    const events = renderHost({ typeaheadEnabled: false })
    press('d')
    expect(events).toHaveLength(0)
  })

  it('B1 — ArrowDown under followFocus emits navigate', () => {
    const events = renderHost({ followFocus: true })
    press('ArrowDown')
    expect(events.find((event) => event.type === 'navigate')).toBeTruthy()
  })
})

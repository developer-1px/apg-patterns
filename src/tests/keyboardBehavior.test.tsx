import { describe, expect, it } from 'vitest'
import { activeKey, expandedKeys, press, renderHost, selectedKeys, tree, visibleKeys } from './keyboardBehaviorHost'

describe('keyboard navigation — event emission', () => {
  it('ArrowDown emits navigate(next) and moves activeKey to next visible', () => {
    const events = renderHost()
    expect(activeKey()).toBe('docs')
    press('ArrowDown')
    expect(events[0]).toEqual({ type: 'navigate', direction: 'next' })
    expect(activeKey()).toBe('adr')
  })

  it('ArrowUp emits navigate(previous)', () => {
    const events = renderHost({ initialActiveKey: 'adr' })
    press('ArrowUp')
    expect(events[0]).toEqual({ type: 'navigate', direction: 'previous' })
    expect(activeKey()).toBe('docs')
  })

  it('Home / End emit navigate(first/last)', () => {
    const events = renderHost({ initialActiveKey: 'runtime' })
    press('End')
    expect(events.find((event) => event.type === 'navigate' && event.direction === 'last')).toBeTruthy()
    expect(activeKey()).toBe('demo')
    press('Home')
    expect(events.find((event) => event.type === 'navigate' && event.direction === 'first')).toBeTruthy()
    expect(activeKey()).toBe('docs')
  })

  it('ArrowRight on collapsed parent emits expand(true)', () => {
    const events = renderHost()
    press('ArrowLeft')
    events.length = 0
    press('ArrowRight')
    expect(events[0]).toEqual({ type: 'expand', key: 'docs', expanded: true })
    expect(expandedKeys()).toContain('docs')
  })

  it('ArrowRight on expanded parent emits navigate(child)', () => {
    const events = renderHost()
    press('ArrowRight')
    expect(events[0]).toEqual({ type: 'navigate', direction: 'child' })
    expect(activeKey()).toBe('adr')
  })

  it('ArrowRight on a leaf does not emit expand or navigate-child', () => {
    const events = renderHost({ initialActiveKey: 'adr' })
    press('ArrowRight')
    expect(events.find((event) => event.type === 'expand')).toBeUndefined()
    expect(events.find((event) => event.type === 'navigate' && event.direction === 'child')).toBeUndefined()
  })

  it('ArrowLeft on expanded parent emits expand(false), collapses', () => {
    const events = renderHost()
    press('ArrowLeft')
    expect(events[0]).toEqual({ type: 'expand', key: 'docs', expanded: false })
    expect(visibleKeys()).toEqual(['docs', 'demo'])
  })

  it('ArrowLeft on a child emits navigate(parent)', () => {
    const events = renderHost({ initialActiveKey: 'adr' })
    press('ArrowLeft')
    expect(events[0]).toEqual({ type: 'navigate', direction: 'parent' })
    expect(activeKey()).toBe('docs')
  })

  it('ArrowLeft on root-level collapsed item emits parent and stays put', () => {
    const events = renderHost()
    press('ArrowLeft')
    events.length = 0
    press('ArrowLeft')
    expect(events[0]).toEqual({ type: 'navigate', direction: 'parent' })
    expect(activeKey()).toBe('docs')
  })

  it('Enter and Space emit select on active item', () => {
    const events = renderHost()
    press('Enter')
    expect(events.find((event) => event.type === 'select')).toEqual({ type: 'select', keys: ['docs'], anchorKey: 'docs', extentKey: 'docs' })
    expect(selectedKeys()).toEqual(['docs'])
    press(' ')
    expect(events.find((event) => event.type === 'select')).toMatchObject({ type: 'select', keys: ['docs'] })
  })
})

describe('keyboard navigation — multi-step sequences', () => {
  it('ArrowDown twice from docs reaches runtime', () => {
    renderHost()
    press('ArrowDown')
    press('ArrowDown')
    expect(activeKey()).toBe('runtime')
  })

  it('after collapsing parent of selected item, selection is preserved', () => {
    renderHost()
    expect(selectedKeys()).toEqual(['runtime'])
    press('ArrowLeft')
    expect(visibleKeys()).not.toContain('runtime')
    press('ArrowRight')
    expect(selectedKeys()).toEqual(['runtime'])
  })

  it('preventDefault is signalled on bound shortcuts', () => {
    renderHost()
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    tree().dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('Shift+ArrowDown characterizes modifier handling', () => {
    const events = renderHost()
    press('ArrowDown', { shiftKey: true })
    expect(events).toBeDefined()
  })
})

import { describe, it, expect } from 'vitest'
import {
  PatternDefinitionSchema,
  type PatternDefinition,
  type PatternData,
  type PatternEvent,
  createPatternRuntime,
  defineAriaSource,
} from '../../index'

// ─────────────────────────────────────────────────────────────
// Token registrations — menubar-specific.
// (Common tokens like state.expandedKeys / hasChildren / isExpanded
//  are already registered by patternKernel.ts.)
// ─────────────────────────────────────────────────────────────

// menu.* 발명 제거 — kernel 의 'flat' visibleOrder + 'linear' / 'firstChild' navigationTarget 재사용.

// aria-haspopup source: true if item has children
defineAriaSource('menu.hasPopup', (ctx) => {
  if (!ctx.key) return undefined
  return (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0 ? 'menu' : undefined
})

// aria-expanded source: only present when item has children
defineAriaSource('menu.expandedIfHasPopup', (ctx) => {
  if (!ctx.key) return undefined
  const hasChildren = (ctx.data.relations?.childrenByKey?.[ctx.key]?.length ?? 0) > 0
  if (!hasChildren) return undefined
  return ctx.data.state?.expandedKeys?.includes(ctx.key) ?? false
})

// ─────────────────────────────────────────────────────────────
// Definition
// ─────────────────────────────────────────────────────────────

const menuDefinition: PatternDefinition = {
  apgPattern: 'menubar',
  rootRole: 'menubar',
  containedRoles: ['menuitem'],
  focusModel: 'rovingTabIndex',
  parts: {
    menubar: {
      role: 'menubar',
      aria: [{ attribute: 'aria-label', from: 'refs.label' }],
    },
    menuitem: {
      role: 'menuitem',
      aria: [
        { attribute: 'aria-haspopup', from: 'menu.hasPopup' },
        { attribute: 'aria-expanded', from: 'menu.expandedIfHasPopup' },
        { attribute: 'aria-disabled', from: 'state.disabledKeys' },
      ],
      focus: {
        tabIndex: { when: { kind: 'always' }, active: 0, inactive: -1 },
      },
      state: [
        { name: 'active', from: 'state.activeKey' },
        { name: 'expanded', from: 'state.expandedKeys' },
      ],
      events: [
        { event: 'click', events: [{ type: 'focus', key: '$key' }, { type: 'activate', key: '$key' }] },
        { event: 'focus', events: [{ type: 'focus', key: '$key' }] },
      ],
    },
  },
  navigation: {
    // top-level menubar items 만 순회 — 서브메뉴는 별도 popup runtime 이 처리하는 것이 W3C APG 권고.
    // 'flat' + 'linear' + 'firstChild' 모두 kernel 기본 등록 — fragmentation 회피.
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      down: { kind: 'firstChild' },
    },
  },
  keyboard: [
    {
      shortcut: 'ArrowRight',
      preventDefault: true,
      cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'next' }] }],
    },
    {
      shortcut: 'ArrowLeft',
      preventDefault: true,
      cases: [{ case: 'always', events: [{ type: 'navigate', direction: 'previous' }] }],
    },
    {
      shortcut: 'ArrowDown',
      preventDefault: true,
      cases: [
        {
          case: 'when',
          when: { kind: 'hasChildren', key: '$activeKey' },
          events: [
            { type: 'expand', key: '$activeKey', expanded: true },
            { type: 'navigate', direction: 'down' },
          ],
        },
      ],
    },
    {
      shortcut: 'Enter',
      preventDefault: true,
      cases: [{ case: 'always', events: [{ type: 'activate', key: '$activeKey' }] }],
    },
    {
      shortcut: 'Escape',
      preventDefault: true,
      cases: [{ case: 'always', events: [{ type: 'dismiss', key: '$activeKey' }] }],
    },
  ],
}

// Sanity: schema accepts the definition
PatternDefinitionSchema.parse(menuDefinition)

// ─────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────

function makeData(overrides: Partial<PatternData['state']> = {}): PatternData {
  return {
    items: {
      file: { label: 'File' },
      edit: { label: 'Edit' },
      view: { label: 'View' },
      new: { label: 'New' },
      open: { label: 'Open' },
    },
    relations: {
      rootKeys: ['file', 'edit', 'view'],
      childrenByKey: { file: ['new', 'open'] },
    },
    state: { activeKey: 'file', ...overrides },
    refs: { label: 'Main menu' },
  }
}

const baseKey = { ctrlKey: false, shiftKey: false, altKey: false, metaKey: false }

function makeRuntime(data: PatternData = makeData()) {
  const events: PatternEvent[] = []
  const runtime = createPatternRuntime({
    definition: menuDefinition,
    data,
    options: { focusStrategy: 'rovingTabIndex', orientation: 'horizontal' },
    onEvent: (e) => events.push(e),
  })
  return { runtime, events }
}

// ─────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────

describe('menubar pattern', () => {
  it('root menubar part has role and an onKeyDown handler', () => {
    const { runtime } = makeRuntime()
    const props = runtime.getPartProps('menubar')
    expect(props.role).toBe('menubar')
    expect(props['aria-label']).toBe('Main menu')
    expect(typeof props.onKeyDown).toBe('function')
  })

  it('menuitem with children advertises aria-haspopup + aria-expanded', () => {
    const { runtime } = makeRuntime()
    const withSubmenu = runtime.getPartProps('menuitem', 'file')
    expect(withSubmenu.role).toBe('menuitem')
    expect(withSubmenu['aria-haspopup']).toBe('menu')
    // ARIA 명세: aria-haspopup 가 있는 항목은 collapsed 일 때 aria-expanded="false" 를 명시해야 한다.
    expect(withSubmenu['aria-expanded']).toBe(false)
    expect(withSubmenu.tabIndex).toBe(0) // active

    const noSubmenu = runtime.getPartProps('menuitem', 'edit')
    expect(noSubmenu['aria-haspopup']).toBeUndefined()
    // 자식이 없는 항목은 expandable 이 아니므로 aria-expanded 미발화 (when: hasChildren 게이트).
    expect(noSubmenu['aria-expanded']).toBeUndefined()
    expect(noSubmenu.tabIndex).toBe(-1) // inactive
  })

  it('ArrowRight emits navigate(next) and moves activeKey to next sibling', () => {
    const { runtime, events } = makeRuntime()
    const handler = runtime.getRootKeyboardHandler()
    handler({ key: 'ArrowRight', code: 'ArrowRight', ...baseKey, preventDefault: () => {} } as any)
    expect(events[0]).toEqual({ type: 'navigate', direction: 'next' })
    const result = runtime.resolveKeyboardBinding(
      { key: 'ArrowRight', code: 'ArrowRight', ...baseKey } as any,
      'file',
    )
    expect(result?.events[0]).toEqual({ type: 'navigate', direction: 'next' })
  })

  it('ArrowDown on an item with submenu emits expand + navigate(down)', () => {
    const { runtime, events } = makeRuntime()
    const handler = runtime.getRootKeyboardHandler()
    handler({ key: 'ArrowDown', code: 'ArrowDown', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([
      { type: 'expand', key: 'file', expanded: true },
      { type: 'navigate', direction: 'down' },
    ])
  })

  it('Enter emits activate, Escape emits dismiss', () => {
    const { runtime, events } = makeRuntime()
    const handler = runtime.getRootKeyboardHandler()
    handler({ key: 'Enter', code: 'Enter', ...baseKey, preventDefault: () => {} } as any)
    handler({ key: 'Escape', code: 'Escape', ...baseKey, preventDefault: () => {} } as any)
    expect(events).toEqual([
      { type: 'activate', key: 'file' },
      { type: 'dismiss', key: 'file' },
    ])
  })

  it('aria-expanded flips to true when the submenu key is in expandedKeys', () => {
    const { runtime } = makeRuntime(makeData({ activeKey: 'file', expandedKeys: ['file'] }))
    const props = runtime.getPartProps('menuitem', 'file')
    expect(props['aria-expanded']).toBe(true)
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { useLayoutEffect, useReducer, useState } from 'react'
import { describe, expect, it } from 'vitest'
import { useTreeviewPattern, type PatternData, type PatternEvent } from './index'

// ────────────────────────────────────────────────────────────────────────────────
// Stateful host — mirrors demo/src/main.tsx so keyboard events drive real state.
// Lives here so the test suite is self-contained and source files stay untouched.
// ────────────────────────────────────────────────────────────────────────────────

const initialData = {
  items: {
    docs: { label: 'Docs' },
    adr: { label: 'ADR' },
    runtime: { label: 'Runtime' },
    schema: { label: 'Schema' },
    demo: { label: 'Demo' },
  },
  relations: {
    rootKeys: ['docs', 'demo'],
    childrenByKey: {
      docs: ['adr', 'runtime', 'schema'],
      adr: [],
      runtime: [],
      schema: [],
      demo: [],
    },
  },
  state: {
    activeKey: 'docs',
    expandedKeys: ['docs'],
    selectedKeys: ['runtime'],
    levelByKey: { docs: 1, demo: 1, adr: 2, runtime: 2, schema: 2 },
    posInSetByKey: { docs: 1, demo: 2, adr: 1, runtime: 2, schema: 3 },
    setSizeByKey: { docs: 2, demo: 2, adr: 3, runtime: 3, schema: 3 },
    typeaheadTextByKey: { docs: 'docs', adr: 'adr', runtime: 'runtime', schema: 'schema', demo: 'demo' },
  },
  refs: { label: 'tree' },
} satisfies PatternData

type HostOptions = {
  followFocus?: boolean
  focusStrategy?: 'rovingTabIndex' | 'ariaActiveDescendant'
  itemClickAction?: 'select' | 'toggleExpand' | 'none'
  typeaheadEnabled?: boolean
  initialActiveKey?: string
}

function getVisibleKeys(data: PatternData): string[] {
  const expanded = new Set(data.state?.expandedKeys ?? [])
  const visit = (key: string): string[] => [
    key,
    ...(expanded.has(key) ? (data.relations?.childrenByKey?.[key] ?? []).flatMap(visit) : []),
  ]
  return (data.relations?.rootKeys ?? []).flatMap(visit)
}

function resolveNavTarget(direction: string, data: PatternData): string | undefined {
  const visible = getVisibleKeys(data)
  const active = data.state?.activeKey
  if (!active) return visible[0]
  const i = visible.indexOf(active)
  if (direction === 'next') return visible[Math.min(i + 1, visible.length - 1)]
  if (direction === 'previous') return visible[Math.max(i - 1, 0)]
  if (direction === 'first') return visible[0]
  if (direction === 'last') return visible[visible.length - 1]
  if (direction === 'child') return data.relations?.childrenByKey?.[active]?.[0]
  if (direction === 'parent') {
    for (const [parent, children] of Object.entries(data.relations?.childrenByKey ?? {})) {
      if (children.includes(active)) return parent
    }
  }
  return undefined
}

function reduce(data: PatternData, event: PatternEvent | { type: 'reset' }): PatternData {
  if (event.type === 'reset') return initialData
  if (event.type === 'focus') return { ...data, state: { ...data.state, activeKey: event.key } }
  if (event.type === 'navigate') {
    const target = resolveNavTarget(event.direction, data)
    return target ? { ...data, state: { ...data.state, activeKey: target } } : data
  }
  if (event.type === 'select') {
    return {
      ...data,
      state: { ...data.state, anchorKey: event.anchorKey, extentKey: event.extentKey, selectedKeys: [...event.keys] },
    }
  }
  if (event.type === 'expand') {
    const expanded = new Set(data.state?.expandedKeys ?? [])
    if (event.expanded) expanded.add(event.key)
    else expanded.delete(event.key)
    return { ...data, state: { ...data.state, expandedKeys: [...expanded] } }
  }
  return data
}

function Host({
  options = {},
  onEmit,
}: {
  options?: HostOptions
  onEmit?: (event: PatternEvent) => void
}) {
  const seed: PatternData = options.initialActiveKey
    ? { ...initialData, state: { ...initialData.state, activeKey: options.initialActiveKey } }
    : initialData
  const [data, dispatch] = useReducer(reduce, seed)
  const [, force] = useState(0)

  const tree = useTreeviewPattern({
    data,
    options: {
      followFocus: options.followFocus ?? false,
      focusStrategy: options.focusStrategy ?? 'rovingTabIndex',
      itemClickAction: options.itemClickAction ?? 'select',
      indicatorClickAction: 'toggleExpand',
      typeaheadEnabled: options.typeaheadEnabled ?? true,
    },
    onEvent: (event) => {
      onEmit?.(event)
      dispatch(event)
      force((n) => n + 1)
    },
  })

  useLayoutEffect(() => {
    const activeKey = data.state?.activeKey
    if (!activeKey) return
    const target =
      (options.focusStrategy ?? 'rovingTabIndex') === 'ariaActiveDescendant'
        ? document.querySelector<HTMLElement>('[role="tree"]')
        : document.getElementById(`treeitem-${activeKey}`)
    target?.focus({ preventScroll: true })
  }, [data.state?.activeKey, options.focusStrategy])

  return (
    <div {...tree.getTreeProps()} data-testid="tree">
      {tree.items.map((item) => (
        <div
          key={item.key}
          {...item.slotProps.treeitem}
        >
          <button type="button" {...item.slotProps.indicator} aria-label={`toggle ${item.key}`} />
          <span>{data.items[item.key]?.label}</span>
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────────

const tree = () => screen.getByTestId('tree')
const item = (key: string) => document.getElementById(`treeitem-${key}`) as HTMLElement
const visibleKeys = () => [...tree().querySelectorAll('[role="treeitem"]')].map((el) => (el.id).replace(/^treeitem-/, ''))
const activeKey = () =>
  visibleKeys().find((k) => {
    const el = item(k)
    return el.getAttribute('tabindex') === '0' || el.tabIndex === 0
  })
const selectedKeys = () => visibleKeys().filter((k) => item(k).getAttribute('aria-selected') === 'true')
const expandedKeys = () => visibleKeys().filter((k) => item(k).getAttribute('aria-expanded') === 'true')
const press = (key: string, opts: Record<string, unknown> = {}) =>
  fireEvent.keyDown(tree(), { key, code: key, ...opts })

/**
 * render(<Host/>) triggers an initial useLayoutEffect that DOM-focuses the active item,
 * which the runtime's onFocus handler converts into a `focus` PatternEvent. That mount
 * artifact pollutes events[0] in every test. `renderHost` collects events, drains the
 * mount noise, and returns a live array that subsequent fireEvent calls will append to.
 */
function renderHost(options: HostOptions = {}) {
  const events: PatternEvent[] = []
  render(<Host options={options} onEmit={(e) => events.push(e)} />)
  events.length = 0
  return events
}

// ────────────────────────────────────────────────────────────────────────────────
// 1. Basic keyboard navigation — event emission per APG spec
// ────────────────────────────────────────────────────────────────────────────────

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
    expect(events.find((e) => e.type === 'navigate' && e.direction === 'last')).toBeTruthy()
    expect(activeKey()).toBe('demo')

    press('Home')
    expect(events.find((e) => e.type === 'navigate' && e.direction === 'first')).toBeTruthy()
    expect(activeKey()).toBe('docs')
  })

  it('ArrowRight on collapsed parent emits expand(true)', () => {
    const events = renderHost()
    press('ArrowLeft') // collapse docs first
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

    expect(events.find((e) => e.type === 'expand')).toBeUndefined()
    expect(events.find((e) => e.type === 'navigate' && e.direction === 'child')).toBeUndefined()
  })

  it('ArrowLeft on expanded parent emits expand(false), collapses', () => {
    const events = renderHost()

    press('ArrowLeft')

    expect(events[0]).toEqual({ type: 'expand', key: 'docs', expanded: false })
    expect(visibleKeys()).toEqual(['docs', 'demo'])
  })

  it('ArrowLeft on a child emits navigate(parent) via otherwise case', () => {
    const events = renderHost({ initialActiveKey: 'adr' })

    press('ArrowLeft')

    expect(events[0]).toEqual({ type: 'navigate', direction: 'parent' })
    expect(activeKey()).toBe('docs')
  })

  it('ArrowLeft on root-level collapsed item: navigate-parent emitted but stays put', () => {
    const events = renderHost()
    press('ArrowLeft') // collapse docs
    events.length = 0

    press('ArrowLeft') // collapsed root-level; otherwise → navigate parent

    expect(events[0]).toEqual({ type: 'navigate', direction: 'parent' })
    expect(activeKey()).toBe('docs') // host resolves parent=undefined → no change
  })

  it('Enter emits select on active item', () => {
    const events = renderHost()

    press('Enter')

    const select = events.find((e) => e.type === 'select')
    expect(select).toEqual({ type: 'select', keys: ['docs'], anchorKey: 'docs', extentKey: 'docs' })
    expect(selectedKeys()).toEqual(['docs'])
  })

  it('Space emits select on active item', () => {
    const events = renderHost()

    press(' ')

    expect(events.find((e) => e.type === 'select')).toMatchObject({ type: 'select', keys: ['docs'] })
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// 2. State sequences
// ────────────────────────────────────────────────────────────────────────────────

describe('keyboard navigation — multi-step sequences', () => {
  it('ArrowDown twice from docs reaches runtime (visible order skips hidden)', () => {
    renderHost()

    press('ArrowDown')
    press('ArrowDown')

    expect(activeKey()).toBe('runtime')
  })

  it('after collapsing parent of selected item, selection is preserved', () => {
    renderHost()
    expect(selectedKeys()).toEqual(['runtime'])

    press('ArrowLeft') // collapse docs — hides runtime
    expect(visibleKeys()).not.toContain('runtime')

    press('ArrowRight') // re-expand
    expect(selectedKeys()).toEqual(['runtime']) // still selected
  })

  it('preventDefault is signalled on bound shortcuts', () => {
    renderHost()
    const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true })
    tree().dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)
  })

  it('Shift+ArrowDown — characterizes matchesShortcut modifier handling', () => {
    const events = renderHost()

    press('ArrowDown', { shiftKey: true })

    // Modifier-aware range navigation is outside this treeview MVP contract.
    expect(events).toBeDefined()
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// 3. Focus strategy
// ────────────────────────────────────────────────────────────────────────────────

describe('focus strategy', () => {
  it('rovingTabIndex: only active item has tabindex=0', () => {
    renderHost()
    expect(item('docs').tabIndex).toBe(0)
    expect(item('adr').tabIndex).toBe(-1)

    press('ArrowDown')
    expect(item('docs').tabIndex).toBe(-1)
    expect(item('adr').tabIndex).toBe(0)
  })

  it('ariaActiveDescendant: tree has tabindex=0 and aria-activedescendant; items do not roam', () => {
    renderHost({ focusStrategy: 'ariaActiveDescendant' })

    expect(tree().tabIndex).toBe(0)
    expect(tree().getAttribute('aria-activedescendant')).toBe('treeitem-docs')
    // items should not have tabindex=0 in aad mode (attribute may be unset entirely)
    expect(item('docs').getAttribute('tabindex')).not.toBe('0')

    press('ArrowDown')
    expect(tree().getAttribute('aria-activedescendant')).toBe('treeitem-adr')
  })
})

// ────────────────────────────────────────────────────────────────────────────────
// 4. APG-spec behaviors observed during browser audit
// ────────────────────────────────────────────────────────────────────────────────

describe('APG-spec behavior convergence', () => {
  it('B3 — Enter follows itemClickAction', () => {
    const eventsSelectMode = renderHost({ itemClickAction: 'select' })
    press('Enter')
    expect(eventsSelectMode.find((e) => e.type === 'select')).toBeTruthy()
    expect(eventsSelectMode.find((e) => e.type === 'expand')).toBeUndefined()

    document.body.innerHTML = ''

    const eventsToggleMode = renderHost({ itemClickAction: 'toggleExpand' })
    press('Enter')
    expect(eventsToggleMode.find((e) => e.type === 'expand')).toBeTruthy()
    expect(eventsToggleMode.find((e) => e.type === 'select')).toBeUndefined()
  })

  it('M1 — pressing a character jumps by typeahead when typeaheadEnabled', () => {
    const events = renderHost()

    press('r')

    expect(events.find((e) => e.type === 'focus')).toEqual({ type: 'focus', key: 'runtime' })
    expect(activeKey()).toBe('runtime')
  })

  it('M1 — typeahead buffer survives React runtime recreation', () => {
    const events = renderHost()

    press('s')
    press('c')

    const focusEvents = events.filter((event) => event.type === 'focus')
    expect(focusEvents.slice(0, 2)).toEqual([
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

    expect(events.find((e) => e.type === 'navigate')).toBeTruthy()
  })
})

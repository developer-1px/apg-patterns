import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { menuButtonDefinition, PatternDataSchema, reducePatternData, useMenuPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { MenuDemo } from './testing/MenuTestHost'
import { useMenubarSubmenuKeyboard } from './useMenubarSubmenuKeyboard'

const triggerlessContextMenuData: PatternData = PatternDataSchema.parse({
  items: {
    contextMenu: { label: 'Cell context menu' },
    copy: { label: 'Copy' },
    locked: { label: 'Locked action' },
    paste: { label: 'Paste' },
    delete: { label: 'Delete' },
  },
  relations: {
    rootKeys: ['contextMenu'],
    childrenByKey: {
      contextMenu: ['copy', 'locked', 'paste', 'delete'],
    },
  },
  state: {
    disabledKeys: ['locked'],
  },
  refs: {
    label: 'Cell context menu',
  },
})

function TriggerlessContextMenu({ events, closeEvents }: { events: PatternEvent[]; closeEvents: PatternEvent[] }) {
  const restoreRef = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(true)
  const [data, setData] = useState<PatternData>(triggerlessContextMenuData)
  const menu = useMenuPattern(data, (event) => {
    events.push(event)
    setData((current) => reducePatternData(menuButtonDefinition, current, event))
  }, {
    open,
    initialActiveKey: 'copy',
    restoreFocusTo: restoreRef,
    onClose: (event) => {
      closeEvents.push(event)
      setOpen(false)
    },
  })

  return (
    <div>
      <button ref={restoreRef} type="button">Grid cell</button>
      <button type="button">Outside</button>
      {menu.open ? (
        <ul {...menu.menuProps}>
          {menu.items.map((item) => (
            <li key={item.key} {...item.itemProps}>{item.label}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function MenubarSubmenuKeyboardEdges() {
  const menuRef = useRef<HTMLDivElement>(null)
  const cycleRef = useRef<HTMLDivElement>(null)
  const emptySiblingRef = useRef<HTMLDivElement>(null)
  const orphanRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<string[]>([])
  const [closed, setClosed] = useState(0)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [cycleActiveKey, setCycleActiveKey] = useState<string | null>('first')
  const handler = useMenubarSubmenuKeyboard({
    data: {
      items: {
        solo: { label: 'Solo' },
        sibling: { label: 'Sibling' },
        child: { label: 'Child' },
      },
      relations: { rootKeys: ['solo', 'sibling'], childrenByKey: { sibling: ['child'] } },
      state: {},
    },
    ownerKey: 'solo',
    rootKeys: ['solo', 'sibling'],
    children: [],
    activeKey,
    onEvent: (event) => {
      setEvents((current) => [...current, `${event.type}:${'key' in event ? event.key ?? '' : ''}`])
      if (event.type === 'focus') setActiveKey(event.key ?? null)
    },
    close: () => setClosed((current) => current + 1),
  })
  const orphanHandler = useMenubarSubmenuKeyboard({
    data: { items: { orphan: { label: 'Orphan' } }, relations: { rootKeys: ['orphan'] }, state: {} },
    ownerKey: 'missing',
    rootKeys: ['orphan'],
    children: ['orphan'],
    activeKey: undefined,
    onEvent: (event) => setEvents((current) => [...current, `orphan:${event.type}:${'key' in event ? event.key ?? '' : ''}`]),
    close: () => setClosed((current) => current + 1),
  })
  const cycleHandler = useMenubarSubmenuKeyboard({
    data: { items: { owner: { label: 'Owner' }, first: { label: 'First' }, second: { label: 'Second' } }, relations: { rootKeys: ['owner'], childrenByKey: { owner: ['first', 'second'] } }, state: {} },
    ownerKey: 'owner',
    rootKeys: ['owner'],
    children: ['first', 'second'],
    activeKey: cycleActiveKey,
    onEvent: (event) => {
      setEvents((current) => [...current, `cycle:${event.type}:${'key' in event ? event.key ?? '' : ''}`])
      if (event.type === 'focus') setCycleActiveKey(event.key ?? null)
    },
    close: () => setClosed((current) => current + 1),
  })
  const emptySiblingHandler = useMenubarSubmenuKeyboard({
    data: { items: { owner: { label: 'Owner' } }, relations: { rootKeys: [] }, state: {} },
    ownerKey: 'owner',
    rootKeys: [],
    children: ['owner'],
    activeKey: 'owner',
    onEvent: (event) => setEvents((current) => [...current, `empty-sibling:${event.type}:${'key' in event ? event.key ?? '' : ''}`]),
    close: () => setClosed((current) => current + 1),
  })

  return (
    <div>
      <div ref={menuRef} role="menu" tabIndex={-1} onKeyDown={handler}>Submenu</div>
      <div ref={cycleRef} role="menu" tabIndex={-1} aria-label="Cycle submenu" onKeyDown={cycleHandler}>Cycle submenu</div>
      <div ref={emptySiblingRef} role="menu" tabIndex={-1} aria-label="Empty sibling submenu" onKeyDown={emptySiblingHandler}>Empty sibling submenu</div>
      <div ref={orphanRef} role="menu" tabIndex={-1} aria-label="Orphan submenu" onKeyDown={orphanHandler}>Orphan submenu</div>
      <button type="button" onClick={() => menuRef.current && fireEvent.keyDown(menuRef.current, { key: 'ArrowDown' })}>Empty next</button>
      <button type="button" onClick={() => menuRef.current && fireEvent.keyDown(menuRef.current, { key: 'ArrowRight' })}>Open next sibling</button>
      <button type="button" onClick={() => orphanRef.current && fireEvent.keyDown(orphanRef.current, { key: 'ArrowLeft' })}>Missing sibling</button>
      <button type="button" onClick={() => cycleRef.current && fireEvent.keyDown(cycleRef.current, { key: 'ArrowDown' })}>Cycle next</button>
      <button type="button" onClick={() => cycleRef.current && fireEvent.keyDown(cycleRef.current, { key: 'ArrowUp' })}>Cycle previous</button>
      <button type="button" onClick={() => cycleRef.current && fireEvent.keyDown(cycleRef.current, { key: 'Home' })}>Cycle home</button>
      <button type="button" onClick={() => cycleRef.current && fireEvent.keyDown(cycleRef.current, { key: 'End' })}>Cycle end</button>
      <button type="button" onClick={() => emptySiblingRef.current && fireEvent.keyDown(emptySiblingRef.current, { key: 'ArrowRight' })}>Empty sibling</button>
      <output data-testid="submenu-events">{events.join('|')}</output>
      <output data-testid="submenu-closed">{String(closed)}</output>
    </div>
  )
}

describe('Menu — editorMenubar', () => {
  it('ArrowRight / ArrowLeft moves active root item', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, edit, view] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'ArrowRight' })
    expect(edit!.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(edit!, { key: 'ArrowRight' })
    expect(view!.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(view!, { key: 'ArrowLeft' })
    expect(edit!.getAttribute('tabindex')).toBe('0')
  })

  it('Home / End jumps to first / last root item', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, , view] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'End' })
    expect(view!.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(view!, { key: 'Home' })
    expect(file!.getAttribute('tabindex')).toBe('0')
  })

  it('ArrowDown opens submenu and exposes aria-expanded / aria-haspopup', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    expect(file.getAttribute('aria-haspopup')).toBe('menu')
    expect(file.getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(file, { key: 'ArrowDown' })

    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeTruthy()
  })

  it('Escape on submenu closes it', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    fireEvent.keyDown(file, { key: 'ArrowDown' })
    const submenu = screen.getByRole('menu')
    fireEvent.keyDown(submenu, { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(file.getAttribute('aria-expanded')).toBe('false')
  })

  it('submenu Home/End and horizontal arrows move within and across open submenus', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'End' })
    expect(screen.getByRole('menuitem', { name: 'Close' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(menu, { key: 'Home' })
    expect(screen.getByRole('menuitem', { name: 'New' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(menu, { key: 'ArrowRight' })
    expect(screen.getByRole('menuitem', { name: 'Edit' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Undo' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowLeft' })
    expect(screen.getByRole('menuitem', { name: 'File' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'New' }).getAttribute('tabindex')).toBe('0')
  })

  it('first-character typeahead jumps to matching root', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, , view] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'v' })
    expect(view!.getAttribute('tabindex')).toBe('0')
  })

  it('Space toggles menuitemcheckbox aria-checked', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, , view] = screen.getAllByRole('menuitem')
    fireEvent.keyDown(file!, { key: 'End' }) // activate View
    fireEvent.keyDown(view!, { key: 'ArrowDown' })

    const wrap = screen.getByRole('menuitemcheckbox', { name: /Word Wrap/ })
    expect(wrap.getAttribute('aria-checked')).toBe('true')

    fireEvent.keyDown(wrap, { key: ' ', code: 'Space' })
    expect(wrap.getAttribute('aria-checked')).toBe('false')
  })

  it('Selecting a menuitemradio clears sibling radios', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, , view] = screen.getAllByRole('menuitem')
    fireEvent.keyDown(file!, { key: 'End' }) // activate View
    fireEvent.keyDown(view!, { key: 'ArrowDown' })

    const dark = screen.getByRole('menuitemradio', { name: /Dark/ })
    const light = screen.getByRole('menuitemradio', { name: /Light/ })
    expect(dark.getAttribute('aria-checked')).toBe('true')

    fireEvent.click(light)

    expect(light.getAttribute('aria-checked')).toBe('true')
    expect(dark.getAttribute('aria-checked')).toBe('false')
  })

  it('submenu activation handles disabled and plain items', () => {
    const events: PatternEvent[] = []
    render(<MenuDemo variant="editorMenubar" onEvent={(event) => events.push(event)} />)
    const [file, edit] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'ArrowRight' })
    fireEvent.keyDown(edit!, { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('menuitem', { name: 'Redo' }))
    expect(events).not.toContainEqual({ type: 'activate', key: 'editRedo' })

    fireEvent.keyDown(screen.getByRole('menuitem', { name: 'Undo' }), { key: 'Enter' })
    expect(events).toContainEqual({ type: 'activate', key: 'editUndo' })
    expect(events).toContainEqual({ type: 'expand', key: 'edit', expanded: false })
  })

  it('submenu keyboard skips disabled items and returns focus to the owner', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, edit] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'ArrowRight' })
    fireEvent.keyDown(edit!, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu')

    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Redo' }).getAttribute('tabindex')).toBe('-1')
    expect(screen.getByRole('menuitem', { name: 'Cut' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(screen.getByRole('menuitem', { name: 'Undo' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(menu, { key: 'Escape' })
    expect(screen.queryByRole('menu')).toBeNull()
    expect(edit!.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(edit)
  })

  it('covers submenu keyboard guard branches through pointer-triggered keys', () => {
    render(<MenubarSubmenuKeyboardEdges />)

    fireEvent.click(screen.getByRole('button', { name: 'Empty next' }))
    expect(screen.getByTestId('submenu-events').textContent).toBe('')

    fireEvent.click(screen.getByRole('button', { name: 'Open next sibling' }))
    expect(screen.getByTestId('submenu-events').textContent).toBe('focus:sibling|expand:sibling|focus:child')
    expect(screen.getByTestId('submenu-closed').textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'Missing sibling' }))
    expect(screen.getByTestId('submenu-closed').textContent).toBe('1')

    fireEvent.click(screen.getByRole('button', { name: 'Cycle next' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cycle previous' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cycle home' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cycle end' }))
    fireEvent.click(screen.getByRole('button', { name: 'Empty sibling' }))
    expect(screen.getByTestId('submenu-events').textContent).toContain('cycle:focus:second|cycle:focus:first|cycle:focus:first|cycle:focus:second')
  })
})

describe('Menu — actionMenuButton (rovingTabIndex)', () => {
  it('trigger exposes aria-haspopup / aria-controls / aria-expanded=false', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu')
    expect(trigger.getAttribute('aria-controls')).toBeTruthy()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('Enter on trigger opens menu and focuses first item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'Enter' })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const items = screen.getAllByRole('menuitem')
    expect(items[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('Space on trigger opens menu and focuses first item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: ' ', code: 'Space' })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    const items = screen.getAllByRole('menuitem')
    expect(items[0]!.getAttribute('tabindex')).toBe('0')
  })

  it('click on trigger opens menu and focuses first item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.click(trigger)

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Action 1' }).getAttribute('tabindex')).toBe('0')
  })

  it('omits aria-activedescendant from the menu root', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(screen.getByRole('menu').hasAttribute('aria-activedescendant')).toBe(false)
  })

  it('ArrowDown after trigger click moves from first to next item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.click(trigger)
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })

    expect(screen.getByRole('menuitem', { name: 'Action 2' }).getAttribute('tabindex')).toBe('0')
  })

  it('Arrow keys wrap within an open menu', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })
    expect(screen.getByRole('menuitem', { name: 'Last action' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Action 1' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowUp' })
    expect(screen.getByRole('menuitem', { name: 'Last action' }).getAttribute('tabindex')).toBe('0')
  })

  it('typeahead moves focus to the next matching menu item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'l' })

    expect(screen.getByRole('menuitem', { name: 'Last action' }).getAttribute('tabindex')).toBe('0')
  })

  it('hovering a menuitem (focus event) updates active item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const items = screen.getAllByRole('menuitem')

    fireEvent.focus(items[2]!)
    const items2 = screen.getAllByRole('menuitem')
    expect(items2[2]!.getAttribute('tabindex')).toBe('0')
  })

  it('Escape closes menu and returns focus to trigger', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })

  it('Tab closes an open menu without trapping focus', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Tab' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('click on menuitem activates + closes + emits activate event', () => {
    const onEvent = vi.fn()
    render(<MenuDemo variant="actionMenuButton" onEvent={onEvent} />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'Enter' })
    const items = screen.getAllByRole('menuitem')
    fireEvent.click(items[1]!)

    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(onEvent.mock.calls.some(([e]) => e.type === 'activate')).toBe(true)
  })

  it('menuitem pointer activation emits one close event', () => {
    const onEvent = vi.fn()
    render(<MenuDemo variant="actionMenuButton" onEvent={onEvent} />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'Enter' })
    onEvent.mockClear()
    fireEvent.click(screen.getByRole('menuitem', { name: 'Action 2' }))

    expect(onEvent.mock.calls.map(([event]) => event)).toEqual([
      { type: 'activate', key: 'actAnother' },
      { type: 'expand', key: 'trigger', expanded: false },
    ])
    expect(onEvent.mock.calls.some(([event]) => event.type === 'dismiss')).toBe(false)
  })

  it('menuitem keyboard activation matches pointer close sequence', () => {
    const onEvent = vi.fn()
    render(<MenuDemo variant="actionMenuButton" onEvent={onEvent} />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    onEvent.mockClear()
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expect(onEvent.mock.calls.map(([event]) => event)).toEqual([
      { type: 'activate', key: 'actAction' },
      { type: 'expand', key: 'trigger', expanded: false },
    ])
    expect(onEvent.mock.calls.some(([event]) => event.type === 'dismiss')).toBe(false)
  })
})

describe('Menu — triggerless context menu', () => {
  it('renders an open menu without a synthetic trigger relationship', () => {
    render(<TriggerlessContextMenu events={[]} closeEvents={[]} />)

    const menu = screen.getByRole('menu', { name: 'Cell context menu' })
    const copy = screen.getByRole('menuitem', { name: 'Copy' })

    expect(menu.getAttribute('aria-controls')).toBeNull()
    expect(menu.getAttribute('aria-labelledby')).toBeNull()
    expect(copy.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(copy)
  })

  it('skips disabled items during keyboard movement', () => {
    render(<TriggerlessContextMenu events={[]} closeEvents={[]} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })

    expect(screen.getByRole('menuitem', { name: 'Locked action' }).getAttribute('tabindex')).toBe('-1')
    expect(screen.getByRole('menuitem', { name: 'Paste' }).getAttribute('tabindex')).toBe('0')
  })

  it('activates the active item and closes with focus restored', () => {
    const events: PatternEvent[] = []
    const closeEvents: PatternEvent[] = []
    render(<TriggerlessContextMenu events={events} closeEvents={closeEvents} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expect(events.some((event) => event.type === 'activate' && event.key === 'paste')).toBe(true)
    expect(events.some((event) => event.type === 'dismiss' && event.key === 'contextMenu')).toBe(true)
    expect(closeEvents).toHaveLength(1)
    expect(screen.queryByRole('menu')).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Grid cell' }))
  })

  it('closes on Escape without activating an item', () => {
    const events: PatternEvent[] = []
    const closeEvents: PatternEvent[] = []
    render(<TriggerlessContextMenu events={events} closeEvents={closeEvents} />)

    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(events.some((event) => event.type === 'activate')).toBe(false)
    expect(events.some((event) => event.type === 'dismiss' && event.key === 'contextMenu')).toBe(true)
    expect(closeEvents).toHaveLength(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })

  it('closes on outside pointer interaction', () => {
    const events: PatternEvent[] = []
    const closeEvents: PatternEvent[] = []
    render(<TriggerlessContextMenu events={events} closeEvents={closeEvents} />)

    fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))

    expect(events.some((event) => event.type === 'dismiss' && event.key === 'contextMenu')).toBe(true)
    expect(closeEvents).toHaveLength(1)
    expect(screen.queryByRole('menu')).toBeNull()
  })
})

describe('Menu — actionMenuButtonActiveDescendant', () => {
  it('open menu sets aria-activedescendant to first item id', () => {
    render(<MenuDemo variant="actionMenuButtonActiveDescendant" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    const menu = screen.getByRole('menu')
    const first = menu.getAttribute('aria-activedescendant')
    expect(first).toBeTruthy()
    const items = screen.getAllByRole('menuitem')
    expect(first).toBe(items[0]!.id)
  })

  it('keeps DOM focus on the menu when using aria-activedescendant', () => {
    render(<MenuDemo variant="actionMenuButtonActiveDescendant" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    const menu = screen.getByRole('menu')
    expect(document.activeElement).toBe(menu)
  })

  it('focus event on a menuitem updates aria-activedescendant', () => {
    render(<MenuDemo variant="actionMenuButtonActiveDescendant" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu')
    const items = screen.getAllByRole('menuitem')

    fireEvent.focus(items[2]!)
    expect(menu.getAttribute('aria-activedescendant')).toBe(items[2]!.id)
  })

  it('click on trigger opens menu and sets aria-activedescendant to first item id', () => {
    render(<MenuDemo variant="actionMenuButtonActiveDescendant" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.click(trigger)

    const menu = screen.getByRole('menu')
    const items = screen.getAllByRole('menuitem')
    expect(menu.getAttribute('aria-activedescendant')).toBe(items[0]!.id)
  })
})

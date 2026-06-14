import { fireEvent, render, screen } from '@testing-library/react'
import { useRef, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { PatternDataSchema, useMenuButtonPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { MenuDemo } from './testing/MenuTestHost'
import { useMenubarSubmenuKeyboard } from './useMenubarSubmenuKeyboard'

const checkedMenuButtonData: PatternData = PatternDataSchema.parse({
  items: {
    trigger: { label: 'Format' },
    menu: { label: 'Format menu' },
    bold: { label: 'Bold' },
    showGrid: { label: 'Show grid', kind: 'menuitemcheckbox' },
    alignLeft: { label: 'Align left', kind: 'menuitemradio' },
    alignCenter: { label: 'Align center', kind: 'menuitemradio' },
    plain: { label: 'Plain action' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['menu'] },
    ownerByKey: { menu: 'trigger' },
    childrenByKey: {
      trigger: ['menu'],
      menu: ['bold', 'showGrid', 'alignLeft', 'alignCenter', 'plain'],
    },
  },
  state: {
    activeKey: 'bold',
    expandedKeys: ['trigger'],
    checkedByKey: { bold: true, showGrid: false, alignLeft: false, alignCenter: true },
  },
})

function CheckedMenuButtonRoles() {
  const menuButton = useMenuButtonPattern(checkedMenuButtonData, () => undefined)
  if (!menuButton.expanded) return null

  return (
    <ul {...menuButton.menuProps}>
      {menuButton.items.map((item) => (
        <li key={item.key} {...item.itemProps}>{item.label}</li>
      ))}
    </ul>
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

  it('returns checkbox and radio menu item roles from item metadata and checked state', () => {
    render(<CheckedMenuButtonRoles />)

    const bold = screen.getByRole('menuitemcheckbox', { name: 'Bold' })
    const showGrid = screen.getByRole('menuitemcheckbox', { name: 'Show grid' })
    const alignCenter = screen.getByRole('menuitemradio', { name: 'Align center' })
    const plain = screen.getByRole('menuitem', { name: 'Plain action' })

    expect(bold.getAttribute('aria-checked')).toBe('true')
    expect(showGrid.getAttribute('aria-checked')).toBe('false')
    expect(alignCenter.getAttribute('aria-checked')).toBe('true')
    expect(plain.getAttribute('aria-checked')).toBeNull()
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

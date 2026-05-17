import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import {
  menubarDefinition,
  menuButtonDefinition,
  reducePatternData,
  type PatternData,
  type PatternEvent,
} from '../../../../src'
import { Menu } from './Menu'
import { menuVariants } from './menuData'

function MenuDemo({
  variant,
  onEvent,
}: {
  variant: keyof typeof menuVariants
  onEvent?: (event: PatternEvent) => void
}) {
  const v = menuVariants[variant]
  const definition = v.apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition
  const [data, setData] = useState<PatternData>({ ...v.data, state: { ...v.data.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy } })
  return (
    <Menu
      data={data}
      onEvent={(event) => {
        onEvent?.(event)
        setData((current) => {
          const next = reducePatternData(definition, current, event)
          return { ...next, state: { ...next.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy } }
        })
      }}
    />
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

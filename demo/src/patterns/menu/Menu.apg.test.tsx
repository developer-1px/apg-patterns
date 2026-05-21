/**
 * APG Menubar / Menu 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MenuDemo } from './testing/MenuTestHost'

describe('APG §Roles, States, Properties — Menubar', () => {
  it('container has role="menubar"', () => {
    render(<MenuDemo variant="editorMenubar" />)
    expect(screen.getByRole('menubar')).toBeTruthy()
  })

  it('menubar items have role="menuitem"', () => {
    render(<MenuDemo variant="editorMenubar" />)
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0)
  })

  it('items with submenu expose aria-haspopup', () => {
    render(<MenuDemo variant="editorMenubar" />)
    screen.getAllByRole('menuitem').forEach((mi) => {
      const hp = mi.getAttribute('aria-haspopup')
      if (hp !== null) expect(['menu', 'true']).toContain(hp)
    })
  })

  it('items with submenu expose aria-expanded', () => {
    render(<MenuDemo variant="editorMenubar" />)
    screen.getAllByRole('menuitem').forEach((mi) => {
      const v = mi.getAttribute('aria-expanded')
      if (v !== null) expect(['true', 'false']).toContain(v)
    })
  })

  it('menubar has accessible name', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const mb = screen.getByRole('menubar')
    const name = mb.getAttribute('aria-label') || mb.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })
})

describe('APG §Keyboard — Arrow keys', () => {
  it('ArrowRight and ArrowLeft wrap focus among menubar items', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const [file, edit, view] = screen.getAllByRole('menuitem')

    fireEvent.keyDown(file!, { key: 'ArrowLeft' })
    expect(view!.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(view!, { key: 'ArrowRight' })
    expect(file!.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(file!, { key: 'ArrowRight' })
    expect(edit!.getAttribute('tabindex')).toBe('0')
  })

  it('ArrowDown on menubar item with submenu opens submenu and focuses first item', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const items = screen.getAllByRole('menuitem')
    const root = items[0]!
    fireEvent.keyDown(root, { key: 'ArrowDown' })

    expect(root.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menu')).toBeTruthy()
    expect(screen.getByRole('menuitem', { name: 'New' }).getAttribute('tabindex')).toBe('0')
  })

  it('ArrowUp on menubar item opens submenu and focuses last item', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    fireEvent.keyDown(file, { key: 'ArrowUp' })

    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Close' }).getAttribute('tabindex')).toBe('0')
  })

  it('Down and Up move focus within submenu items', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    fireEvent.keyDown(file, { key: 'ArrowDown' })
    const menu = screen.getByRole('menu')
    fireEvent.keyDown(menu, { key: 'ArrowDown' })
    expect(screen.getByRole('menuitem', { name: 'Open…' }).getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(menu, { key: 'ArrowUp' })
    expect(screen.getByRole('menuitem', { name: 'New' }).getAttribute('tabindex')).toBe('0')
  })

  it('Right from submenu moves to next menubar item and opens its submenu', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    fireEvent.keyDown(file, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowRight' })

    const edit = screen.getByRole('menuitem', { name: 'Edit' })
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(edit.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Undo' }).getAttribute('tabindex')).toBe('0')
  })

  it('Left from submenu moves to previous menubar item and opens its submenu', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const edit = screen.getByRole('menuitem', { name: 'Edit' })

    fireEvent.keyDown(edit, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'ArrowLeft' })

    const file = screen.getByRole('menuitem', { name: 'File' })
    expect(edit.getAttribute('aria-expanded')).toBe('false')
    expect(file.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'New' }).getAttribute('tabindex')).toBe('0')
  })
})

describe('APG §Keyboard — Escape', () => {
  it('Escape in submenu closes it and returns focus to owner menubar item', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const file = screen.getAllByRole('menuitem')[0]!

    fireEvent.keyDown(file, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(file.getAttribute('aria-expanded')).toBe('false')
    expect(file.getAttribute('tabindex')).toBe('0')
    expect(document.activeElement).toBe(file)
  })
})

describe('APG §Keyboard — Menu button', () => {
  it('ArrowDown opens menu and focuses first item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Action 1' }).getAttribute('tabindex')).toBe('0')
  })

  it('ArrowUp opens menu and focuses last item', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowUp' })

    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('menuitem', { name: 'Last action' }).getAttribute('tabindex')).toBe('0')
  })

  it('Enter on active menu item activates, closes menu, and returns focus to trigger', () => {
    render(<MenuDemo variant="actionMenuButton" />)
    const trigger = screen.getByRole('button', { name: /Actions/ })

    fireEvent.keyDown(trigger, { key: 'ArrowDown' })
    fireEvent.keyDown(screen.getByRole('menu'), { key: 'Enter' })

    expect(screen.queryByRole('menu')).toBeNull()
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
  })
})

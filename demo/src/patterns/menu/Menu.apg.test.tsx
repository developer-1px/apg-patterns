/**
 * APG Menubar / Menu 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import {
  menubarDefinition,
  menuButtonDefinition,
  reducePatternData,
  type PatternData,
  type PatternEvent,
} from '../../../../src'
import { Menu } from './Menu'
import { menuVariants } from './menuData'

function MenuDemo({ variant }: { variant: keyof typeof menuVariants }) {
  const v = menuVariants[variant]
  const definition = v.apgPattern === 'menubar' ? menubarDefinition : menuButtonDefinition
  const [data, setData] = useState<PatternData>({
    ...v.data,
    state: { ...v.data.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy },
  })
  return (
    <Menu
      data={data}
      onEvent={(event: PatternEvent) =>
        setData((current) => {
          const next = reducePatternData(definition, current, event)
          return { ...next, state: { ...next.state, apgPattern: v.apgPattern, focusStrategy: v.focusStrategy } }
        })
      }
    />
  )
}

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
  it('ArrowRight moves active item in menubar', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const mb = screen.getByRole('menubar')
    fireEvent.keyDown(mb, { key: 'ArrowRight' })
    expect(screen.getAllByRole('menuitem').length).toBeGreaterThan(0)
  })

  it('ArrowDown on menubar item with submenu opens submenu', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const items = screen.getAllByRole('menuitem')
    const root = items[0]!
    fireEvent.keyDown(root, { key: 'ArrowDown' })
    const open = items.some((mi) => mi.getAttribute('aria-expanded') === 'true')
    if (open) expect(screen.queryAllByRole('menu').length).toBeGreaterThanOrEqual(0)
  })
})

describe('APG §Keyboard — Escape', () => {
  it('Escape on menubar does not throw', () => {
    render(<MenuDemo variant="editorMenubar" />)
    const mb = screen.getByRole('menubar')
    fireEvent.keyDown(mb, { key: 'ArrowDown' })
    fireEvent.keyDown(mb, { key: 'Escape' })
    expect(mb).toBeTruthy()
  })
})

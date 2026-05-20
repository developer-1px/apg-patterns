import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { entry as comboboxEntry } from './combobox/entry'
import { entry as gridEntry } from './grid/entry'
import { entry as menuEntry } from './menu/entry'
import { entry as sliderEntry } from './slider/entry'
import { entry as tableEntry } from './table/entry'
import type { PatternEvent } from '../../../src/react'

function EntryDemo({ kind, onEvent = () => undefined }: { kind: 'combobox' | 'grid' | 'menu' | 'slider' | 'table'; onEvent?: (event: PatternEvent) => void }) {
  const entry = kind === 'combobox' ? comboboxEntry : kind === 'grid' ? gridEntry : kind === 'menu' ? menuEntry : kind === 'slider' ? sliderEntry : tableEntry
  const demo = entry.useDemoPattern(onEvent)
  return (
    <>
      {demo.variants}
      {demo.preview}
    </>
  )
}

describe('demo entry coverage from pointer input', () => {
  it('renders variant entries and switches previews through clicks', () => {
    const { unmount } = render(<EntryDemo kind="combobox" />)
    fireEvent.click(screen.getByRole('option', { name: 'Select-Only' }))
    expect(screen.getByRole('combobox').getAttribute('aria-haspopup')).toBe('listbox')
    unmount()

    const slider = render(<EntryDemo kind="slider" />)
    fireEvent.click(screen.getByRole('option', { name: 'Rating' }))
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('Neutral')
    slider.unmount()

    render(<EntryDemo kind="table" />)
    fireEvent.click(screen.getByRole('option', { name: 'Sortable planets' }))
    expect(screen.getByRole('table').getAttribute('aria-label')).toBe('Sortable planets')
  })

  it('emits and reduces sortable grid/table events through preview clicks', () => {
    const events: PatternEvent[] = []
    const grid = render(<EntryDemo kind="grid" onEvent={(event) => events.push(event)} />)
    fireEvent.click(screen.getByRole('option', { name: 'Data: sortable' }))
    fireEvent.click(screen.getByRole('columnheader', { name: /Name/ }))
    expect(events).toContainEqual({ type: 'sort', key: 'hName', sort: 'descending' })
    expect(screen.getByRole('columnheader', { name: /Name/ }).getAttribute('aria-sort')).toBe('descending')
    grid.unmount()

    const tableEvents: PatternEvent[] = []
    render(<EntryDemo kind="table" onEvent={(event) => tableEvents.push(event)} />)
    fireEvent.click(screen.getByRole('option', { name: 'Sortable planets' }))
    fireEvent.click(screen.getByRole('columnheader', { name: 'Name' }))
    expect(tableEvents).toContainEqual({ type: 'sort', key: 'hName', sort: 'descending' })
    expect(screen.getByRole('columnheader', { name: 'Name' }).getAttribute('aria-sort')).toBe('descending')
  })

  it('emits and reduces menu events through preview keyboard and clicks', () => {
    const events: PatternEvent[] = []
    render(<EntryDemo kind="menu" onEvent={(event) => events.push(event)} />)
    const menubar = screen.getByRole('menubar')
    fireEvent.keyDown(menubar, { key: 'ArrowRight' })
    fireEvent.keyDown(menubar, { key: 'ArrowRight' })
    fireEvent.keyDown(menubar, { key: 'ArrowDown' })
    fireEvent.click(screen.getByRole('menuitemcheckbox', { name: /Word Wrap/ }))
    fireEvent.click(screen.getByRole('menuitemradio', { name: /Light/ }))

    expect(events).toContainEqual({ type: 'expand', key: 'view', expanded: true })
    expect(events).toContainEqual({ type: 'check', key: 'viewWrap', checked: false })
    expect(events).toContainEqual({ type: 'check', key: 'viewLight', checked: true })
  })
})

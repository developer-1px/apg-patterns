/**
 * APG Tree View 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src/react'
import { Treeview } from './Treeview'
import { entry } from './entry'
import { initialData, reduceData, resolveTarget } from './treeContract'
import { navigation } from './treeVariantData'

function TreeDemo() {
  const [data, setData] = useState<PatternData>(initialData as PatternData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceTreeDemoData(current, event))
  return <Treeview data={data} onEvent={handleEvent} />
}

function NavigationTreeDemo() {
  const [data, setData] = useState<PatternData>(navigation as PatternData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceTreeDemoData(current, event))
  return <Treeview data={data} onEvent={handleEvent} />
}

function TreeReducerEdgesDemo() {
  const [data, setData] = useState<PatternData>({ ...initialData, state: { ...initialData.state, activeKey: null } } as PatternData)
  const apply = (event: PatternEvent) => setData((current) => reduceData(current, event))
  const target = (direction: Extract<PatternEvent, { type: 'navigate' }>['direction']) => resolveTarget(direction, data)

  return (
    <div>
      <button type="button" onClick={() => apply({ type: 'navigate', direction: 'next', meta: { reason: 'keyboard' } })}>Reduce navigate</button>
      <button type="button" onClick={() => apply({ type: 'select', keys: ['demo'], anchorKey: 'docs', extentKey: 'demo', meta: { reason: 'pointer' } })}>Reduce select</button>
      <button type="button" onClick={() => apply({ type: 'focus', key: 'schema' })}>Reduce focus without reason</button>
      <button type="button" onClick={() => apply({ type: 'expand', key: 'docs', expanded: true })}>Expand docs</button>
      <button type="button" onClick={() => apply({ type: 'dismiss' })}>Reduce ignored</button>
      <button type="button" onClick={() => setData((current) => ({ ...current, state: { ...current.state, activeKey: 'runtime' } }))}>Set runtime active</button>
      <button type="button" onClick={() => apply({ type: 'expand', key: 'docs', expanded: false, meta: { reason: 'keyboard' } })}>Collapse docs</button>
      <button type="button" onClick={() => setData({ ...initialData, relations: {}, state: {} } as PatternData)}>Empty relations</button>
      <output data-testid="tree-active">{String(data.state?.activeKey ?? '')}</output>
      <output data-testid="tree-selected">{data.state?.selectedKeys?.join(',') ?? ''}</output>
      <output data-testid="tree-reason">{String(data.state?.lastEventReason ?? '')}</output>
      <output data-testid="tree-first-target">{String(target('first'))}</output>
      <output data-testid="tree-parent-target">{String(target('parent'))}</output>
      <output data-testid="tree-child-target">{String(target('child'))}</output>
      <output data-testid="tree-last-target">{String(target('last'))}</output>
      <output data-testid="tree-unknown-target">{String(target('rowStart'))}</output>
    </div>
  )
}

function TreeviewEntryDemo() {
  const [events, setEvents] = useState<string[]>([])
  const demo = entry.useDemoPattern((event) => setEvents((current) => [...current, event.type]))

  return (
    <div>
      <div data-testid="tree-entry-variants">{demo.variants}</div>
      <div data-testid="tree-entry-inspect-controls">{demo.inspectControls}</div>
      <output data-testid="tree-entry-inspect">{demo.inspect}</output>
      <output data-testid="tree-entry-events">{events.join(',')}</output>
      {demo.preview}
    </div>
  )
}

const tree = () => screen.getByRole('tree')
const treeitem = (name: string) => screen.getByRole('treeitem', { name })

function reduceTreeDemoData(data: PatternData, event: PatternEvent): PatternData {
  if (event.type !== 'navigate') return reduceData(data, event)
  const target = resolveTarget(event.direction, data)
  return target ? reduceData(data, { type: 'focus', key: target, meta: event.meta }) : data
}

describe('APG §Roles, States, Properties', () => {
  it('container has role="tree"', () => {
    render(<TreeDemo />)
    expect(tree()).toBeTruthy()
  }, 15000)

  it('each node has role="treeitem"', () => {
    render(<TreeDemo />)
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0)
  })

  it('parent nodes have aria-expanded; leaf nodes omit it', () => {
    render(<TreeDemo />)
    expect(treeitem('Docs').getAttribute('aria-expanded')).toBe('true')
    expect(treeitem('Runtime').hasAttribute('aria-expanded')).toBe(false)
    expect(treeitem('Demo').hasAttribute('aria-expanded')).toBe(false)
  })

  it('each treeitem has aria-level', () => {
    render(<TreeDemo />)
    expect(treeitem('Docs').getAttribute('aria-level')).toBe('1')
    expect(treeitem('ADR').getAttribute('aria-level')).toBe('2')
    expect(treeitem('Runtime').getAttribute('aria-level')).toBe('2')
    expect(treeitem('Demo').getAttribute('aria-level')).toBe('1')
  })

  it('declares position and set size for visible nodes', () => {
    render(<TreeDemo />)

    expect(treeitem('Docs').getAttribute('aria-posinset')).toBe('1')
    expect(treeitem('Docs').getAttribute('aria-setsize')).toBe('2')
    expect(treeitem('Runtime').getAttribute('aria-posinset')).toBe('2')
    expect(treeitem('Runtime').getAttribute('aria-setsize')).toBe('3')
  })

  it('uses aria-selected without mixing aria-checked', () => {
    render(<TreeDemo />)

    expect(treeitem('Runtime').getAttribute('aria-selected')).toBe('true')
    expect(treeitem('Docs').getAttribute('aria-selected')).toBe('false')
    screen.getAllByRole('treeitem').forEach((item) => {
      expect(item.hasAttribute('aria-checked')).toBe(false)
    })
  })

  it('tree has accessible name', () => {
    render(<TreeDemo />)
    const t = tree()
    const name = t.getAttribute('aria-label') || t.getAttribute('aria-labelledby')
    expect(name).toBeTruthy()
  })
})

describe('APG §Keyboard — Up / Down navigate', () => {
  it('ArrowDown moves focus to next treeitem', () => {
    render(<TreeDemo />)
    const t = tree()
    fireEvent.keyDown(t, { key: 'ArrowDown' })
    expect(treeitem('ADR').getAttribute('tabindex')).toBe('0')
    expect(treeitem('Docs').getAttribute('tabindex')).toBe('-1')
  })

  it('ArrowUp moves focus to previous treeitem', () => {
    render(<TreeDemo />)
    const t = tree()
    fireEvent.keyDown(t, { key: 'ArrowDown' })
    fireEvent.keyDown(t, { key: 'ArrowUp' })
    expect(treeitem('Docs').getAttribute('tabindex')).toBe('0')
    expect(treeitem('ADR').getAttribute('tabindex')).toBe('-1')
  })
})

describe('APG §Keyboard — Right expands, Left collapses', () => {
  it('ArrowRight on collapsed node expands it', () => {
    render(<TreeDemo />)
    const t = tree()
    fireEvent.keyDown(t, { key: 'ArrowLeft' })
    expect(treeitem('Docs').getAttribute('aria-expanded')).toBe('false')

    fireEvent.keyDown(t, { key: 'ArrowRight' })
    expect(treeitem('Docs').getAttribute('aria-expanded')).toBe('true')
    expect(treeitem('Docs').getAttribute('tabindex')).toBe('0')
  })

  it('ArrowRight on expanded node moves focus to first child', () => {
    render(<TreeDemo />)

    fireEvent.keyDown(tree(), { key: 'ArrowRight' })
    expect(treeitem('ADR').getAttribute('tabindex')).toBe('0')
  })

  it('ArrowLeft on child node moves focus to parent', () => {
    render(<TreeDemo />)
    const t = tree()

    fireEvent.keyDown(t, { key: 'ArrowDown' })
    fireEvent.keyDown(t, { key: 'ArrowLeft' })
    expect(treeitem('Docs').getAttribute('tabindex')).toBe('0')
  })

  it('ArrowLeft on expanded node collapses it', () => {
    render(<TreeDemo />)

    fireEvent.keyDown(tree(), { key: 'ArrowLeft' })
    expect(treeitem('Docs').getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('treeitem', { name: 'ADR' })).toBeNull()
  })
})

describe('APG §Keyboard — Home / End / Typeahead', () => {
  it('Home and End move focus without expanding or collapsing nodes', () => {
    render(<TreeDemo />)
    const t = tree()

    fireEvent.keyDown(t, { key: 'End' })
    expect(treeitem('Demo').getAttribute('tabindex')).toBe('0')
    expect(treeitem('Docs').getAttribute('aria-expanded')).toBe('true')

    fireEvent.keyDown(t, { key: 'Home' })
    expect(treeitem('Docs').getAttribute('tabindex')).toBe('0')
  })

  it('typeahead moves focus to the next visible matching node', () => {
    render(<TreeDemo />)

    fireEvent.keyDown(tree(), { key: 'r' })
    expect(treeitem('Runtime').getAttribute('tabindex')).toBe('0')
  })
})

describe('APG §Activation', () => {
  it('does not cancel mouse activation for link treeitems', () => {
    render(<NavigationTreeDemo />)

    expect(fireEvent.click(screen.getByRole('link', { name: 'Getting Started' }))).toBe(true)
  })

  it('covers tree contract reducer edge cases from pointer controls', () => {
    render(<TreeReducerEdgesDemo />)

    expect(screen.getByTestId('tree-first-target').textContent).toBe('docs')

    fireEvent.click(screen.getByRole('button', { name: 'Reduce navigate' }))
    expect(screen.getByTestId('tree-reason').textContent).toBe('keyboard')

    fireEvent.click(screen.getByRole('button', { name: 'Reduce select' }))
    expect(screen.getByTestId('tree-selected').textContent).toBe('demo')
    expect(screen.getByTestId('tree-reason').textContent).toBe('pointer')

    fireEvent.click(screen.getByRole('button', { name: 'Reduce focus without reason' }))
    expect(screen.getByTestId('tree-active').textContent).toBe('schema')

    fireEvent.click(screen.getByRole('button', { name: 'Expand docs' }))
    expect(screen.getByTestId('tree-active').textContent).toBe('schema')

    fireEvent.click(screen.getByRole('button', { name: 'Set runtime active' }))
    expect(screen.getByTestId('tree-parent-target').textContent).toBe('docs')
    expect(screen.getByTestId('tree-child-target').textContent).toBe('undefined')
    expect(screen.getByTestId('tree-last-target').textContent).toBe('demo')
    expect(screen.getByTestId('tree-unknown-target').textContent).toBe('undefined')

    fireEvent.click(screen.getByRole('button', { name: 'Collapse docs' }))
    expect(screen.getByTestId('tree-active').textContent).toBe('docs')

    fireEvent.click(screen.getByRole('button', { name: 'Reduce ignored' }))
    expect(screen.getByTestId('tree-active').textContent).toBe('docs')

    fireEvent.click(screen.getByRole('button', { name: 'Empty relations' }))
    expect(screen.getByTestId('tree-first-target').textContent).toBe('undefined')
  })

  it('entry runtime controls update inspect, options, variant, and follow-focus navigation', () => {
    const { container } = render(<TreeviewEntryDemo />)

    fireEvent.click(screen.getByRole('option', { name: 'File directory · declared' }))

    const selects = Array.from(container.querySelectorAll('select'))
    fireEvent.change(selects[0]!, { target: { value: 'toggleExpand' } })
    fireEvent.change(selects[1]!, { target: { value: 'ariaActiveDescendant' } })
    fireEvent.change(selects[2]!, { target: { value: 'html' } })
    fireEvent.click(screen.getByLabelText('followFocus'))

    fireEvent.keyDown(screen.getByRole('tree'), { key: 'ArrowDown' })

    expect(screen.getByTestId('tree-entry-events').textContent).toContain('navigate')
    expect(screen.getByRole('treeitem', { name: 'project-1' }).getAttribute('aria-selected')).toBe('true')
    expect(screen.getByTestId('tree-entry-inspect').textContent).toContain('aria-activedescendant="treeitem-project-1"')
  }, 15000)
})

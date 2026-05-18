/**
 * APG Tree View 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src'
import { Tree } from './Tree'
import { initialData, reduceData, resolveTarget } from './treeContract'
import { navigation } from './treeVariantData'

function TreeDemo() {
  const [data, setData] = useState<PatternData>(initialData as PatternData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceTreeDemoData(current, event))
  return <Tree data={data} onEvent={handleEvent} />
}

function NavigationTreeDemo() {
  const [data, setData] = useState<PatternData>(navigation as PatternData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceTreeDemoData(current, event))
  return <Tree data={data} onEvent={handleEvent} />
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
})

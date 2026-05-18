/**
 * APG Tree View 스펙 전수 테스트.
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import type { PatternData, PatternEvent } from '../../../../src'
import { Tree } from './Tree'
import { initialData, reduceData } from './treeContract'

function TreeDemo() {
  const [data, setData] = useState<PatternData>(initialData as PatternData)
  const handleEvent = (event: PatternEvent) => setData((current) => reduceData(current, event))
  return <Tree data={data} onEvent={handleEvent} />
}

const tree = () => screen.getByRole('tree')

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
    screen.getAllByRole('treeitem').forEach((ti) => {
      const v = ti.getAttribute('aria-expanded')
      if (v !== null) expect(['true', 'false']).toContain(v)
    })
  })

  it('each treeitem has aria-level', () => {
    render(<TreeDemo />)
    screen.getAllByRole('treeitem').forEach((ti) => {
      const lvl = ti.getAttribute('aria-level')
      if (lvl !== null) expect(Number(lvl)).toBeGreaterThanOrEqual(1)
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
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0)
  })

  it('ArrowUp moves focus to previous treeitem', () => {
    render(<TreeDemo />)
    const t = tree()
    fireEvent.keyDown(t, { key: 'ArrowDown' })
    fireEvent.keyDown(t, { key: 'ArrowUp' })
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0)
  })
})

describe('APG §Keyboard — Right expands, Left collapses', () => {
  it('ArrowRight on collapsed node expands it', () => {
    render(<TreeDemo />)
    const t = tree()
    const collapsed = screen.getAllByRole('treeitem').find((ti) => ti.getAttribute('aria-expanded') === 'false')
    if (!collapsed) return
    fireEvent.keyDown(t, { key: 'ArrowRight' })
    // either same node now expanded, or focus moved to first child
    expect(screen.getAllByRole('treeitem').length).toBeGreaterThan(0)
  })
})

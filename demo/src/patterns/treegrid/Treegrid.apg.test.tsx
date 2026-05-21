/**
 * APG Treegrid 스펙 전수 테스트.
 *
 * 출처: https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/
 *
 * 이 파일은 W3C ARIA Authoring Practices Guide의 treegrid 패턴의
 *   1) Keyboard Interaction 표
 *   2) WAI-ARIA Roles, States, and Properties
 * 두 절을 한 항목씩 테스트로 옮긴 갭 리포트다.
 *
 * 일부 테스트는 현재 구현에서 실패할 것으로 예상된다 — 실패 자체가 갭이며
 * 구현 수정은 별도로 처리한다. 이 파일에서 코드를 우회하거나 `it.skip` 처리하지 않는다.
 */
import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}

import { reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { treegridDefinition } from '../../../../src/patterns/treegrid/definition'
import { Treegrid } from './Treegrid'
import { initialTreegridData } from './treegridData'

function TreegridDemo() {
  const [data, setData] = useState<PatternData>(initialTreegridData)
  return (
    <Treegrid
      data={data}
      onEvent={(event: PatternEvent) => {
        setData((current) => reducePatternData(treegridDefinition, current, event))
      }}
    />
  )
}

function RowFocusTreegridDemo({ activeKey = 'src' }: { activeKey?: string }) {
  const [data, setData] = useState<PatternData>({
    ...initialTreegridData,
    state: {
      ...initialTreegridData.state,
      activeKey,
      selectedKeys: [activeKey],
    },
  })
  return (
    <Treegrid
      data={data}
      options={{ focusMode: 'row' }}
      onEvent={(event: PatternEvent) => {
        setData((current) => reducePatternData(treegridDefinition, current, event))
      }}
    />
  )
}

const cellOf = (key: string) => document.getElementById(`treegridcell-${key}`)!
const treegridFirstCell = (rowKey: string) => `${rowKey}:name`
const rowOf = (rowKey: string) =>
  Array.from(document.querySelectorAll('[role="row"]')).find(
    (el) => cellOf(treegridFirstCell(rowKey)) && el.contains(cellOf(treegridFirstCell(rowKey))),
  ) as HTMLElement | undefined
const activeCellKey = () => {
  const el = document.querySelector('[data-active]') as HTMLElement | null
  return el?.id.replace(/^treegridcell-/, '') ?? null
}
const isActive = (key: string) => cellOf(key)?.hasAttribute('data-active') === true
const isSelected = (key: string) => cellOf(key)?.getAttribute('aria-selected') === 'true'

// ---------------------------------------------------------------------------
// §1. WAI-ARIA Roles, States, and Properties
// https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/#wai-ariaroles,states,andproperties
// ---------------------------------------------------------------------------

describe('APG §Roles, States, Properties', () => {
  it('container has role="treegrid"', () => {
    render(<TreegridDemo />)
    expect(screen.getByRole('treegrid')).toBeTruthy()
  })

  it('every row in the treegrid has role="row"', () => {
    render(<TreegridDemo />)
    const rows = document.querySelectorAll('[role="row"]')
    expect(rows.length).toBeGreaterThan(0)
  })

  it('header cells have role="columnheader"', () => {
    render(<TreegridDemo />)
    const headers = document.querySelectorAll('[role="columnheader"]')
    expect(headers.length).toBe(3)
  })

  it('data cells have role="gridcell" (or rowheader)', () => {
    render(<TreegridDemo />)
    const cells = document.querySelectorAll('[role="gridcell"]')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('parent (expandable) rows have aria-expanded set', () => {
    render(<TreegridDemo />)
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
    expect(rowOf('docs')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('leaf rows do NOT have aria-expanded', () => {
    render(<TreegridDemo />)
    expect(rowOf('pkg.json')!.hasAttribute('aria-expanded')).toBe(false)
  })

  it('every row has aria-level reflecting nesting depth', () => {
    render(<TreegridDemo />)
    expect(rowOf('src')!.getAttribute('aria-level')).toBe('1')
    expect(rowOf('docs')!.getAttribute('aria-level')).toBe('1')
    expect(rowOf('pkg.json')!.getAttribute('aria-level')).toBe('1')
    expect(rowOf('components')!.getAttribute('aria-level')).toBe('2')
    expect(rowOf('index.ts')!.getAttribute('aria-level')).toBe('2')
  })

  it('treegrid advertises aria-rowcount equal to total rows', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    expect(grid.getAttribute('aria-rowcount')).toBe(String(initialTreegridData.state?.rowCount))
  })

  it('treegrid advertises aria-colcount equal to column count', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    expect(grid.getAttribute('aria-colcount')).toBe('3')
  })

  it('rows advertise aria-rowindex starting at 1', () => {
    render(<TreegridDemo />)
    expect(rowOf('src')!.getAttribute('aria-rowindex')).toBe('2')
    expect(rowOf('docs')!.getAttribute('aria-rowindex')).toBeTruthy()
  })

  it('cells advertise aria-colindex starting at 1', () => {
    render(<TreegridDemo />)
    expect(cellOf('src:name').getAttribute('aria-colindex')).toBe('1')
    expect(cellOf('src:size').getAttribute('aria-colindex')).toBe('2')
    expect(cellOf('src:modified').getAttribute('aria-colindex')).toBe('3')
  })

  it('treegrid has accessible name (aria-label or aria-labelledby)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    const labelled = grid.getAttribute('aria-label') || grid.getAttribute('aria-labelledby')
    expect(labelled).toBeTruthy()
  })

  it('selected cell has aria-selected="true"', () => {
    render(<TreegridDemo />)
    expect(cellOf('src:name').getAttribute('aria-selected')).toBe('true')
  })

  it('treegrid declares aria-multiselectable when supporting multiple selection', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    // Demo uses selectionMode: 'single' — should be "false" or omitted (default false).
    const value = grid.getAttribute('aria-multiselectable')
    expect(value === null || value === 'false').toBe(true)
  })

  it('disabled/readonly cells expose aria-readonly when applicable', () => {
    // Informational: demo has no readonly cells, but the property must be supported
    // by the pattern. We assert that if any aria-readonly attribute exists it is "true"/"false".
    render(<TreegridDemo />)
    document.querySelectorAll('[aria-readonly]').forEach((el) => {
      expect(['true', 'false']).toContain(el.getAttribute('aria-readonly'))
    })
  })

  it('sortable columns expose aria-sort on the header cell', () => {
    // Informational: demo has no sorting, but assertion documents the requirement.
    render(<TreegridDemo />)
    document.querySelectorAll('[role="columnheader"]').forEach((el) => {
      const sort = el.getAttribute('aria-sort')
      if (sort !== null) {
        expect(['ascending', 'descending', 'none', 'other']).toContain(sort)
      }
    })
  })
})

// ---------------------------------------------------------------------------
// §2. Keyboard Interaction — Navigation
// https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/#keyboardinteraction
// ---------------------------------------------------------------------------

describe('APG §Keyboard — Row Focus Navigation', () => {
  it('row focus mode uses keyboard input to navigate visible rows', () => {
    render(<RowFocusTreegridDemo />)
    const grid = screen.getByRole('treegrid')
    const activeRow = () => document.querySelector('[role="row"][tabindex="0"]') as HTMLElement | null

    expect(activeRow()?.id).toBe('treegridcell-src')

    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(activeRow()?.id).toBe('treegridcell-components')

    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(activeRow()?.id).toBe('treegridcell-src')

    fireEvent.keyDown(grid, { key: 'End' })
    expect(activeRow()?.id).toBe('treegridcell-pkg.json')

    fireEvent.keyDown(grid, { key: 'Home' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')

    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(activeRow()?.id).toBe('treegridcell-pkg.json')

    fireEvent.keyDown(grid, { key: 'PageUp' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')
  })

  it('row focus mode clamps row keyboard navigation at visible row boundaries', () => {
    render(<RowFocusTreegridDemo activeKey="headerRow" />)
    const grid = screen.getByRole('treegrid')
    const activeRow = () => document.querySelector('[role="row"][tabindex="0"]') as HTMLElement | null

    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')

    fireEvent.keyDown(grid, { key: 'PageUp' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')

    fireEvent.keyDown(grid, { key: 'End' })
    expect(activeRow()?.id).toBe('treegridcell-pkg.json')

    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(activeRow()?.id).toBe('treegridcell-pkg.json')

    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(activeRow()?.id).toBe('treegridcell-pkg.json')
  })

  it('row focus mode recovers keyboard navigation from a hidden active row', () => {
    const { unmount } = render(<RowFocusTreegridDemo activeKey="readme.md" />)
    const grid = screen.getByRole('treegrid')
    const activeRow = () => document.querySelector('[role="row"][tabindex="0"]') as HTMLElement | null

    expect(activeRow()).toBeNull()

    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')

    unmount()
    render(<RowFocusTreegridDemo activeKey="readme.md" />)
    fireEvent.keyDown(screen.getByRole('treegrid'), { key: 'PageDown' })
    expect(activeRow()?.id).toBe('treegridcell-headerRow')
  })
})

describe('APG §Keyboard — Right Arrow', () => {
  it('on collapsed row: expands the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    // Move active to docs:name (collapsed).
    for (let i = 0; i < 3; i += 1) fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(isActive('docs:name')).toBe(true)
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(rowOf('docs')!.getAttribute('aria-expanded')).toBe('true')
  })

  it('on expanded row first cell: moves to next cell (does NOT collapse)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    // src is expanded, active = src:name (first cell).
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(isActive('src:size')).toBe(true)
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
  })

  it('on a non-first cell: moves one cell right', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowRight' }) // src:size
    fireEvent.keyDown(grid, { key: 'ArrowRight' }) // src:modified
    expect(isActive('src:modified')).toBe(true)
  })

  it('on rightmost cell: does not move', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    expect(isActive('src:modified')).toBe(true)
    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(isActive('src:modified')).toBe(true)
  })
})

describe('APG §Keyboard — Left Arrow', () => {
  it('on first cell of expanded row: collapses the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('false')
  })

  it('on first cell of collapsed/leaf row: optionally moves focus to row (no-op acceptable)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    // Collapse src so it is now first cell of a collapsed row.
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('false')
    // Pressing left again: APG allows either "move focus to row" or no movement.
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(isActive('src:name') || document.activeElement === rowOf('src')).toBe(true)
  })

  it('on non-first cell: moves one cell left', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' }) // src:modified
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(isActive('src:size')).toBe(true)
  })

  it('on leftmost cell of collapsed/leaf row that has no parent: does not move', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(isActive('h-name')).toBe(true)
    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(isActive('h-name')).toBe(true)
  })
})

describe('APG §Keyboard — Down Arrow', () => {
  it('moves one row down (cell focus → cell in same column, next row)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(isActive('components:name')).toBe(true)
  })

  it('does not move if on last row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    expect(isActive('pkg.json:modified')).toBe(true)
    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(isActive('pkg.json:modified')).toBe(true)
  })
})

describe('APG §Keyboard — Up Arrow', () => {
  it('moves one row up', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowDown' }) // components:name
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(isActive('src:name')).toBe(true)
  })

  it('does not move if on first row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(isActive('h-name')).toBe(true)
    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(isActive('h-name')).toBe(true)
  })
})

describe('APG §Keyboard — Tab', () => {
  it('Tab moves focus to next focusable in row (or out of treegrid if none)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Tab' })
    // No focusable inputs in demo cells → focus should leave the treegrid.
    expect(document.activeElement === grid || grid.contains(document.activeElement)).toBe(false)
  })

  it('Shift+Tab moves focus to previous focusable (or out)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Tab', shiftKey: true })
    expect(document.activeElement === grid || grid.contains(document.activeElement)).toBe(false)
  })
})

describe('APG §Keyboard — Enter', () => {
  it('on first cell of expandable row: toggles aria-expanded', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    // src expanded → Enter on src:name should collapse it.
    fireEvent.keyDown(grid, { key: 'Enter' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('false')
    fireEvent.keyDown(grid, { key: 'Enter' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe('true')
  })

  it('on non-expandable cell: performs default action (no expansion change)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowRight' }) // src:size
    const before = rowOf('src')!.getAttribute('aria-expanded')
    fireEvent.keyDown(grid, { key: 'Enter' })
    expect(rowOf('src')!.getAttribute('aria-expanded')).toBe(before)
  })
})

describe('APG §Keyboard — Home / End', () => {
  it('Home: moves to first cell of the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    fireEvent.keyDown(grid, { key: 'Home' })
    expect(isActive('src:name')).toBe(true)
  })

  it('End: moves to last cell of the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    expect(isActive('src:modified')).toBe(true)
  })

  it('Home: does not move if already at first cell', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home' })
    expect(isActive('src:name')).toBe(true)
  })

  it('End: does not move if already at last cell', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    fireEvent.keyDown(grid, { key: 'End' })
    expect(isActive('src:modified')).toBe(true)
  })
})

describe('APG §Keyboard — Ctrl+Home / Ctrl+End', () => {
  it('Ctrl+Home: moves to first cell of first row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(isActive('h-name')).toBe(true)
  })

  it('Ctrl+End: moves to last cell of last visible row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    expect(isActive('pkg.json:modified')).toBe(true)
  })

  it('Ctrl+Home: does not move if already at first cell', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(isActive('h-name')).toBe(true)
  })

  it('Ctrl+End: does not move if already at last cell', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    expect(isActive('pkg.json:modified')).toBe(true)
  })
})

describe('APG §Keyboard — PageDown', () => {
  it('moves focus down an author-determined number of rows (>= 1) within same column', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    const beforeKey = activeCellKey()
    fireEvent.keyDown(grid, { key: 'PageDown' })
    const afterKey = activeCellKey()
    expect(afterKey).not.toBe(beforeKey)
    // Same column (name).
    expect(afterKey?.endsWith(':name')).toBe(true)
  })

  it('does not move if already at last row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    const before = activeCellKey()
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(activeCellKey()).toBe(before)
  })
})

describe('APG §Keyboard — PageUp', () => {
  it('moves focus up an author-determined number of rows (>= 1) within same column', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    const before = activeCellKey()
    fireEvent.keyDown(grid, { key: 'PageUp' })
    const after = activeCellKey()
    expect(after).not.toBe(before)
    // Same column (last column) — either `<row>:modified` or `h-modified`.
    expect(after === 'h-modified' || after?.endsWith(':modified')).toBe(true)
  })

  it('does not move if already at first row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    const before = activeCellKey()
    fireEvent.keyDown(grid, { key: 'PageUp' })
    expect(activeCellKey()).toBe(before)
  })
})

// ---------------------------------------------------------------------------
// §3. Keyboard Interaction — Selection
// ---------------------------------------------------------------------------

describe('APG §Keyboard — Ctrl+A', () => {
  it('selects all cells in the treegrid', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'a', ctrlKey: true })
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('components:name')).toBe(true)
    expect(isSelected('pkg.json:modified')).toBe(true)
  })
})

describe('APG §Keyboard — Ctrl+Space', () => {
  it('on cell focus: selects the column', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: ' ', ctrlKey: true })
    // Active is src:name → entire name column should be selected.
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('components:name')).toBe(true)
    expect(isSelected('pkg.json:name')).toBe(true)
    // Other columns should NOT be selected.
    expect(isSelected('src:size')).toBe(false)
  })
})

describe('APG §Keyboard — Shift+Space', () => {
  it('on cell focus: selects the row containing focus', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: ' ', shiftKey: true })
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('src:size')).toBe(true)
    expect(isSelected('src:modified')).toBe(true)
    // Other rows should NOT be selected.
    expect(isSelected('components:name')).toBe(false)
  })
})

describe('APG §Keyboard — Shift+Right Arrow', () => {
  it('extends cell selection one cell right', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowRight', shiftKey: true })
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('src:size')).toBe(true)
  })
})

describe('APG §Keyboard — Shift+Left Arrow', () => {
  it('extends cell selection one cell left', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    // Now at src:modified. Reset selection by clicking it.
    fireEvent.click(cellOf('src:modified'))
    fireEvent.keyDown(grid, { key: 'ArrowLeft', shiftKey: true })
    expect(isSelected('src:modified')).toBe(true)
    expect(isSelected('src:size')).toBe(true)
  })
})

describe('APG §Keyboard — Shift+Down Arrow', () => {
  it('extends cell selection to the next row (same column)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowDown', shiftKey: true })
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('components:name')).toBe(true)
  })
})

describe('APG §Keyboard — Shift+Up Arrow', () => {
  it('extends cell selection to the previous row (same column)', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'ArrowDown' }) // components:name
    fireEvent.click(cellOf('components:name'))
    fireEvent.keyDown(grid, { key: 'ArrowUp', shiftKey: true })
    expect(isSelected('components:name')).toBe(true)
    expect(isSelected('src:name')).toBe(true)
  })
})

describe('APG §Keyboard — Shift+Home / Shift+End (range to row edge)', () => {
  it('Shift+Home: extends selection to the first cell of the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End' })
    fireEvent.click(cellOf('src:modified'))
    fireEvent.keyDown(grid, { key: 'Home', shiftKey: true })
    expect(isSelected('src:modified')).toBe(true)
    expect(isSelected('src:size')).toBe(true)
    expect(isSelected('src:name')).toBe(true)
  })

  it('Shift+End: extends selection to the last cell of the row', () => {
    render(<TreegridDemo />)
    const grid = screen.getByRole('treegrid')
    fireEvent.keyDown(grid, { key: 'End', shiftKey: true })
    expect(isSelected('src:name')).toBe(true)
    expect(isSelected('src:size')).toBe(true)
    expect(isSelected('src:modified')).toBe(true)
  })
})

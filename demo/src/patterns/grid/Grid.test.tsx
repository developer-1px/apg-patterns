import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'

// jsdom lacks the CSS object Grid.tsx uses for CSS.escape; polyfill minimally.
if (typeof globalThis.CSS === 'undefined') {
  ;(globalThis as { CSS?: { escape: (value: string) => string } }).CSS = { escape: (value: string) => value }
}
import { gridDefinition, reducePatternData, useGridPattern, type PatternData } from '../../../../src/react'
import { Grid } from './Grid'
import { gridVariants } from './gridData'
import { GridDemo } from './testing/GridTestHost'

function GridDataDemo({ initialData }: { initialData: PatternData }) {
  const [data, setData] = useState<PatternData>(initialData)
  return <Grid data={data} onEvent={(event) => setData((current) => reducePatternData(gridDefinition, current, event))} />
}

function GridRuntimeStateDemo({ initialData }: { initialData: PatternData }) {
  const [data, setData] = useState<PatternData>(initialData)
  const grid = useGridPattern(data, (event) => setData((current) => reducePatternData(gridDefinition, current, event)))

  return (
    <>
      <div {...grid.gridProps}>
        {grid.rows.map((row) => (
          <div key={row.key} {...row.rowProps}>
            {row.cells.map((cell) => (
              <div key={cell.key} {...cell.cellProps}>{cell.value}</div>
            ))}
          </div>
        ))}
      </div>
      <output data-testid="grid-runtime-state">
        {[grid.state.activeKey, grid.state.anchorKey, grid.state.extentKey, grid.state.selectedKeys.join(',')].join('|')}
      </output>
    </>
  )
}

const cellOf = (key: string) => document.getElementById(`gridcell-${key}`)!
const selectedKeys = () =>
  [...document.querySelectorAll('[aria-selected="true"]')]
    .map((element) => element.id.replace('gridcell-', ''))
    .filter(Boolean)

const rowHeaderGridData = {
  items: {
    headerRow: { label: 'Header row' },
    dataRow: { label: 'Data row' },
    rowHeaderColumn: { label: 'Row header column' },
    nameColumn: { label: 'Name column' },
    corner: { label: '' },
    hName: { label: 'Name', kind: 'columnheader' },
    rAda: { label: 'Ada', kind: 'rowheader' },
    cAda: { label: 'Lovelace' },
  },
  relations: {
    rowKeys: ['headerRow', 'dataRow'],
    columnKeys: ['rowHeaderColumn', 'nameColumn'],
    cells: [
      { rowKey: 'headerRow', columnKey: 'rowHeaderColumn', cellKey: 'corner' },
      { rowKey: 'headerRow', columnKey: 'nameColumn', cellKey: 'hName' },
      { rowKey: 'dataRow', columnKey: 'rowHeaderColumn', cellKey: 'rAda' },
      { rowKey: 'dataRow', columnKey: 'nameColumn', cellKey: 'cAda' },
    ],
  },
  state: {
    activeKey: 'rAda',
    selectedKeys: ['rAda'],
    rowIndexByKey: {
      headerRow: 1,
      dataRow: 2,
      corner: 1,
      hName: 1,
      rAda: 2,
      cAda: 2,
    },
    columnIndexByKey: {
      corner: 1,
      hName: 2,
      rAda: 1,
      cAda: 2,
    },
    rowCount: 2,
    colCount: 2,
  },
  refs: { label: 'Row header grid' },
} satisfies PatternData

describe('Grid demo (layoutLinks)', () => {
  it('advertises rowcount, colcount, and aria-readonly', () => {
    render(<GridDemo variant="layoutLinks" />)
    const grid = screen.getByRole('grid')
    expect(grid.getAttribute('aria-rowcount')).toBe('2')
    expect(grid.getAttribute('aria-colcount')).toBe('3')
    expect(grid.getAttribute('aria-readonly')).toBe('true')
    expect(grid.getAttribute('aria-label')).toBe('Related Documents')
  })

  it('moves active cell with ArrowRight then ArrowDown', () => {
    render(<GridDemo variant="layoutLinks" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(cellOf('core').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowDown' })
    expect(cellOf('html').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowLeft' })
    expect(cellOf('wcag').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'ArrowUp' })
    expect(cellOf('aria').hasAttribute('data-active')).toBe(true)
  })
})

describe('Grid demo (dataTransactions)', () => {
  it('Home/End move to row start/end; Ctrl+Home/End to grid extremes', () => {
    render(<GridDemo variant="dataTransactions" />)
    const grid = screen.getByRole('grid')

    // Active starts at c12. End -> c13.
    fireEvent.keyDown(grid, { key: 'End' })
    expect(cellOf('c13').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home' })
    expect(cellOf('c11').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'End', ctrlKey: true })
    expect(cellOf('c33').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'Home', ctrlKey: true })
    expect(cellOf('hDate').hasAttribute('data-active')).toBe(true)
  })

  it('click selects a cell (aria-selected=true)', () => {
    render(<GridDemo variant="dataTransactions" />)

    fireEvent.click(cellOf('c22'))
    expect(cellOf('c22').getAttribute('aria-selected')).toBe('true')
    // Previously selected c12 should no longer be selected (single-select).
    expect(cellOf('c12').getAttribute('aria-selected')).not.toBe('true')
  })

  it('exposes aria-rowindex/aria-colindex on cells', () => {
    render(<GridDemo variant="dataTransactions" />)
    expect(cellOf('c22').getAttribute('aria-rowindex')).toBe('3')
    expect(cellOf('c22').getAttribute('aria-colindex')).toBe('2')
  })

  it('projects rowheader cells from relations.cells with grid indices and selection state', () => {
    render(<GridDataDemo initialData={rowHeaderGridData} />)
    const grid = screen.getByRole('grid')
    const rowHeader = cellOf('rAda')

    expect(rowHeader.getAttribute('role')).toBe('rowheader')
    expect(rowHeader.getAttribute('aria-rowindex')).toBe('2')
    expect(rowHeader.getAttribute('aria-colindex')).toBe('1')
    expect(rowHeader.getAttribute('aria-selected')).toBe('true')
    expect(rowHeader.getAttribute('tabindex')).toBe('0')

    fireEvent.keyDown(grid, { key: 'ArrowRight' })
    expect(cellOf('cAda').hasAttribute('data-active')).toBe(true)
    expect(cellOf('cAda').getAttribute('role')).toBe('gridcell')
    expect(cellOf('cAda').getAttribute('aria-colindex')).toBe('2')
  })

  it('projects row and column spans for merged cells', () => {
    render(
      <GridDataDemo
        initialData={{
          ...gridVariants.dataTransactions.data,
          state: {
            ...gridVariants.dataTransactions.data.state,
            rowSpanByKey: { c11: 2, hDate: 1 },
            colSpanByKey: { c11: 3, hDate: 2, c12: 1 },
          },
        }}
      />,
    )

    expect(cellOf('c11').getAttribute('aria-rowspan')).toBe('2')
    expect(cellOf('c11').getAttribute('aria-colspan')).toBe('3')
    expect(cellOf('hDate').getAttribute('aria-colspan')).toBe('2')
    expect(cellOf('hDate').hasAttribute('aria-rowspan')).toBe(false)
    expect(cellOf('c12').hasAttribute('aria-colspan')).toBe(false)
  })

  it('does not opt single-select grids into Shift+Arrow range selection', () => {
    render(<GridDemo variant="dataTransactions" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight', shiftKey: true })

    expect(cellOf('c12').hasAttribute('data-active')).toBe(true)
    expect(selectedKeys()).toEqual(['c12'])
  })
})

describe('Grid demo (dataSortable)', () => {
  it('clicking a header toggles aria-sort ascending -> descending', () => {
    render(<GridDemo variant="dataSortable" />)
    const header = cellOf('hName')
    expect(header.getAttribute('aria-sort')).toBe('ascending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('descending')

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })

  it('clicking an unsorted header sets ascending', () => {
    render(<GridDemo variant="dataSortable" />)
    const header = cellOf('hDistance')
    expect(header.getAttribute('aria-sort')).toBeNull()

    fireEvent.click(header)
    expect(header.getAttribute('aria-sort')).toBe('ascending')
  })
})

describe('Grid demo (dataEditable)', () => {
  it('does NOT advertise aria-readonly', () => {
    render(<GridDemo variant="dataEditable" />)
    expect(screen.getByRole('grid').getAttribute('aria-readonly')).toBeNull()
  })

  it('F2 enters edit mode and Enter commits a new value', () => {
    render(<GridDemo variant="dataEditable" />)
    const grid = screen.getByRole('grid')
    // Initial active is e11 ("Ada")
    expect(cellOf('e11').textContent).toBe('Ada')

    fireEvent.keyDown(grid, { key: 'F2' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    expect(input).toBeTruthy()

    fireEvent.change(input, { target: { value: 'Augusta' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    expect(cellOf('e11').textContent).toBe('Augusta')
  })

  it('Enter on an editable cell enters edit mode; Escape cancels without committing', () => {
    render(<GridDemo variant="dataEditable" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'Enter' })
    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    expect(input).toBeTruthy()

    fireEvent.change(input, { target: { value: 'CHANGED' } })
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    expect(cellOf('e11').textContent).toBe('Ada')
  })

  it('renders non-string draft values as editable text before committing', () => {
    render(
      <GridDataDemo
        initialData={{
          ...gridVariants.dataEditable.data,
          state: {
            ...gridVariants.dataEditable.data.state,
            activeKey: 'e11',
            editingKey: 'e11',
            editDraftByKey: { e11: 42, e12: true },
          },
        }}
      />,
    )

    const input = cellOf('e11').querySelector('input[data-edit]') as HTMLInputElement
    expect(input.value).toBe('42')

    fireEvent.keyDown(input, { key: 'Enter' })

    expect(cellOf('e11').querySelector('input[data-edit]')).toBeNull()
    expect(cellOf('e11').textContent).toBe('42')
  })
})

describe('Grid demo (dataAdvanced, multi-select)', () => {
  it('advertises aria-multiselectable', () => {
    render(<GridDemo variant="dataAdvanced" />)
    expect(screen.getByRole('grid').getAttribute('aria-multiselectable')).toBe('true')
    expect(screen.getByRole('grid').getAttribute('aria-colcount')).toBe('4')
  })

  it('clicking cells updates aria-selected (multi-select grid)', () => {
    render(<GridDemo variant="dataAdvanced" />)
    // av11 starts active+selected.
    expect(cellOf('av11').getAttribute('aria-selected')).toBe('true')

    fireEvent.click(cellOf('av22'))
    expect(cellOf('av22').getAttribute('aria-selected')).toBe('true')

    fireEvent.click(cellOf('av13'))
    expect(cellOf('av13').getAttribute('aria-selected')).toBe('true')
  })

  it('extends selection ranges with Shift+Arrow keys', () => {
    render(<GridDemo variant="dataAdvanced" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight', shiftKey: true })
    expect(cellOf('av12').hasAttribute('data-active')).toBe(true)
    expect(selectedKeys()).toEqual(['av11', 'av12'])

    fireEvent.keyDown(grid, { key: 'ArrowDown', shiftKey: true })
    expect(cellOf('av22').hasAttribute('data-active')).toBe(true)
    expect(selectedKeys()).toEqual(['av11', 'av12', 'av21', 'av22'])
    expect(cellOf('av23').getAttribute('aria-selected')).not.toBe('true')
  })

  it('extends to row boundaries with Shift+Home and Shift+End', () => {
    render(<GridDemo variant="dataAdvanced" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'End', shiftKey: true })
    expect(cellOf('av14').hasAttribute('data-active')).toBe(true)
    expect(selectedKeys()).toEqual(['av11', 'av12', 'av13', 'av14'])

    fireEvent.keyDown(grid, { key: 'Home', shiftKey: true })
    expect(cellOf('av11').hasAttribute('data-active')).toBe(true)
    expect(selectedKeys()).toEqual(['av11'])
  })

  it('selects all cells, the active column, and the active row from keyboard shortcuts', () => {
    render(<GridDemo variant="dataAdvanced" />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'a', ctrlKey: true })
    expect(selectedKeys()).toEqual([
      'hQ1',
      'hQ2',
      'hQ3',
      'hQ4',
      'av11',
      'av12',
      'av13',
      'av14',
      'av21',
      'av22',
      'av23',
      'av24',
      'av31',
      'av32',
      'av33',
      'av34',
    ])

    fireEvent.click(cellOf('av22'))
    fireEvent.keyDown(grid, { key: ' ', ctrlKey: true })
    expect(selectedKeys()).toEqual(['hQ2', 'av12', 'av22', 'av32'])

    fireEvent.keyDown(grid, { key: ' ', shiftKey: true })
    expect(selectedKeys()).toEqual(['av31', 'av32', 'av33', 'av34'])
  })

  it('exposes active, selected, anchor, and extent keys from useGridPattern state', () => {
    render(<GridRuntimeStateDemo initialData={gridVariants.dataAdvanced.data} />)
    const grid = screen.getByRole('grid')

    fireEvent.keyDown(grid, { key: 'ArrowRight', shiftKey: true })

    expect(screen.getByTestId('grid-runtime-state').textContent).toBe('av12|av11|av12|av11,av12')
  })
})

describe('Grid demo (layoutButtons) PageDown/PageUp', () => {
  it('PageDown jumps down up to 5 rows (clamped to last row)', () => {
    render(<GridDemo variant="layoutButtons" />)
    const grid = screen.getByRole('grid')
    // Active starts at play (row1, col2).
    fireEvent.keyDown(grid, { key: 'PageDown' })
    expect(cellOf('pause').hasAttribute('data-active')).toBe(true)

    fireEvent.keyDown(grid, { key: 'PageUp' })
    expect(cellOf('play').hasAttribute('data-active')).toBe(true)
  })
})

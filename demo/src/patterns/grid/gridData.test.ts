import { describe, expect, it } from 'vitest'
import { gridVariantItems, gridVariants, type GridVariantKey } from './gridData'

const variantKeys = Object.keys(gridVariants) as GridVariantKey[]

describe('grid variant specs', () => {
  it('exposes the complete demo variant set in menu order', () => {
    expect(gridVariantItems).toEqual([
      { key: 'layoutLinks', label: 'Layout: links' },
      { key: 'layoutButtons', label: 'Layout: widgets' },
      { key: 'dataTransactions', label: 'Data: read-only' },
      { key: 'dataSortable', label: 'Data: sortable' },
      { key: 'dataEditable', label: 'Data: editable' },
      { key: 'dataAdvanced', label: 'Data: advanced' },
    ])
  })

  it.each(variantKeys)('%s has valid grid dimensions and active cell metadata', (key) => {
    const data = gridVariants[key].data
    const rowKeys = data.relations?.rowKeys ?? []
    const columnKeys = data.relations?.columnKeys ?? []
    const cells = data.relations?.cells ?? []
    const activeKey = data.state?.activeKey

    expect(rowKeys.length).toBeGreaterThan(0)
    expect(columnKeys.length).toBeGreaterThan(0)
    expect(data.state?.rowCount).toBe(rowKeys.length)
    expect(data.state?.colCount).toBe(columnKeys.length)
    expect(cells.length).toBe(rowKeys.length * columnKeys.length)
    expect(typeof activeKey).toBe('string')
    expect(cells.some((cell) => cell.cellKey === activeKey)).toBe(true)
    expect(data.state?.selectedKeys).toContain(activeKey)
  })

  it('keeps layout variants read-only and without data-grid headers', () => {
    for (const key of ['layoutLinks', 'layoutButtons'] as const) {
      const data = gridVariants[key].data
      expect(data.state?.readonly).toBe(true)
      expect(Object.values(data.items).some((item) => item.kind === 'columnheader')).toBe(false)
      expect(data.state?.sortByKey).toBeUndefined()
      expect(data.state?.editableKeys).toBeUndefined()
    }
  })

  it('keeps data variants structured with headers and expected capabilities', () => {
    expect(Object.values(gridVariants.dataTransactions.data.items).filter((item) => item.kind === 'columnheader')).toHaveLength(3)
    expect(gridVariants.dataTransactions.data.state?.readonly).toBe(true)

    expect(gridVariants.dataSortable.data.state?.sortByKey).toEqual({ hName: 'ascending' })
    expect(gridVariants.dataSortable.data.state?.readonly).toBe(true)

    expect(gridVariants.dataEditable.data.state?.readonly).toBeUndefined()
    expect(gridVariants.dataEditable.data.state?.editableKeys).toEqual(['e11', 'e12', 'e13', 'e21', 'e22', 'e23', 'e31', 'e32', 'e33'])

    expect(gridVariants.dataAdvanced.data.state?.multiselectable).toBe(true)
    expect(gridVariants.dataAdvanced.data.state?.colCount).toBe(4)
  })
})

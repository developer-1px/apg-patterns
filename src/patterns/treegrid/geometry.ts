import { visibleTreeItems } from '@interactive-os/collection-navigation'
import type { Key, PatternData } from '../../schema'

export const visibleRowKeys = (data: PatternData): readonly Key[] => {
  const rootKeys = data.relations?.rootKeys ?? data.relations?.rowKeys ?? []
  const expanded = new Set(data.state?.expandedKeys ?? [])
  return visibleTreeItems({
    roots: rootKeys,
    children: (key) => data.relations?.childrenByKey?.[key] ?? [],
    isExpanded: (key) => expanded.has(key),
  })
}

export const visibleCells = (data: PatternData): readonly (readonly Key[])[] => {
  const cols = data.relations?.columnKeys ?? []
  return visibleRowKeys(data).map((rowKey) =>
    cols
      .map((columnKey) => data.relations?.cells?.find((c) => c.rowKey === rowKey && c.columnKey === columnKey)?.cellKey)
      .filter((k): k is Key => Boolean(k)),
  )
}

export const cellRowKey = (data: PatternData, cellKey: Key | null | undefined): Key | null => {
  if (!cellKey) return null
  return data.relations?.cells?.find((c) => c.cellKey === cellKey)?.rowKey ?? null
}

import { PatternDataSchema } from '../../../../src/react'

type Node = {
  key: string
  name: string
  kind: 'folder' | 'file'
  size: string
  modified: string
  children?: readonly Node[]
}

const tree: readonly Node[] = [
  {
    key: 'src',
    name: 'src',
    kind: 'folder',
    size: '—',
    modified: '2026-05-01',
    children: [
      {
        key: 'components',
        name: 'components',
        kind: 'folder',
        size: '—',
        modified: '2026-05-02',
        children: [
          { key: 'button.tsx', name: 'Button.tsx', kind: 'file', size: '2 KB', modified: '2026-05-03' },
          { key: 'input.tsx', name: 'Input.tsx', kind: 'file', size: '3 KB', modified: '2026-05-04' },
        ],
      },
      { key: 'index.ts', name: 'index.ts', kind: 'file', size: '1 KB', modified: '2026-05-05' },
    ],
  },
  {
    key: 'docs',
    name: 'docs',
    kind: 'folder',
    size: '—',
    modified: '2026-05-06',
    children: [
      { key: 'readme.md', name: 'README.md', kind: 'file', size: '4 KB', modified: '2026-05-07' },
    ],
  },
  { key: 'pkg.json', name: 'package.json', kind: 'file', size: '0.5 KB', modified: '2026-05-08' },
]

const COLUMNS = ['name', 'size', 'modified'] as const
const COLUMN_LABELS: Record<(typeof COLUMNS)[number], string> = {
  name: 'Name',
  size: 'Size',
  modified: 'Modified',
}

const cellKey = (rowKey: string, columnKey: string) => `${rowKey}:${columnKey}`

type Built = {
  rowKeys: string[]
  rootKeys: string[]
  childrenByKey: Record<string, readonly string[]>
  levelByKey: Record<string, number>
  cells: { rowKey: string; columnKey: string; cellKey: string }[]
  items: Record<string, { label: string; kind?: 'columnheader' }>
  rowIndexByKey: Record<string, number>
  columnIndexByKey: Record<string, number>
  valueByKey: Record<string, string>
}

const buildTree = (): Built => {
  const built: Built = {
    rowKeys: [],
    rootKeys: [],
    childrenByKey: {},
    levelByKey: {},
    cells: [],
    items: {},
    rowIndexByKey: {},
    columnIndexByKey: {},
    valueByKey: {},
  }

  // Column key item entries (required by PatternData schema for relations.cells.columnKey refs).
  COLUMNS.forEach((col) => {
    built.items[col] = { label: COLUMN_LABELS[col] }
  })

  built.rowKeys.push('headerRow')
  built.rowIndexByKey['headerRow'] = 1
  built.items['headerRow'] = { label: 'Header row' }
  COLUMNS.forEach((col, i) => {
    const k = `h-${col}`
    built.items[k] = { label: COLUMN_LABELS[col], kind: 'columnheader' }
    built.cells.push({ rowKey: 'headerRow', columnKey: col, cellKey: k })
    built.rowIndexByKey[k] = 1
    built.columnIndexByKey[k] = i + 1
  })

  let rowIndex = 2
  const walk = (nodes: readonly Node[], level: number, parentKey: string | null) => {
    const siblingKeys: string[] = []
    for (const node of nodes) {
      siblingKeys.push(node.key)
      built.rowKeys.push(node.key)
      built.levelByKey[node.key] = level
      built.rowIndexByKey[node.key] = rowIndex
      built.items[node.key] = { label: node.name }
      COLUMNS.forEach((col, i) => {
        const k = cellKey(node.key, col)
        const value = col === 'name' ? node.name : col === 'size' ? node.size : node.modified
        built.items[k] = { label: value }
        built.valueByKey[k] = value
        built.cells.push({ rowKey: node.key, columnKey: col, cellKey: k })
        built.rowIndexByKey[k] = rowIndex
        built.columnIndexByKey[k] = i + 1
      })
      rowIndex += 1
      if (node.children && node.children.length > 0) {
        walk(node.children, level + 1, node.key)
      }
    }
    if (parentKey) built.childrenByKey[parentKey] = siblingKeys
    else built.rootKeys = siblingKeys
  }
  walk(tree, 1, null)
  return built
}

const built = buildTree()

export const initialTreegridData = PatternDataSchema.parse({
  items: built.items,
  relations: {
    rowKeys: built.rowKeys,
    columnKeys: [...COLUMNS],
    rootKeys: ['headerRow', ...built.rootKeys],
    childrenByKey: built.childrenByKey,
    cells: built.cells,
  },
  state: {
    activeKey: cellKey('src', 'name'),
    selectedKeys: [cellKey('src', 'name')],
    expandedKeys: ['src'],
    levelByKey: built.levelByKey,
    rowIndexByKey: built.rowIndexByKey,
    columnIndexByKey: built.columnIndexByKey,
    rowCount: built.rowKeys.length,
    colCount: COLUMNS.length,
    valueByKey: built.valueByKey,
  },
  refs: { label: 'File browser' },
})

export const treegridFirstCell = (rowKey: string) => cellKey(rowKey, 'name')

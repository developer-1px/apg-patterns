import type { PatternData } from '../../src'

// ─────────────────────────────────────────────────────────────────────────────
// APG treeview examples (https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)
//
// Three variants:
//   1. fileDirectoryComputed  — File Directory Treeview using Computed Properties
//                              (aria-level / posinset / setsize materialised from
//                               the relations graph at variant-build time)
//   2. fileDirectoryDeclared  — File Directory Treeview using Declared Properties
//                              (the author writes level/posinset/setsize literals)
//   3. navigation             — Navigation Treeview
//                              (treeitem activation == link follow; href ref kept
//                               next to label, single-select reflects current page)
// ─────────────────────────────────────────────────────────────────────────────

export type TreeVariantKey = 'fileDirectoryComputed' | 'fileDirectoryDeclared' | 'navigation'

export interface TreeVariantSpec {
  readonly key: TreeVariantKey
  readonly label: string
  readonly description: string
  readonly data: PatternData
  readonly itemKind: 'folder' | 'link'
}

// ───── Shared helpers ──────────────────────────────────────────────────────

type Node = {
  key: string
  label: string
  href?: string
  children?: readonly Node[]
}

function flattenTree(roots: readonly Node[]) {
  const items: Record<string, { label: string; textValue?: string; href?: string }> = {}
  const childrenByKey: Record<string, string[]> = {}
  const levelByKey: Record<string, number> = {}
  const posInSetByKey: Record<string, number> = {}
  const setSizeByKey: Record<string, number> = {}
  const typeaheadTextByKey: Record<string, string> = {}
  const rootKeys = roots.map((node) => node.key)

  const visit = (nodes: readonly Node[], level: number) => {
    nodes.forEach((node, index) => {
      items[node.key] = { label: node.label, textValue: node.label.toLowerCase(), href: node.href }
      typeaheadTextByKey[node.key] = node.label.toLowerCase()
      levelByKey[node.key] = level
      posInSetByKey[node.key] = index + 1
      setSizeByKey[node.key] = nodes.length
      const children = node.children ?? []
      childrenByKey[node.key] = children.map((child) => child.key)
      if (children.length) visit(children, level + 1)
    })
  }
  visit(roots, 1)

  return { items, rootKeys, childrenByKey, levelByKey, posInSetByKey, setSizeByKey, typeaheadTextByKey }
}

// ───── 1 & 2. File-directory tree (shared structure, different state author) ─

const fileTreeRoots: readonly Node[] = [
  {
    key: 'projects',
    label: 'Projects',
    children: [
      {
        key: 'project-1',
        label: 'project-1',
        children: [
          { key: 'project-1-src', label: 'src' },
          { key: 'project-1-readme', label: 'README.md' },
        ],
      },
      {
        key: 'project-2',
        label: 'project-2',
        children: [
          { key: 'project-2-src', label: 'src' },
          { key: 'project-2-public', label: 'public' },
        ],
      },
    ],
  },
  {
    key: 'reports',
    label: 'Reports',
    children: [
      {
        key: 'reports-2024',
        label: '2024',
        children: [
          { key: 'reports-2024-q1', label: 'Q1' },
          { key: 'reports-2024-q2', label: 'Q2' },
        ],
      },
      { key: 'reports-2025', label: '2025' },
    ],
  },
  { key: 'archive', label: 'Archive' },
]

const fileFlat = flattenTree(fileTreeRoots)

const fileDirectoryComputed: PatternData = {
  items: fileFlat.items,
  relations: {
    rootKeys: fileFlat.rootKeys,
    childrenByKey: fileFlat.childrenByKey,
  },
  state: {
    activeKey: 'projects',
    expandedKeys: ['projects'],
    selectedKeys: [],
    // computed from relations at build time
    levelByKey: fileFlat.levelByKey,
    posInSetByKey: fileFlat.posInSetByKey,
    setSizeByKey: fileFlat.setSizeByKey,
    typeaheadTextByKey: fileFlat.typeaheadTextByKey,
  },
  refs: { label: 'File directory (computed properties)' },
}

// "Declared" variant — same shape, but the level/posinset/setsize are written by
// hand to mirror APG's "declared properties" example (author maintains them).
const fileDirectoryDeclared: PatternData = {
  items: fileFlat.items,
  relations: {
    rootKeys: fileFlat.rootKeys,
    childrenByKey: fileFlat.childrenByKey,
  },
  state: {
    activeKey: 'projects',
    expandedKeys: ['projects', 'project-1'],
    selectedKeys: ['project-1-readme'],
    levelByKey: {
      projects: 1, reports: 1, archive: 1,
      'project-1': 2, 'project-2': 2,
      'reports-2024': 2, 'reports-2025': 2,
      'project-1-src': 3, 'project-1-readme': 3,
      'project-2-src': 3, 'project-2-public': 3,
      'reports-2024-q1': 3, 'reports-2024-q2': 3,
    },
    posInSetByKey: {
      projects: 1, reports: 2, archive: 3,
      'project-1': 1, 'project-2': 2,
      'reports-2024': 1, 'reports-2025': 2,
      'project-1-src': 1, 'project-1-readme': 2,
      'project-2-src': 1, 'project-2-public': 2,
      'reports-2024-q1': 1, 'reports-2024-q2': 2,
    },
    setSizeByKey: {
      projects: 3, reports: 3, archive: 3,
      'project-1': 2, 'project-2': 2,
      'reports-2024': 2, 'reports-2025': 2,
      'project-1-src': 2, 'project-1-readme': 2,
      'project-2-src': 2, 'project-2-public': 2,
      'reports-2024-q1': 2, 'reports-2024-q2': 2,
    },
    typeaheadTextByKey: fileFlat.typeaheadTextByKey,
  },
  refs: { label: 'File directory (declared properties)' },
}

// ───── 3. Navigation treeview ───────────────────────────────────────────────

const navRoots: readonly Node[] = [
  {
    key: 'guides',
    label: 'Guides',
    href: '#guides',
    children: [
      { key: 'getting-started', label: 'Getting Started', href: '#guides/getting-started' },
      { key: 'concepts', label: 'Concepts', href: '#guides/concepts' },
      { key: 'recipes', label: 'Recipes', href: '#guides/recipes' },
    ],
  },
  {
    key: 'reference',
    label: 'Reference',
    href: '#reference',
    children: [
      { key: 'api', label: 'API', href: '#reference/api' },
      { key: 'cli', label: 'CLI', href: '#reference/cli' },
    ],
  },
  { key: 'changelog', label: 'Changelog', href: '#changelog' },
]

const navFlat = flattenTree(navRoots)

const navigation: PatternData = {
  items: navFlat.items,
  relations: {
    rootKeys: navFlat.rootKeys,
    childrenByKey: navFlat.childrenByKey,
  },
  state: {
    activeKey: 'getting-started',
    expandedKeys: ['guides'],
    selectedKeys: ['getting-started'],
    levelByKey: navFlat.levelByKey,
    posInSetByKey: navFlat.posInSetByKey,
    setSizeByKey: navFlat.setSizeByKey,
    typeaheadTextByKey: navFlat.typeaheadTextByKey,
  },
  refs: { label: 'Navigation treeview' },
}

// ───── Registry ────────────────────────────────────────────────────────────

export const treeVariants: Record<TreeVariantKey, TreeVariantSpec> = {
  fileDirectoryComputed: {
    key: 'fileDirectoryComputed',
    label: 'File directory · computed',
    description: 'aria-level/posinset/setsize computed from relations',
    data: fileDirectoryComputed,
    itemKind: 'folder',
  },
  fileDirectoryDeclared: {
    key: 'fileDirectoryDeclared',
    label: 'File directory · declared',
    description: 'aria-level/posinset/setsize written by the author',
    data: fileDirectoryDeclared,
    itemKind: 'folder',
  },
  navigation: {
    key: 'navigation',
    label: 'Navigation',
    description: 'treeitem activation follows links; single-select = current page',
    data: navigation,
    itemKind: 'link',
  },
}

export const treeVariantItems: readonly Pick<TreeVariantSpec, 'key' | 'label'>[] = (
  Object.values(treeVariants) as TreeVariantSpec[]
).map(({ key, label }) => ({ key, label }))

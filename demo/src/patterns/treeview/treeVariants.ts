import type { PatternData } from '../../../../src/react'
import { fileDirectoryComputed, fileDirectoryDeclared, navigation } from './treeVariantData'

export type TreeVariantKey = 'fileDirectoryComputed' | 'fileDirectoryDeclared' | 'navigation'

export interface TreeVariantSpec {
  readonly key: TreeVariantKey
  readonly label: string
  readonly description: string
  readonly data: PatternData
  readonly itemKind: 'folder' | 'link'
}

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

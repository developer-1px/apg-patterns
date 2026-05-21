import type { PatternData } from '../../../../src/react'
import { fileDirectoryComputed, fileDirectoryDeclared, navigation } from './treeVariantData'

export type TreeVariantKey = 'fileDirectoryComputed' | 'fileDirectoryDeclared' | 'navigation'

interface TreeVariantSpec {
  readonly label: string
  readonly data: PatternData
}

export const treeVariants: Record<TreeVariantKey, TreeVariantSpec> = {
  fileDirectoryComputed: {
    label: 'File directory · computed',
    data: fileDirectoryComputed,
  },
  fileDirectoryDeclared: {
    label: 'File directory · declared',
    data: fileDirectoryDeclared,
  },
  navigation: {
    label: 'Navigation',
    data: navigation,
  },
}

export const treeVariantItems: readonly { key: TreeVariantKey; label: string }[] = Object.entries(treeVariants).map(([key, value]) => ({
  key: key as TreeVariantKey,
  label: value.label,
}))

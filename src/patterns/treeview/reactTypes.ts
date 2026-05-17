import type { HTMLAttributes } from 'react'
import type { Key } from '../../schema'
import type { TreeviewRuntime } from './runtime'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'

export type ReactTreeviewProps = HTMLAttributes<HTMLElement>

export type ReactTreeviewRenderItem =
  | {
      kind: 'leaf'
      key: Key
      label: string
      textValue: string
      level: number
      parentKey: Key | null
      indexInParent: number
      state: ReactRenderItemState
      treeitemProps: ReactPatternProps
    }
  | {
      kind: 'branch'
      key: Key
      label: string
      textValue: string
      level: number
      parentKey: Key | null
      indexInParent: number
      state: ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
      treeitemProps: ReactPatternProps
      toggleButtonProps: ReactPatternProps
    }

export interface ReactTreeviewRuntime extends Omit<TreeviewRuntime, 'getTreeProps' | 'getTreeItemProps' | 'getIndicatorProps' | 'slotProps' | 'items'> {
  items: readonly (Omit<TreeviewRuntime['items'][number], 'slotProps'> & {
    slotProps: {
      treeitem: ReactTreeviewProps
      indicator?: ReactTreeviewProps
    }
  })[]
  slotProps: {
    tree: ReactTreeviewProps
  }
  rootProps: ReactTreeviewProps
  renderItems: readonly ReactTreeviewRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
    expandedKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
    toggle(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  getTreeProps(): ReactTreeviewProps
  getTreeItemProps(key: string): ReactTreeviewProps
  getIndicatorProps(key: string): ReactTreeviewProps
}

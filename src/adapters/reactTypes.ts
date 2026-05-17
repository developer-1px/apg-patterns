import type { HTMLAttributes } from 'react'
import type { TreeviewRuntime } from '../patterns/treeview/runtime'
import type { TabsRuntime } from '../patterns/tabs/runtime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../schema'

export type ReactTreeviewProps = HTMLAttributes<HTMLElement>

export type ReactPatternProps = HTMLAttributes<HTMLElement>

export interface ReactRenderItemState {
  active: boolean
  selected: boolean
  disabled: boolean
}

export interface ReactListboxRenderItem {
  kind: 'option'
  key: Key
  label: string
  textValue: string
  state: ReactRenderItemState
  optionProps: ReactPatternProps
}

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

export interface CreateReactPatternInput {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
}

export interface ReactListboxRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactListboxRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
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

export type ReactTabsProps = HTMLAttributes<HTMLElement>

export interface ReactTabsRuntime extends Omit<TabsRuntime, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactTabsProps
  getTabProps(key: string): ReactTabsProps
  getTabPanelProps(key: string): ReactTabsProps
}

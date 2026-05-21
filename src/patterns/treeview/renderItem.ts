import type { Key, PatternData } from '../../schema'
import type { SlotProps } from '../../kernel/patternRuntime'
import type { TreeviewRenderState } from './renderState'
import { getTreeItemState } from './renderState'
import { resolveTreeviewVisibleKeys } from './typeahead'

export interface TreeviewRenderItem {
  key: Key
  state: TreeviewRenderState
  slotProps: {
    treeitem: SlotProps
    indicator?: SlotProps
  }
}

export function createTreeviewRenderItems(
  data: PatternData,
  getTreeItemProps: (key: Key) => SlotProps,
  getIndicatorProps: (key: Key) => SlotProps,
): readonly TreeviewRenderItem[] {
  return resolveTreeviewVisibleKeys(data).map((key) => ({
    key,
    state: getTreeItemState(data, key),
    slotProps: { treeitem: getTreeItemProps(key), indicator: getIndicatorProps(key) },
  }))
}

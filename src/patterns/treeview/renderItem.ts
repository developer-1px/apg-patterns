import type { Key, PatternData } from '../../schema'
import type { TreeviewRenderState } from './renderState'
import { getTreeItemState } from './renderState'
import { resolveTreeviewVisibleKeys } from './typeahead'

export type TreeviewSlotProps = Record<string, unknown>

export interface TreeviewRenderItem {
  key: Key
  state: TreeviewRenderState
  slotProps: {
    treeitem: TreeviewSlotProps
    indicator?: TreeviewSlotProps
  }
}

export function createTreeviewRenderItems(
  data: PatternData,
  getTreeItemProps: (key: Key) => TreeviewSlotProps,
  getIndicatorProps: (key: Key) => TreeviewSlotProps,
): readonly TreeviewRenderItem[] {
  return resolveTreeviewVisibleKeys(data).map((key) => ({
    key,
    state: getTreeItemState(data, key),
    slotProps: { treeitem: getTreeItemProps(key), indicator: getIndicatorProps(key) },
  }))
}

import type { SlotProps } from '../../kernel/patternRuntime'
import type { ReactPatternProps, ReactRenderItemState } from '../../adapters/reactBaseTypes'
import type { Key } from '../../schema'
import type { TreeviewRenderState, TreeviewRuntime } from './runtime'
import { createParentByKey } from '../../kernel/patternKernel'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

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
      treeitem: ReactPatternProps
      indicator?: ReactPatternProps
    }
  })[]
  slotProps: {
    tree: ReactPatternProps
  }
  rootProps: ReactPatternProps
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
  getTreeProps(): ReactPatternProps
  getTreeItemProps(key: string): ReactPatternProps
  getIndicatorProps(key: string): ReactPatternProps
}

export function adaptTreeviewRuntime(runtime: TreeviewRuntime): ReactTreeviewRuntime {
  const getTreeProps = () => adaptTreeviewProps(runtime.getTreeProps())
  const getTreeItemProps = (key: string) => adaptTreeviewProps(runtime.getTreeItemProps(key))
  const getIndicatorProps = (key: string) => adaptTreeviewIndicatorProps(runtime.getIndicatorProps(key))

  return {
    ...runtime,
    get items() {
      return runtime.items.map((item) => ({
        ...item,
        slotProps: {
          treeitem: adaptTreeviewProps(item.slotProps.treeitem),
          indicator: item.slotProps.indicator ? adaptTreeviewIndicatorProps(item.slotProps.indicator) : undefined,
        },
      }))
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    get rootProps() {
      return getTreeProps()
    },
    get renderItems() {
      return createTreeviewRenderItems(runtime)
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
        expandedKeys: runtime.data.state?.expandedKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
        toggle: (key: Key) => runtime.emit({ type: 'expand', key, expanded: !(runtime.data.state?.expandedKeys ?? []).includes(key) }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}

function adaptTreeviewProps(props: SlotProps): ReactPatternProps {
  return props as ReactPatternProps
}

function adaptTreeviewIndicatorProps(props: SlotProps): ReactPatternProps {
  const reactProps = adaptTreeviewProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    type: 'button',
    tabIndex: -1,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  } as ReactPatternProps
}

function createTreeviewRenderItems(runtime: TreeviewRuntime): readonly ReactTreeviewRenderItem[] {
  const parentByKey = createParentByKey(runtime.data)
  const indexInParentByKey = new Map<Key, number>()
  for (const [index, key] of (runtime.data.relations?.rootKeys ?? []).entries()) {
    indexInParentByKey.set(key, index + 1)
  }
  for (const children of Object.values(runtime.data.relations?.childrenByKey ?? {})) {
    for (const [index, key] of children.entries()) {
      indexInParentByKey.set(key, index + 1)
    }
  }
  return runtime.items.map((item) => {
    const key = item.key
    const hasChildren = (runtime.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
    const base = {
      key,
      label: getPatternItemLabel(runtime.data, key),
      textValue: getPatternItemTextValue(runtime.data, key),
      level: runtime.data.state?.levelByKey?.[key] ?? 1,
      parentKey: parentByKey.get(key) ?? null,
      indexInParent: indexInParentByKey.get(key) ?? 1,
      treeitemProps: adaptTreeviewProps(item.slotProps.treeitem),
    }
    if (!hasChildren) {
      return {
        kind: 'leaf',
        ...base,
        state: getTreeItemRenderState(item.state, false),
      }
    }
    return {
      kind: 'branch',
      ...base,
      state: getTreeItemRenderState(item.state, true),
      toggleButtonProps: adaptTreeviewIndicatorProps(item.slotProps.indicator ?? {}),
    }
  })
}

function getTreeItemRenderState(state: TreeviewRenderState, branch: false): ReactRenderItemState
function getTreeItemRenderState(state: TreeviewRenderState, branch: true): ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
function getTreeItemRenderState(state: TreeviewRenderState, branch: boolean): ReactRenderItemState | (ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }) {
  const base = {
    active: state.active,
    selected: state.selected,
    disabled: state.disabled,
  }
  if (!branch) return base
  return {
    ...base,
    expanded: state.expanded,
    toggleDisabled: state.disabled,
  }
}

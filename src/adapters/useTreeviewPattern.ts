import { useRef } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from '../patterns/treeview/runtime'
import { createParentByKey, resolveVisibleOrder } from '../kernel/patternKernel'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../schema'
import { usePatternEffects } from './reactPatternEffects'
import type { ReactRenderItemState, ReactTreeviewProps, ReactTreeviewRenderItem, ReactTreeviewRuntime } from './reactTypes'

export function useTreeviewPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime
export function useTreeviewPattern(input: CreateTreeviewRuntimeInput): ReactTreeviewRuntime
export function useTreeviewPattern(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime {
  const input = normalizePatternInput(inputOrData, onEvent, options)
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())

  const runtime = createTreeviewRuntime({
    data: input.data,
    options: input.options,
    typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
    onEvent: input.onEvent,
  })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return adaptRuntime(runtime)
}

function normalizePatternInput(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): CreateTreeviewRuntimeInput {
  if (onEvent) return { data: inputOrData, onEvent, options }
  return inputOrData as CreateTreeviewRuntimeInput
}

function adaptRuntime(runtime: TreeviewRuntime): ReactTreeviewRuntime {
  const getTreeProps = () => toReactProps(runtime.getTreeProps())
  const getTreeItemProps = (key: string) => toReactProps(runtime.getTreeItemProps(key))
  const getIndicatorProps = (key: string) => toIndicatorProps(runtime.getIndicatorProps(key))

  return {
    ...runtime,
    get items() {
      return runtime.items.map((item) => ({
        ...item,
        slotProps: {
          treeitem: toReactProps(item.slotProps.treeitem),
          indicator: item.slotProps.indicator ? toIndicatorProps(item.slotProps.indicator) : undefined,
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
      return createTreeviewRenderItems(runtime, getTreeItemProps, getIndicatorProps)
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

function createTreeviewRenderItems(
  runtime: TreeviewRuntime,
  getTreeItemProps: (key: Key) => ReactTreeviewProps,
  getIndicatorProps: (key: Key) => ReactTreeviewProps,
): readonly ReactTreeviewRenderItem[] {
  const parentByKey = createParentByKey(runtime.data)
  const visibleKeys = resolveVisibleOrder(runtime.definition.navigation.visibleOrder, runtime.data)
  return visibleKeys.map((key) => {
    const hasChildren = (runtime.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
    const base = {
      key,
      label: getLabel(runtime.data, key),
      textValue: getTextValue(runtime.data, key),
      level: runtime.data.state?.levelByKey?.[key] ?? 1,
      parentKey: parentByKey.get(key) ?? null,
      indexInParent: getIndexInParent(runtime.data, key),
      treeitemProps: getTreeItemProps(key),
    }
    if (!hasChildren) {
      return {
        kind: 'leaf',
        ...base,
        state: getTreeItemRenderState(runtime, key, false),
      }
    }
    return {
      kind: 'branch',
      ...base,
      state: getTreeItemRenderState(runtime, key, true),
      toggleButtonProps: getIndicatorProps(key),
    }
  })
}

function getLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: false): ReactRenderItemState
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: true): ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: boolean): ReactRenderItemState | (ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }) {
  const state = runtime.items.find((item) => item.key === key)?.state ?? { active: false, selected: false, disabled: false, expanded: false }
  const base = {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
  if (!branch) return base
  return {
    ...base,
    expanded: Boolean(state.expanded),
    toggleDisabled: Boolean(state.disabled),
  }
}

function getIndexInParent(data: PatternData, key: Key): number {
  const parentByKey = createParentByKey(data)
  const parentKey = parentByKey.get(key)
  const siblings = parentKey ? data.relations?.childrenByKey?.[parentKey] : data.relations?.rootKeys
  return (siblings?.indexOf(key) ?? 0) + 1
}

function toReactProps(props: TreeviewSlotProps): ReactTreeviewProps {
  return props as ReactTreeviewProps
}

function toIndicatorProps(props: TreeviewSlotProps): ReactTreeviewProps {
  const reactProps = toReactProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    type: 'button',
    tabIndex: -1,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  } as ReactTreeviewProps
}

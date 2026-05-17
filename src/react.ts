import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from './patterns/treeview/runtime'
import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from './patterns/tabs/runtime'
import type { Key, PatternData, PatternOptions } from './schema'
import type { PatternRuntime } from './patternRuntime'

export interface PatternAutoFocusRuntime {
  data: PatternData
  options?: PatternOptions
  keyToElementId?: (key: Key) => string
}

export interface PatternAutoFocusOptions {
  enabled?: boolean
  skipInitialFocus?: boolean
  suspend?: boolean
  preventScroll?: boolean
  keyToElementId?: (key: Key) => string
  getScopeElement?: () => HTMLElement | null
  getTargetElement?: (runtime: PatternAutoFocusRuntime, activeKey: Key) => HTMLElement | null
}

export function usePatternAutoFocus(
  runtime: PatternAutoFocusRuntime | PatternRuntime,
  {
    enabled = true,
    skipInitialFocus = false,
    suspend = false,
    preventScroll = true,
    keyToElementId = runtime.keyToElementId,
    getScopeElement,
    getTargetElement,
  }: PatternAutoFocusOptions = {},
) {
  const didMountRef = useRef(false)
  const activeKey = runtime.data.state?.activeKey ?? null
  const focusStrategy = runtime.options?.focusStrategy ?? 'rovingTabIndex'

  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      if (skipInitialFocus) return
    }
    if (!enabled || suspend || !activeKey) return
    const scope = getScopeElement?.()
    if (scope && !scope.contains(document.activeElement)) return
    const target =
      getTargetElement?.(runtime, activeKey) ??
      resolveAutoFocusTarget({ activeKey, focusStrategy, keyToElementId })
    target?.focus({ preventScroll })
  }, [activeKey, enabled, focusStrategy, getScopeElement, getTargetElement, keyToElementId, preventScroll, skipInitialFocus, suspend])
}

function resolveAutoFocusTarget({
  activeKey,
  focusStrategy,
  keyToElementId,
}: {
  activeKey: Key
  focusStrategy: PatternOptions['focusStrategy']
  keyToElementId?: (key: Key) => string
}) {
  const id = keyToElementId?.(activeKey) ?? activeKey
  if (focusStrategy === 'ariaActiveDescendant') {
    return findActiveDescendantHost(id) ?? document.getElementById(id)
  }
  return document.getElementById(id)
}

function findActiveDescendantHost(id: string) {
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('[aria-activedescendant]'))) {
    if (element.getAttribute('aria-activedescendant') === id) return element
  }
  return null
}

export type ReactTreeviewProps = HTMLAttributes<HTMLElement>

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
  getTreeProps(): ReactTreeviewProps
  getTreeItemProps(key: string): ReactTreeviewProps
  getIndicatorProps(key: string): ReactTreeviewProps
}

export function useTreeviewPattern(input: CreateTreeviewRuntimeInput): ReactTreeviewRuntime {
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())

  return adaptRuntime(
    createTreeviewRuntime({
      data: input.data,
      options: input.options,
      typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
      onEvent: input.onEvent,
    }),
  )
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
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}

function toReactProps(props: TreeviewSlotProps): ReactTreeviewProps {
  return props as ReactTreeviewProps
}

function toIndicatorProps(props: TreeviewSlotProps): ReactTreeviewProps {
  const reactProps = toReactProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  }
}

export type ReactTabsProps = HTMLAttributes<HTMLElement>

export interface ReactTabsRuntime extends Omit<TabsRuntime, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactTabsProps
  getTabProps(key: string): ReactTabsProps
  getTabPanelProps(key: string): ReactTabsProps
}

export function useTabsPattern(input: CreateTabsRuntimeInput): ReactTabsRuntime {
  return adaptTabsRuntime(
    createTabsRuntime({
      data: input.data,
      options: input.options,
      onEvent: input.onEvent,
      onDataChange: input.onDataChange,
    }),
  )
}

function adaptTabsRuntime(runtime: TabsRuntime): ReactTabsRuntime {
  return {
    ...runtime,
    getTablistProps: () => toReactProps(runtime.getTablistProps()),
    getTabProps: (key: string) => toReactProps(runtime.getTabProps(key)),
    getTabPanelProps: (key: string) => toReactProps(runtime.getTabPanelProps(key)),
  }
}

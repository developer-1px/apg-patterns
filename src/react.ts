import { useMemo, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from './treeviewRuntime'
import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from './tabsRuntime'

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
  const onEventRef = useRef(input.onEvent)
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())
  onEventRef.current = input.onEvent

  return useMemo(
    () =>
      adaptRuntime(
        createTreeviewRuntime({
          data: input.data,
          options: input.options,
          typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
          onEvent: (event) => onEventRef.current(event),
        }),
      ),
    [input.data, input.options, input.typeaheadBuffer],
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
  const onEventRef = useRef(input.onEvent)
  const onDataChangeRef = useRef(input.onDataChange)
  onEventRef.current = input.onEvent
  onDataChangeRef.current = input.onDataChange

  return useMemo(
    () =>
      adaptTabsRuntime(
        createTabsRuntime({
          data: input.data,
          options: input.options,
          onEvent: (event) => onEventRef.current(event),
          onDataChange: (data, event) => onDataChangeRef.current?.(data, event),
        }),
      ),
    [input.data, input.options],
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

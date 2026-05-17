import { useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from './patterns/treeview/runtime'
import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from './patterns/tabs/runtime'

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

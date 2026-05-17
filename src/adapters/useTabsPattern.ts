import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from '../patterns/tabs/runtime'
import type { ReactTabsProps, ReactTabsRuntime } from './reactTypes'

export function useTabsPattern(input: CreateTabsRuntimeInput): ReactTabsRuntime {
  return adaptTabsRuntime(
    createTabsRuntime({
      data: input.data,
      options: input.options,
      onEvent: input.onEvent,
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

function toReactProps(props: Record<string, unknown>): ReactTabsProps {
  return props as ReactTabsProps
}

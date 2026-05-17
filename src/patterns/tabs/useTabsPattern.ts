import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from './runtime'
import type { ReactTabsProps, ReactTabsRuntime } from '../../adapters/reactTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { tabsDefinition } from './definition'

export function useTabsPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTabsRuntime
export function useTabsPattern(input: CreateTabsRuntimeInput): ReactTabsRuntime
export function useTabsPattern(
  dataOrInput: PatternData | CreateTabsRuntimeInput,
  onEvent?: (event: PatternEvent) => void,
  options?: PatternOptions,
): ReactTabsRuntime {
  const input = isTabsInput(dataOrInput)
    ? dataOrInput
    : {
        data: dataOrInput,
        onEvent: onEvent ?? (() => undefined),
        options,
      }
  const keyToElementId = (key: string) => createTabElementId((input.options as PatternOptions | undefined)?.elementIdPrefix ?? 'tab-', key)
  const patternRuntime = useReactPatternRuntime({
    definition: tabsDefinition,
    data: input.data as PatternData,
    options: (input.options as PatternOptions | undefined) ?? {},
    keyToElementId,
    onEvent: input.onEvent,
  })
  const runtime = createTabsRuntime({ ...input, runtime: patternRuntime })
  return adaptTabsRuntime(runtime)
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

function isTabsInput(input: PatternData | CreateTabsRuntimeInput): input is CreateTabsRuntimeInput {
  return 'data' in input && 'onEvent' in input
}

function createTabElementId(prefix: string, key: string) {
  return `${prefix}${key.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`
}

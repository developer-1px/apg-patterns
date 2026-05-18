import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from './runtime'
import type { ReactTabsProps, ReactTabsRuntime } from '../../adapters/reactTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { tabsDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

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
  const patternOptions = (input.options as PatternOptions | undefined) ?? {}
  const keyToElementId = usePatternElementId(patternOptions, 'tab-')
  const patternRuntime = useReactPatternRuntime({
    definition: tabsDefinition,
    data: input.data as PatternData,
    options: patternOptions,
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

import { createTabsRuntime } from './runtime'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import type { PatternData, PatternEvent, PatternOptions } from '../../schema'
import { tabsDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactTabsRuntime extends Omit<ReturnType<typeof createTabsRuntime>, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactPatternProps
  getTabProps(key: string): ReactPatternProps
  getTabPanelProps(key: string): ReactPatternProps
}

export function useTabsPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTabsRuntime {
  const patternOptions = options ?? {}
  const keyToElementId = usePatternElementId(patternOptions, 'tab-')
  const patternRuntime = useReactPatternRuntime({
    definition: tabsDefinition,
    data,
    options: patternOptions,
    keyToElementId,
    onEvent,
  })
  const runtime = createTabsRuntime({ data, onEvent, options, runtime: patternRuntime })
  return {
    ...runtime,
    getTablistProps: () => toReactProps(runtime.getTablistProps()),
    getTabProps: (key: string) => toReactProps(runtime.getTabProps(key)),
    getTabPanelProps: (key: string) => toReactProps(runtime.getTabPanelProps(key)),
  }
}

function toReactProps(props: Record<string, unknown>): ReactPatternProps {
  return props as ReactPatternProps
}

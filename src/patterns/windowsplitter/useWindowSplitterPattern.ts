import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions, PatternValueStepDirection } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { windowSplitterDefinition } from './definition'
import { createWindowSplitterActions } from './windowSplitterActions'
import { createWindowSplitterSeparatorProps } from './windowSplitterSeparatorProps'
import { getWindowSplitterState, type ReactWindowSplitterState } from './windowSplitterState'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactWindowSplitterRuntime {
  rootProps: ReactPatternProps
  separatorProps: ReactPatternProps
  key: Key | null
  controlledKey: Key | null
  state: ReactWindowSplitterState
  actions: {
    focus(): void
    step(direction: PatternValueStepDirection): void
    collapse(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useWindowSplitterPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactWindowSplitterRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'windowsplitter-')
  const runtime = createPatternRuntime({
    definition: windowSplitterDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const key = data.relations?.rootKeys?.[0] ?? null
  const controlledKey = key ? data.relations?.controlsByKey?.[key]?.[0] ?? null : null
  const state = getWindowSplitterState({ data, key, options: runtimeOptions })

  return {
    rootProps: {},
    get separatorProps() {
      return createWindowSplitterSeparatorProps({ runtime, key, min: state.min, max: state.max, options: runtimeOptions })
    },
    key,
    controlledKey,
    state,
    get actions() {
      return createWindowSplitterActions({ key, runtime })
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions, PatternValueStepDirection } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { windowSplitterDefinition } from './definition'
import { createWindowSplitterSeparatorProps } from './windowSplitterSeparatorProps'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface ReactWindowSplitterState {
  value: number
  min: number
  max: number
  position: number
}

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
      return {
        focus: () => {
          if (key) runtime.emit({ type: 'focus', key })
        },
        step: (direction: PatternValueStepDirection) => {
          if (key) runtime.emit({ type: 'valueStep', key, direction })
        },
        collapse: () => {
          if (key) runtime.emit({ type: 'collapse', key })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function getWindowSplitterState({ data, key, options }: { data: PatternData; key: Key | null; options: PatternOptions }): ReactWindowSplitterState {
  const min = Number(options.min ?? 0)
  const max = Number(options.max ?? 100)
  const value = key ? Number(data.state?.valueByKey?.[key] ?? min) : min
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100
  return { value, min, max, position }
}

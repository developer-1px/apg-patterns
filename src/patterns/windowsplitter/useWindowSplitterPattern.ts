import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions, PatternValueStepDirection } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { windowsplitterDefinition } from './definition'

export interface ReactWindowSplitterRuntime {
  rootProps: ReactPatternProps
  separatorProps: ReactPatternProps
  key: Key | null
  controlledKey: Key | null
  state: {
    value: number
    min: number
    max: number
    position: number
  }
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
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: windowsplitterDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => `${runtimeOptions.elementIdPrefix ?? 'windowsplitter-'}${key}`,
  })
  const key = data.relations?.rootKeys?.[0] ?? null
  const controlledKey = key ? data.relations?.controlsByKey?.[key]?.[0] ?? null : null
  const min = Number(runtimeOptions.min ?? 0)
  const max = Number(runtimeOptions.max ?? 100)
  const value = key ? Number(data.state?.valueByKey?.[key] ?? min) : min
  const position = max === min ? 0 : ((value - min) / (max - min)) * 100

  return {
    rootProps: {},
    get separatorProps() {
      if (!key) return {}
      const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('separator', key) as ReactPatternProps
      return {
        ...props,
        'aria-valuemin': min,
        'aria-valuemax': max,
        'aria-orientation': runtimeOptions.orientation,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          runtime.emit({ type: 'focus', key })
          const result = runtime.resolveKeyboardBinding(reactKeyInput(event), key)
          if (!result) return
          if (result.preventDefault) event.preventDefault()
          for (const next of result.events) runtime.emit(next)
        },
        onFocus: () => runtime.emit({ type: 'focus', key }),
      }
    },
    key,
    controlledKey,
    state: { value, min, max, position },
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

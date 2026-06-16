import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent, PatternOptions, PatternValueStepDirection } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createSpinbuttonRenderItem, type ReactSpinbuttonRenderItem, type SpinbuttonData } from './spinbuttonRenderItem'
import { spinbuttonDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export type { ReactSpinbuttonRenderItem } from './spinbuttonRenderItem'

interface SpinbuttonRuntimeState {
  activeKey: Key | null
  valueByKey: Readonly<Record<Key, string | number | boolean | null>>
}

export interface ReactSpinbuttonRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSpinbuttonRenderItem[]
  state: SpinbuttonRuntimeState
  actions: {
    focus(key: Key): void
    step(key: Key, direction: PatternValueStepDirection): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSpinbuttonPattern(data: SpinbuttonData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSpinbuttonRuntime {
  const runtimeOptions = options ?? {}
  const keyToElementId = usePatternElementId(runtimeOptions, 'spinbutton-')
  const runtime = createPatternRuntime({
    definition: spinbuttonDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })

  return {
    rootProps: {},
    get renderItems() {
      return runtime.visibleKeys.map((key) => createSpinbuttonRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        valueByKey: runtime.data.state?.valueByKey ?? {},
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        step: (key: Key, direction: PatternValueStepDirection) => {
          runtime.emit({ type: 'focus', key })
          runtime.emit({ type: 'valueStep', key, direction })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

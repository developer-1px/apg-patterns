import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createSpinbuttonActions, type ReactSpinbuttonActions } from './spinbuttonActions'
import { createSpinbuttonRenderItem, type ReactSpinbuttonRenderItem, type SpinbuttonData } from './spinbuttonRenderItem'
import { getSpinbuttonRuntimeState, type SpinbuttonRuntimeState } from './spinbuttonRuntimeState'
import { spinbuttonDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export type { ReactSpinbuttonRenderItem } from './spinbuttonRenderItem'

export interface ReactSpinbuttonRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactSpinbuttonRenderItem[]
  state: SpinbuttonRuntimeState
  actions: ReactSpinbuttonActions
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useSpinbuttonPattern(data: SpinbuttonData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactSpinbuttonRuntime {
  const runtimeOptions = options ?? data.state?.options ?? {}
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
      return getSpinbuttonRuntimeState(runtime.data)
    },
    get actions() {
      return createSpinbuttonActions(runtime)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

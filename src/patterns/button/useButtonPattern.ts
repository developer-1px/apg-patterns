import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createButtonActions } from './buttonActions'
import { createButtonRootProps } from './buttonRootProps'
import { getButtonRuntimeState } from './buttonRuntimeState'
import { buttonDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactButtonRuntime {
  rootProps: ReactPatternProps
  key: Key | null
  label: string
  state: {
    activeKey: Key | null
    pressed: boolean | null
    disabled: boolean
  }
  actions: {
    focus(): void
    press(pressed: boolean): void
    activate(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useButtonPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactButtonRuntime {
  const keyToElementId = usePatternElementId(options, 'button-')
  const runtime = createPatternRuntime({
    definition: buttonDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })
  const key = data.relations?.rootKeys?.[0] ?? null

  return {
    get rootProps() {
      return createButtonRootProps(runtime, key)
    },
    key,
    label: key ? data.items[key]?.label ?? '' : '',
    get state() {
      return getButtonRuntimeState(data, key)
    },
    get actions() {
      return createButtonActions(runtime, key)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

import type { KeyboardEvent } from 'react'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { radioGroupDefinition } from './definition'
import { createRadioRenderItem, type ReactRadioRenderItem } from './radioRenderItem'
import { usePatternElementId } from '../../adapters/reactDomIds'
export type { ReactRadioRenderItem } from './radioRenderItem'

export interface ReactRadioGroupRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactRadioRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useRadioGroupPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactRadioGroupRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', ...options }
  const keyToElementId = usePatternElementId(mergedOptions, 'radio-')
  const runtime = useReactPatternRuntime({
    definition: radioGroupDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId,
  })

  return {
    get rootProps() {
      const rootProps = reactProps(runtime.getPartProps('radiogroup'))
      const onKeyDown = runtime.getRootKeyboardHandler()
      return {
        ...rootProps,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => onKeyDown(reactKeyInput(event)),
      }
    },
    get renderItems() {
      return runtime.visibleKeys.map((key) => createRadioRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

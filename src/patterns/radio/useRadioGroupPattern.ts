import type { KeyboardEvent } from 'react'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { radioGroupDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactRadioRenderItem {
  key: Key
  label: string
  state: ReactRenderItemState & { checked: boolean }
  radioProps: ReactPatternProps
}

export interface ReactRadioGroupOptions extends PatternOptions {
  activationMode?: 'automatic' | 'manual'
}

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

export function useRadioGroupPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: ReactRadioGroupOptions): ReactRadioGroupRuntime {
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', ...options }
  const activationMode = options?.activationMode === 'manual' ? 'manual' : 'automatic'
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
      const onKeyDown = createReactKeyboardHandler(runtime.getRootKeyboardHandler())
      return {
        ...rootProps,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
          const nextKey = activationMode === 'automatic' ? resolveRadioNavigationKey(event.key, runtime.visibleKeys, runtime.data.state?.activeKey) : null
          onKeyDown(event)
          if (nextKey) {
            runtime.emit({ type: 'select', keys: [nextKey], anchorKey: nextKey, extentKey: nextKey, meta: { reason: 'keyboard' } })
          }
        },
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

function resolveRadioNavigationKey(key: string, keys: readonly Key[], activeKey: Key | null | undefined): Key | null {
  if (keys.length === 0) return null
  const active = activeKey ?? keys[0]
  if (!active) return null
  const index = keys.indexOf(active)
  if (key === 'Home') return keys[0] ?? null
  if (key === 'End') return keys[keys.length - 1] ?? null
  if (index < 0) return null
  if (key === 'ArrowRight' || key === 'ArrowDown') return keys[index + 1] ?? null
  if (key === 'ArrowLeft' || key === 'ArrowUp') return keys[index - 1] ?? null
  return null
}

function createRadioRenderItem(runtime: PatternRuntime, key: Key): ReactRadioRenderItem {
  const state = runtime.getItemState(key, 'radio')
  return {
    key,
    label: runtime.data.items[key]?.label ?? key,
    state: {
      active: Boolean(state.active),
      selected: Boolean(state.checked),
      checked: Boolean(state.checked),
      disabled: Boolean(state.disabled),
    },
    radioProps: reactProps(runtime.getPartProps('radio', key)),
  }
}

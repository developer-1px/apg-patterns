import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { buttonDefinition } from './definition'

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
  const runtime = createPatternRuntime({
    definition: buttonDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'button-'}${key}`,
  })
  const key = data.relations?.rootKeys?.[0] ?? null
  const pressed = key ? data.state?.pressedByKey?.[key] : undefined

  return {
    get rootProps() {
      if (!key) return {}
      const { role: _role, onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('button', key) as ReactPatternProps & { role?: string }
      return {
        ...props,
        type: 'button',
        onKeyDown: (event) => handleButtonKeyDown(runtime, key, event),
        onFocus: () => runtime.emit({ type: 'focus', key }),
      } as ReactPatternProps
    },
    key,
    label: key ? data.items[key]?.label ?? '' : '',
    get state() {
      return {
        activeKey: data.state?.activeKey ?? null,
        pressed: pressed === undefined ? null : Boolean(pressed),
        disabled: key ? data.state?.disabledKeys?.includes(key) ?? false : false,
      }
    },
    get actions() {
      return {
        focus: () => {
          if (key) runtime.emit({ type: 'focus', key })
        },
        press: (nextPressed: boolean) => {
          if (key) runtime.emit({ type: 'press', key, pressed: nextPressed })
        },
        activate: () => {
          if (key) runtime.emit({ type: 'activate', key })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function handleButtonKeyDown(runtime: ReturnType<typeof createPatternRuntime>, key: Key, event: KeyboardEvent<HTMLElement>) {
  const result = runtime.resolveKeyboardBinding(event, key)
  if (!result) return
  if (result.preventDefault) event.preventDefault()
  for (const next of result.events) runtime.emit(next)
}

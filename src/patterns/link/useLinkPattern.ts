import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { linkDefinition } from './definition'

export interface ReactLinkRuntime {
  linkProps: ReactPatternProps
  key: Key | null
  label: string
  href: string
  variant: string
  state: {
    active: boolean
    disabled: boolean
  }
  actions: {
    activate(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useLinkPattern(data: PatternData, onEvent: (event: PatternEvent) => void = () => undefined, options?: PatternOptions): ReactLinkRuntime {
  const runtime = createPatternRuntime({
    definition: linkDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'link-'}${key}`,
  })
  const key = data.relations?.rootKeys?.[0] ?? null
  const rootKeyboard = runtime.getRootKeyboardHandler()

  return {
    get linkProps() {
      if (!key) return {}
      const { onKeyDown: _onKeyDown, ...props } = runtime.getPartProps('link', key) as ReactPatternProps
      return {
        ...props,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyboard(reactKeyInput(event)),
      }
    },
    key,
    get label() {
      return key ? data.items[key]?.label ?? key : ''
    },
    get href() {
      return key ? String((data.items[key] as { href?: unknown } | undefined)?.href ?? '#') : '#'
    },
    get variant() {
      return key ? (data.items[key] as { variant?: string } | undefined)?.variant ?? 'anchor' : 'anchor'
    },
    get state() {
      const state = key ? runtime.getItemState(key, 'link') : {}
      return {
        active: Boolean(state.active),
        disabled: Boolean(state.disabled),
      }
    },
    get actions() {
      return {
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

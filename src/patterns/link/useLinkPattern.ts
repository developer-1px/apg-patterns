import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactKeyInput, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { linkDefinition } from './definition'

interface LinkItem extends PatternItem {
  href?: unknown
  variant?: string
}

type LinkData = PatternData<LinkItem>

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

export function useLinkPattern(data: LinkData, onEvent: (event: PatternEvent) => void = () => undefined, options?: PatternOptions): ReactLinkRuntime {
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
      return key ? String(data.items[key]?.href ?? '#') : '#'
    },
    get variant() {
      return key ? data.items[key]?.variant ?? 'anchor' : 'anchor'
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

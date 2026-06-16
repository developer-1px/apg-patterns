import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { linkDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface LinkItem extends PatternItem {
  href?: unknown
  variant?: string
}

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

export function useLinkPattern(data: PatternData<LinkItem>, onEvent: (event: PatternEvent) => void = () => undefined, options?: PatternOptions): ReactLinkRuntime {
  const keyToElementId = usePatternElementId(options, 'link-')
  const runtime = createPatternRuntime({
    definition: linkDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })
  const key = data.relations?.rootKeys?.[0] ?? null

  return {
    get linkProps() {
      if (!key) return {}
      const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getPartProps('link', key))
      return {
        ...props,
        onKeyDown: createReactKeyboardHandler(runtime.getRootKeyboardHandler()),
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

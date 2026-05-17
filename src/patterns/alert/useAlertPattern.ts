import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDefinition } from './definition'

export interface ReactAlertRuntime {
  rootProps: ReactPatternProps
  dismissProps: ReactPatternProps
  key: Key | null
  message: string
  state: {
    visible: boolean
  }
  actions: {
    dismiss(): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useAlertPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAlertRuntime {
  const runtime = createPatternRuntime({
    definition: alertDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'alert-'}${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })
  const key = data.relations?.rootKeys?.[0] ?? null
  const rootKeyDown = runtime.getRootKeyboardHandler()

  return {
    get rootProps() {
      if (!key) return {}
      return {
        ...(runtime.getPartProps('alert', key) as ReactPatternProps),
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(event),
        tabIndex: -1,
      }
    },
    get dismissProps() {
      return runtime.getItemProps('dismiss', 'dismiss') as ReactPatternProps
    },
    key,
    get message() {
      return key ? String((data.items[key] as { message?: unknown } | undefined)?.message ?? '') : ''
    },
    get state() {
      return {
        visible: key ? (data.state?.expandedKeys ?? []).includes(key) : false,
      }
    },
    get actions() {
      return {
        dismiss: () => {
          if (key) runtime.emit({ type: 'dismiss', key })
        },
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

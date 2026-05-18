import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createAlertRootProps } from './alertProps'
import { alertDefinition } from './definition'

interface AlertItem extends PatternItem {
  message?: unknown
}

type AlertData = PatternData<AlertItem>

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

export function useAlertPattern(data: AlertData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAlertRuntime {
  const runtime = createPatternRuntime({
    definition: alertDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId: (key) => `${options?.elementIdPrefix ?? 'alert-'}${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })
  const key = data.relations?.rootKeys?.[0] ?? null

  return {
    get rootProps() {
      return createAlertRootProps(runtime, key)
    },
    get dismissProps() {
      return reactProps(runtime.getItemProps('dismiss', 'dismiss'))
    },
    key,
    get message() {
      return key ? String(data.items[key]?.message ?? '') : ''
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

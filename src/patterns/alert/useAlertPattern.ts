import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { alertDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

interface AlertItem extends PatternItem {
  message?: unknown
}

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

export function useAlertPattern(data: PatternData<AlertItem>, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAlertRuntime {
  const keyToElementId = usePatternElementId(options, 'alert-')
  const runtime = createPatternRuntime({
    definition: alertDefinition,
    data,
    options: options ?? {},
    onEvent,
    keyToElementId,
  })
  const key = data.relations?.rootKeys?.[0] ?? null

  return {
    get rootProps() {
      if (!key) return {}
      return {
        ...reactProps(runtime.getPartProps('alert', key)),
        onKeyDown: createReactKeyboardHandler(runtime.getRootKeyboardHandler()),
        tabIndex: -1,
      }
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

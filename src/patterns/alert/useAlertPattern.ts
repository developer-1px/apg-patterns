import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternItem, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { createAlertActions } from './alertActions'
import { createAlertRootProps } from './alertProps'
import { getAlertMessage, getAlertRuntimeState } from './alertRuntimeState'
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
      return createAlertRootProps(runtime, key)
    },
    get dismissProps() {
      return reactProps(runtime.getItemProps('dismiss', 'dismiss'))
    },
    key,
    get message() {
      return getAlertMessage(data, key)
    },
    get state() {
      return getAlertRuntimeState(data, key)
    },
    get actions() {
      return createAlertActions(runtime, key)
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

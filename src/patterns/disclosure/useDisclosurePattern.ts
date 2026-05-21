import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { disclosureDefinition } from './definition'
import { createDisclosureItems, createDisclosureTriggerProps, type ReactDisclosureItem } from './disclosureItem'
import { createDisclosureElementId, getDisclosureKeys, isDisclosureExpanded } from './disclosureRuntimeKeys'
export type { ReactDisclosureItem } from './disclosureItem'

export interface ReactDisclosureRuntime {
  triggerKey: Key | null
  panelKey: Key | null
  expanded: boolean
  triggerProps: ReactPatternProps
  panelProps: ReactPatternProps
  items: readonly ReactDisclosureItem[]
  state: {
    expandedKeys: readonly Key[]
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useDisclosurePattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactDisclosureRuntime {
  const runtimeOptions = options ?? {}
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => createDisclosureElementId(runtimeOptions.elementIdPrefix ?? 'disclosure-', key),
  })
  const { triggerKey, panelKey } = getDisclosureKeys(data)
  const expandedKeys = data.state?.expandedKeys ?? []

  return {
    triggerKey,
    panelKey,
    expanded: isDisclosureExpanded(data, triggerKey),
    get triggerProps() {
      return triggerKey ? createDisclosureTriggerProps(runtime, triggerKey) : {}
    },
    get panelProps() {
      return panelKey ? reactProps(runtime.getItemProps('panel', panelKey)) : {}
    },
    get items() {
      return createDisclosureItems({ runtime, data, expandedKeys })
    },
    state: { expandedKeys },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

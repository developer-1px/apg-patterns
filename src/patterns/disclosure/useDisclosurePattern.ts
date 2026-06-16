import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { createReactKeyboardHandler, reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { disclosureDefinition } from './definition'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactDisclosureItem {
  key: Key
  label: string
  panelKey: Key | null
  expanded: boolean
  triggerProps: ReactPatternProps
  panelProps: ReactPatternProps | null
}

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
  const keyToElementId = usePatternElementId(runtimeOptions, 'disclosure-')
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const panelKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expandedKeys = data.state?.expandedKeys ?? []

  return {
    triggerKey,
    panelKey,
    expanded: triggerKey ? expandedKeys.includes(triggerKey) : false,
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

function createDisclosureItems({
  runtime,
  data,
  expandedKeys,
}: {
  runtime: PatternRuntime
  data: PatternData
  expandedKeys: readonly Key[]
}): readonly ReactDisclosureItem[] {
  return (data.relations?.rootKeys ?? []).map((key) => {
    const panelKey = data.relations?.controlsByKey?.[key]?.[0] ?? null
    return {
      key,
      label: data.items[key]?.label ?? key,
      panelKey,
      expanded: expandedKeys.includes(key),
      triggerProps: createDisclosureTriggerProps(runtime, key),
      panelProps: panelKey ? reactProps(runtime.getItemProps('panel', panelKey)) : null,
    }
  })
}

function createDisclosureTriggerProps(runtime: PatternRuntime, key: Key): ReactPatternProps {
  const { onKeyDown: _onKeyDown, ...props } = reactProps(runtime.getItemProps('trigger', key))
  return {
    ...props,
    onKeyDown: createReactKeyboardHandler(runtime.getRootKeyboardHandler()),
  }
}

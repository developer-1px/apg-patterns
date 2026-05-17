import type { KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import { disclosureDefinition } from './definition'

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
  const runtimeOptions = options ?? (((data.state as { options?: PatternOptions } | undefined)?.options ?? {}) as PatternOptions)
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId: (key) => createDisclosureElementId(runtimeOptions.elementIdPrefix ?? 'disclosure-', key),
  })
  const triggerKey = data.relations?.rootKeys?.[0] ?? null
  const panelKey = triggerKey ? data.relations?.controlsByKey?.[triggerKey]?.[0] ?? null : null
  const expandedKeys = data.state?.expandedKeys ?? []

  return {
    triggerKey,
    panelKey,
    expanded: triggerKey ? expandedKeys.includes(triggerKey) : false,
    get triggerProps() {
      return triggerKey ? createTriggerProps(runtime, triggerKey) : {}
    },
    get panelProps() {
      return panelKey ? runtime.getItemProps('panel', panelKey) as ReactPatternProps : {}
    },
    get items() {
      return (data.relations?.rootKeys ?? []).map((key) => {
        const nextPanelKey = data.relations?.controlsByKey?.[key]?.[0] ?? null
        return {
          key,
          label: data.items[key]?.label ?? key,
          panelKey: nextPanelKey,
          expanded: expandedKeys.includes(key),
          triggerProps: createTriggerProps(runtime, key),
          panelProps: nextPanelKey ? runtime.getItemProps('panel', nextPanelKey) as ReactPatternProps : null,
        }
      })
    },
    state: { expandedKeys },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createTriggerProps(runtime: ReturnType<typeof createPatternRuntime>, key: Key): ReactPatternProps {
  const { onKeyDown: _onKeyDown, ...props } = runtime.getItemProps('trigger', key) as ReactPatternProps
  const rootKeyDown = runtime.getRootKeyboardHandler()
  return {
    ...props,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => rootKeyDown(event),
  }
}

function createDisclosureElementId(prefix: string, key: Key) {
  return `${prefix}${key.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`
}

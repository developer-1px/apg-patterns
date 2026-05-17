import { accordionDefinition } from '../patterns/accordion/definition'
import { createPatternRuntime, type PatternRuntime } from '../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../schema'
import { usePatternEffects } from './reactPatternEffects'
import type { ReactAccordionRenderItem, ReactAccordionRuntime, ReactPatternProps } from './reactTypes'

const DEFAULT_ID_PREFIX = 'accordion-'

export function useAccordionPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAccordionRuntime {
  const mergedOptions: PatternOptions = { elementIdPrefix: DEFAULT_ID_PREFIX, ...options }
  const runtime = createPatternRuntime({
    definition: accordionDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? DEFAULT_ID_PREFIX}${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })

  usePatternEffects({ definition: accordionDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get rootProps() {
      return toReactProps(runtime.getRootProps())
    },
    get renderItems() {
      return runtime.visibleKeys.map((key) => createAccordionRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        expandedKeys: runtime.data.state?.expandedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        toggle: (key: Key) => runtime.emit({ type: 'expand', key, expanded: !(runtime.data.state?.expandedKeys ?? []).includes(key) }),
        expand: (key: Key) => runtime.emit({ type: 'expand', key, expanded: true }),
        collapse: (key: Key) => runtime.emit({ type: 'expand', key, expanded: false }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createAccordionRenderItem(runtime: PatternRuntime, key: Key): ReactAccordionRenderItem {
  const panelKey = runtime.data.relations?.controlsByKey?.[key]?.[0] ?? null
  const state = runtime.getItemState(key, 'header')
  return {
    kind: 'section',
    key,
    label: getLabel(runtime.data, key),
    textValue: getTextValue(runtime.data, key),
    panelKey,
    state: {
      active: Boolean(state.active),
      expanded: Boolean(state.expanded),
      disabled: runtime.data.state?.disabledKeys?.includes(key) ?? false,
    },
    headerProps: {
      type: 'button',
      ...toReactProps(runtime.getItemProps('header', key)),
    } as ReactPatternProps,
    panelProps: panelKey ? toReactProps(runtime.getItemProps('panel', panelKey)) : null,
  }
}

function getLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

function toReactProps(props: Record<string, unknown>): ReactPatternProps {
  return props as ReactPatternProps
}

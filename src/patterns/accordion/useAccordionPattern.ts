import { accordionDefinition } from './definition'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps } from '../../adapters/reactBaseTypes'
import type { ReactAccordionRenderItem, ReactAccordionRuntime } from '../../adapters/reactTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

export function useAccordionPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactAccordionRuntime {
  const mergedOptions: PatternOptions = { ...options }
  const keyToElementId = usePatternElementId(mergedOptions, 'accordion-')
  const runtime = createPatternRuntime({
    definition: accordionDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId,
  })

  usePatternEffects({ definition: accordionDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get rootProps() {
      return reactProps(runtime.getRootProps())
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
    label: getPatternItemLabel(runtime.data, key),
    textValue: getPatternItemTextValue(runtime.data, key),
    panelKey,
    state: {
      active: Boolean(state.active),
      expanded: Boolean(state.expanded),
      disabled: runtime.data.state?.disabledKeys?.includes(key) ?? false,
    },
    headerProps: reactProps({
      type: 'button',
      ...runtime.getItemProps('header', key),
    }),
    panelProps: panelKey ? reactProps(runtime.getItemProps('panel', panelKey)) : null,
  }
}

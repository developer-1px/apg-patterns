import { accordionDefinition } from './definition'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactAccordionRuntime } from '../../adapters/reactTypes'
import { createAccordionRenderItem, toReactProps } from './accordionRenderItem'
import { usePatternElementId } from '../../adapters/reactDomIds'

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

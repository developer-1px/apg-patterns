import { useRef } from 'react'
import { createApgTypeaheadBuffer } from '../../internal/keyboard'
import { listboxDefinition } from './definition'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import type { ReactListboxRuntime } from '../../adapters/reactTypes'
import { createListboxRenderItem } from './createListboxRenderItem'
import { createListboxRootProps } from './createListboxRootProps'
import { usePatternElementId } from '../../adapters/reactDomIds'

export function useListboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactListboxRuntime {
  const typeaheadBufferRef = useRef(createApgTypeaheadBuffer())
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options }
  const keyToElementId = usePatternElementId(mergedOptions, 'option-')
  const runtime = useReactPatternRuntime({
    definition: listboxDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId,
  })

  const rootProps = createListboxRootProps(runtime, typeaheadBufferRef.current)
  return {
    get rootProps() {
      return rootProps
    },
    get renderItems() {
      return runtime.visibleKeys.map((key) => createListboxRenderItem(runtime, key))
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

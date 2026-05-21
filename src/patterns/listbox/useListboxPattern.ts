import { useRef } from 'react'
import { createApgTypeaheadBuffer } from '../../internal/keyboard'
import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { listboxDefinition } from './definition'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { ReactListboxRuntime } from '../../adapters/reactTypes'
import { createListboxRenderItem } from './createListboxRenderItem'
import { handleListboxMultiKeyDown } from './handleListboxMultiKeyDown'
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

function createListboxRootProps(runtime: PatternRuntime, typeahead: ReturnType<typeof createApgTypeaheadBuffer>): ReactPatternProps {
  const props = reactProps(runtime.getPartProps('listbox'))
  const baseKeyDown = props.onKeyDown
  return {
    ...props,
    onKeyDown: (event) => {
      if (handleListboxMultiKeyDown(runtime, event)) return
      const query = typeahead.feed(event as Parameters<typeof typeahead.feed>[0])
      const match = resolveListboxTypeaheadTarget(query, runtime)
      if (match) {
        event.preventDefault()
        runtime.emit({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
        return
      }
      baseKeyDown?.(event)
    },
  }
}

function resolveListboxTypeaheadTarget(query: string | null, runtime: PatternRuntime): Key | null {
  if (!query || runtime.options.typeaheadEnabled === false) return null
  return findApgTypeaheadMatch(
    runtime.visibleKeys.map((key) => ({
      item: key,
      label: getTextValue(runtime.data, key),
    })),
    query,
  )
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

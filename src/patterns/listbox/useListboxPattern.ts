import { useLayoutEffect, useRef } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { listboxDefinition } from './definition'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import { reducePatternData } from '../../kernel/patternReducer'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactListboxRuntime } from '../../adapters/reactTypes'
import { createListboxRenderItem } from './createListboxRenderItem'
import { createListboxRootProps } from './createListboxRootProps'

export function useListboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactListboxRuntime {
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())
  const pendingFocusKeyRef = useRef<Key | null>(null)
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options }
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: mergedOptions,
    onEvent: (event) => {
      if (shouldFocusAfterControlledUpdate(event, mergedOptions)) {
        pendingFocusKeyRef.current = resolveEventActiveKey(data, event)
      }
      onEvent(event)
    },
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? 'option-'}${key}`,
  })

  usePatternEffects({ definition: listboxDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  useLayoutEffect(() => {
    if (mergedOptions.focusStrategy !== 'rovingTabIndex') return
    const pendingFocusKey = pendingFocusKeyRef.current
    if (!pendingFocusKey || pendingFocusKey !== runtime.data.state?.activeKey) return
    pendingFocusKeyRef.current = null
    document.getElementById(runtime.keyToElementId(pendingFocusKey))?.focus({ preventScroll: true })
  }, [mergedOptions.focusStrategy, runtime.data.state?.activeKey, runtime.keyToElementId])

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

function shouldFocusAfterControlledUpdate(event: PatternEvent, options: PatternOptions) {
  if (options.focusStrategy !== 'rovingTabIndex') return false
  const reason = event.meta?.reason
  return (event.type === 'navigate' || event.type === 'focus') && (reason === 'keyboard' || reason === 'typeahead')
}

function resolveEventActiveKey(data: PatternData, event: PatternEvent): Key | null {
  if (event.type === 'focus') return event.key
  return reducePatternData(listboxDefinition, data, event).state?.activeKey ?? null
}

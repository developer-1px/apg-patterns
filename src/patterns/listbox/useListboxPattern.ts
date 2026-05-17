import { useRef } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { findTypeaheadMatch } from '@interactive-os/collection-navigation'
import { listboxDefinition } from './definition'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import type { ReactListboxRenderItem, ReactListboxRuntime, ReactPatternProps, ReactRenderItemState } from '../../adapters/reactTypes'

export function useListboxPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactListboxRuntime {
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())
  const mergedOptions: PatternOptions = { focusStrategy: 'rovingTabIndex', selectionMode: 'single', ...options }
  const runtime = createPatternRuntime({
    definition: listboxDefinition,
    data,
    options: mergedOptions,
    onEvent,
    keyToElementId: (key) => `${mergedOptions.elementIdPrefix ?? 'option-'}${key}`,
  })

  usePatternEffects({ definition: listboxDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  const rootProps = toListboxRootProps(runtime, typeaheadBufferRef.current)
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

function toListboxRootProps(runtime: PatternRuntime, typeahead: ReturnType<typeof createTypeaheadBuffer>): ReactPatternProps {
  const props = toReactProps(runtime.getPartProps('listbox'))
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
  return findTypeaheadMatch(
    runtime.visibleKeys.map((key) => ({
      item: key,
      label: getTextValue(runtime.data, key),
    })),
    query,
  )
}

function createListboxRenderItem(runtime: PatternRuntime, key: Key): ReactListboxRenderItem {
  const optionProps = toReactProps(runtime.getPartProps('option', key))
  return {
    kind: 'option',
    key,
    label: getLabel(runtime.data, key),
    textValue: getTextValue(runtime.data, key),
    state: getItemState(runtime, key, 'option'),
    optionProps: withListboxOptionClick(runtime, key, optionProps),
  }
}

function withListboxOptionClick(runtime: PatternRuntime, key: Key, props: ReactPatternProps): ReactPatternProps {
  const onClick = props.onClick
  return {
    ...props,
    onClick: (event) => {
      if (handleListboxMultiClick(runtime, key, event)) return
      onClick?.(event)
    },
  }
}

function handleListboxMultiClick(runtime: PatternRuntime, key: Key, event: Parameters<NonNullable<ReactPatternProps['onClick']>>[0]): boolean {
  if (runtime.options.selectionMode !== 'multiple') return false
  if (runtime.data.state?.disabledKeys?.includes(key)) return true
  event.preventDefault()
  event.stopPropagation()

  const visibleKeys = runtime.visibleKeys
  const selectedKeys = runtime.data.state?.selectedKeys ?? []
  const anchorKey = runtime.data.state?.anchorKey ?? runtime.data.state?.activeKey ?? null

  if (event.shiftKey && anchorKey) {
    const range = rangeBetween(visibleKeys, anchorKey, key)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey, extentKey: key })
    return true
  }

  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    runtime.emit({ type: 'select', keys: [...next], anchorKey: key, extentKey: key })
    return true
  }

  runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key })
  return true
}

function handleListboxMultiKeyDown(runtime: PatternRuntime, event: Parameters<NonNullable<ReactPatternProps['onKeyDown']>>[0]): boolean {
  if (runtime.options.selectionMode !== 'multiple') return false

  const visibleKeys = runtime.visibleKeys
  const selectedKeys = runtime.data.state?.selectedKeys ?? []
  const anchorKey = runtime.data.state?.anchorKey ?? runtime.data.state?.activeKey ?? null

  if ((event.ctrlKey || event.metaKey) && (event.key === 'a' || event.key === 'A')) {
    event.preventDefault()
    const allSelected = visibleKeys.length > 0 && visibleKeys.every((key) => selectedKeys.includes(key))
    runtime.emit({
      type: 'select',
      keys: allSelected ? [] : [...visibleKeys],
      anchorKey: visibleKeys[0] ?? null,
      extentKey: visibleKeys[visibleKeys.length - 1] ?? null,
    })
    return true
  }

  if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const nextKey = stepKey(visibleKeys, active, event.key === 'ArrowDown' ? 1 : -1)
    if (!nextKey) return true
    const anchor = anchorKey ?? active
    const range = rangeBetween(visibleKeys, anchor, nextKey)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey: anchor, extentKey: nextKey })
    return true
  }

  if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const target = visibleKeys[event.key === 'Home' ? 0 : visibleKeys.length - 1]
    if (!target) return true
    const range = rangeBetween(visibleKeys, active, target)
    if (range) runtime.emit({ type: 'select', keys: range, anchorKey: active, extentKey: target })
    return true
  }

  return false
}

function stepKey(keys: readonly Key[], active: Key, step: 1 | -1): Key | null {
  const nextIndex = keys.indexOf(active) + step
  return nextIndex < 0 || nextIndex >= keys.length ? null : keys[nextIndex]!
}

function rangeBetween(keys: readonly Key[], from: Key, to: Key): Key[] | null {
  const start = keys.indexOf(from)
  const end = keys.indexOf(to)
  if (start === -1 || end === -1) return null
  const [lo, hi] = start < end ? [start, end] : [end, start]
  return keys.slice(lo, hi + 1)
}

function getLabel(data: PatternData, key: Key): string {
  return data.items[key]?.label ?? key
}

function getTextValue(data: PatternData, key: Key): string {
  return data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key
}

function getItemState(runtime: PatternRuntime, key: Key, part: string): ReactRenderItemState {
  const state = runtime.getItemState(key, part)
  return {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
}

function toReactProps(props: Record<string, unknown>): ReactPatternProps {
  return props as ReactPatternProps
}

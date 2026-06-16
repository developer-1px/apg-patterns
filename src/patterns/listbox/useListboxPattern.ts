import { useRef } from 'react'
import { createApgTypeaheadBuffer, type ApgTypeaheadBuffer } from '../../internal/keyboard'
import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { listboxDefinition } from './definition'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

export interface ReactListboxRenderItem {
  kind: 'option'
  key: Key
  label: string
  textValue: string
  state: ReactRenderItemState
  optionProps: ReactPatternProps
}

export interface ReactListboxRuntime {
  rootProps: ReactPatternProps
  renderItems: readonly ReactListboxRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

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
        focus: (key: Key) => runtime.emit(withDefaultReason({ type: 'focus', key }, 'external')),
        select: (key: Key) => runtime.emit(withDefaultReason({ type: 'select', keys: [key], anchorKey: key, extentKey: key }, 'external')),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createListboxRenderItem(runtime: PatternRuntime, key: Key): ReactListboxRenderItem {
  const baseOptionProps = reactProps(runtime.getPartProps('option', key))
  const optionProps = runtime.options.focusStrategy === 'ariaActiveDescendant'
    ? { ...baseOptionProps, tabIndex: -1 }
    : baseOptionProps
  const onClick = optionProps.onClick
  return {
    kind: 'option',
    key,
    label: getPatternItemLabel(runtime.data, key),
    textValue: getPatternItemTextValue(runtime.data, key),
    state: getItemState(runtime, key, 'option'),
    optionProps: {
      ...optionProps,
      onClick: (event) => {
        if (handleListboxMultiClick(runtime, key, event)) return
        onClick?.(event)
      },
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
    const range = listboxRangeBetween(visibleKeys, anchorKey, key)
    if (range) runtime.emit(withDefaultReason({ type: 'select', keys: range, anchorKey, extentKey: key }, 'pointer'))
    return true
  }

  if (event.ctrlKey || event.metaKey) {
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    runtime.emit(withDefaultReason({ type: 'select', keys: [...next], anchorKey: key, extentKey: key }, 'pointer'))
    return true
  }

  runtime.emit(withDefaultReason({ type: 'select', keys: [key], anchorKey: key, extentKey: key }, 'pointer'))
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
    runtime.emit(withDefaultReason({
      type: 'select',
      keys: allSelected ? [] : [...visibleKeys],
      anchorKey: visibleKeys[0] ?? null,
      extentKey: visibleKeys[visibleKeys.length - 1] ?? null,
    }, 'keyboard'))
    return true
  }

  if (event.shiftKey && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const nextKey = listboxStepKey(visibleKeys, active, event.key === 'ArrowDown' ? 1 : -1)
    if (!nextKey) return true
    const anchor = anchorKey ?? active
    const range = listboxRangeBetween(visibleKeys, anchor, nextKey)
    if (range) runtime.emit(withDefaultReason({ type: 'select', keys: range, anchorKey: anchor, extentKey: nextKey }, 'keyboard'))
    return true
  }

  if (event.ctrlKey && event.shiftKey && (event.key === 'Home' || event.key === 'End')) {
    event.preventDefault()
    const active = runtime.data.state?.activeKey
    if (!active) return true
    const target = visibleKeys[event.key === 'Home' ? 0 : visibleKeys.length - 1]
    if (!target) return true
    const range = listboxRangeBetween(visibleKeys, active, target)
    if (range) runtime.emit(withDefaultReason({ type: 'select', keys: range, anchorKey: active, extentKey: target }, 'keyboard'))
    return true
  }

  return false
}

function listboxStepKey(keys: readonly Key[], active: Key, step: 1 | -1): Key | null {
  const nextIndex = keys.indexOf(active) + step
  return nextIndex < 0 || nextIndex >= keys.length ? null : keys[nextIndex]!
}

function listboxRangeBetween(keys: readonly Key[], from: Key, to: Key): Key[] | null {
  const start = keys.indexOf(from)
  const end = keys.indexOf(to)
  if (start === -1 || end === -1) return null
  const [lo, hi] = start < end ? [start, end] : [end, start]
  return keys.slice(lo, hi + 1)
}

function getItemState(runtime: PatternRuntime, key: Key, part: string): ReactRenderItemState {
  const state = runtime.getItemState(key, part)
  return {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
}

function createListboxRootProps(runtime: PatternRuntime, typeahead: ApgTypeaheadBuffer): ReactPatternProps {
  const props = reactProps(runtime.getPartProps('listbox'))
  const baseKeyDown = props.onKeyDown
  return {
    ...props,
    onKeyDown: (event) => {
      if (handleListboxMultiKeyDown(runtime, event)) return
      const query = typeahead.feed(event)
      const match = query && runtime.options.typeaheadEnabled !== false
        ? findApgTypeaheadMatch(
            runtime.visibleKeys.map((key) => ({
              item: key,
              label: getPatternItemTextValue(runtime.data, key),
            })),
            query,
          )
        : null
      if (match) {
        event.preventDefault()
        runtime.emit({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
        return
      }
      baseKeyDown?.(event)
    },
  }
}

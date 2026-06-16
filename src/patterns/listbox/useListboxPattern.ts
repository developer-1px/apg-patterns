import { useRef } from 'react'
import { createApgTypeaheadBuffer, type ApgTypeaheadBuffer } from '../../internal/keyboard'
import { findApgTypeaheadMatch } from '../../internal/collectionNavigation'
import type { PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { listboxDefinition } from './definition'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { useReactPatternRuntime } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import type { ReactListboxRenderItem, ReactListboxRuntime } from '../../adapters/reactTypes'
import { handleListboxMultiClick } from './handleListboxMultiClick'
import { handleListboxMultiKeyDown } from './handleListboxMultiKeyDown'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { getPatternItemLabel, getPatternItemTextValue } from '../../internal/patternItemText'

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
      label: getPatternItemTextValue(runtime.data, key),
    })),
    query,
  )
}

import { createApgTypeaheadBuffer, type ApgTypeaheadBuffer, type KeyInput } from '../../internal/keyboard'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  type Key,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
} from '../../schema'
import { treeviewDefinition } from './definition'
import { treeviewDefaultOptions } from './defaultOptions'
import { createPatternRuntime, type PatternRuntime, type SlotProps } from '../../kernel/patternRuntime'
import { createTreeviewRenderItems, type TreeviewRenderItem } from './renderItem'
import { toTreeviewRenderState, type TreeviewRenderState } from './renderState'
import { resolveTypeaheadTarget } from './typeahead'
import { createElementId } from '../../kernel/domIds'

export interface TreeviewRuntime {
  definition: typeof treeviewDefinition
  data: PatternData
  options: PatternOptions
  items: readonly TreeviewRenderItem[]
  slotProps: {
    tree: SlotProps
  }
  getTreeProps(): SlotProps
  getTreeItemProps(key: Key): SlotProps
  getTreeItemState(key: Key): TreeviewRenderState
  getIndicatorProps(key: Key): SlotProps
  keyToElementId(key: Key): string
  emit(event: PatternEvent): void
}

interface CreateTreeviewRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
  typeaheadBuffer?: ApgTypeaheadBuffer
  keyToElementId?: (key: Key) => string
}

export function createTreeviewRuntime(input: CreateTreeviewRuntimeInput): TreeviewRuntime {
  const data = PatternDataSchema.parse(input.data)
  const parsedOptions = PatternOptionsSchema.parse(input.options ?? {})
  const options = { ...treeviewDefaultOptions, ...parsedOptions }
  const emit = (event: PatternEvent) => input.onEvent(withNonEnumerableMeta(PatternEventSchema.parse(event)))
  const keyToElementId = input.keyToElementId ?? ((key: Key) => createElementId(options.elementIdPrefix ?? treeviewDefaultOptions.elementIdPrefix, key))
  const typeahead = input.typeaheadBuffer ?? createApgTypeaheadBuffer()
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data,
    options,
    keyToElementId,
    onEvent: emit,
  })

  const getTreeProps = (): SlotProps => createTreeProps({ runtime, data, options, typeahead, emit })

  const getTreeItemProps = (key: Key): SlotProps => {
    return runtime.getPartProps('treeitem', key)
  }

  const getTreeItemState = (key: Key): TreeviewRenderState => {
    return toTreeviewRenderState(runtime.getItemState(key, 'treeitem'))
  }

  const getIndicatorProps = (key: Key): SlotProps => {
    const { role: _role, id: _id, ...props } = runtime.getPartProps('indicator', key)
    return props
  }

  return {
    definition: treeviewDefinition,
    data,
    options,
    get items() {
      return createTreeviewRenderItems(data, getTreeItemProps, getIndicatorProps, getTreeItemState)
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    getTreeProps,
    getTreeItemProps,
    getTreeItemState,
    getIndicatorProps,
    keyToElementId,
    emit,
  }
}

function withNonEnumerableMeta(event: PatternEvent): PatternEvent {
  if (!event.meta) return event
  const next = { ...event } as PatternEvent
  Object.defineProperty(next, 'meta', {
    value: event.meta,
    enumerable: false,
    configurable: true,
  })
  return next
}

function createTreeProps({
  runtime,
  data,
  options,
  typeahead,
  emit,
}: {
  runtime: PatternRuntime
  data: PatternData
  options: PatternOptions
  typeahead: ApgTypeaheadBuffer
  emit: (event: PatternEvent) => void
}): SlotProps {
  const props = runtime.getPartProps('tree')
  return {
    ...props,
    onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => {
      const active = data.state?.activeKey ?? runtime.visibleKeys[0]
      if (!active) return
      const typeaheadQuery = options.typeaheadEnabled === false ? null : typeahead.feed(event)
      const typeaheadTarget = resolveTypeaheadTarget(typeaheadQuery, data, options)
      if (typeaheadTarget) {
        event.preventDefault?.()
        emit({ type: 'focus', key: typeaheadTarget as Key, meta: { reason: 'typeahead' } })
        return
      }
      runtime.getRootKeyboardHandler()(event)
    },
  }
}

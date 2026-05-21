import { createApgTypeaheadBuffer, type ApgTypeaheadBuffer } from '../../internal/keyboard'
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
import { withNonEnumerableMeta } from './eventMeta'
import { createPatternRuntime, type CreatePatternRuntimeInput, type SlotProps } from '../../kernel/patternRuntime'
import { createTreeviewRenderItems, type TreeviewRenderItem } from './renderItem'
import { createTreeProps } from './treeProps'
import { createElementId } from '../../kernel/domIds'

export type { TreeviewRenderState } from './renderState'
export type { TreeviewRenderItem } from './renderItem'

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
  getIndicatorProps(key: Key): SlotProps
  keyToElementId(key: Key): string
  emit(event: PatternEvent): void
}

export interface CreateTreeviewRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
  typeaheadBuffer?: ApgTypeaheadBuffer
  keyToElementId?: (key: Key) => string
}

export function createTreeviewRuntime(input: CreateTreeviewRuntimeInput): TreeviewRuntime {
  const data = PatternDataSchema.parse(input.data)
  const options = { ...treeviewDefaultOptions, ...PatternOptionsSchema.parse(input.options ?? {}) }
  const emit = (event: PatternEvent) => input.onEvent(withNonEnumerableMeta(PatternEventSchema.parse(event)))
  const keyToElementId = input.keyToElementId ?? ((key: Key) => createElementId(options.elementIdPrefix ?? treeviewDefaultOptions.elementIdPrefix, key))
  const typeahead = input.typeaheadBuffer ?? createApgTypeaheadBuffer()
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data,
    options,
    keyToElementId,
    onEvent: emit,
  } satisfies CreatePatternRuntimeInput)

  const getTreeProps = (): SlotProps => createTreeProps({ runtime, data, options, typeahead, emit })

  const getTreeItemProps = (key: Key): SlotProps => {
    return runtime.getPartProps('treeitem', key)
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
      return createTreeviewRenderItems(data, getTreeItemProps, getIndicatorProps)
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
    keyToElementId,
    emit,
  }
}

export { getTreeItemState } from './renderState'
export { resolveTreeviewKeyboardBinding, resolveTreeviewNavigationTarget } from './runtimeCompatibility'

// Compatibility re-export for existing import paths.
export { resolveEventTemplate, evaluatePredicate, createParentByKey } from '../../kernel/patternKernel'
export { resolveTypeaheadTarget, resolveTreeviewVisibleKeys } from './typeahead'

import { createTypeaheadBuffer, type TypeaheadBuffer } from '@interactive-os/keyboard'
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
import { createPatternRuntime, type CreatePatternRuntimeInput } from '../../kernel/patternRuntime'
import { createTreeviewRenderItems, type TreeviewRenderItem, type TreeviewSlotProps } from './renderItem'
import { createTreeProps } from './treeProps'
import { createElementId } from '../../kernel/domIds'

export type { TreeviewRenderState } from './renderState'
export type { TreeviewRenderItem, TreeviewSlotProps } from './renderItem'

export interface TreeviewRuntime {
  definition: typeof treeviewDefinition
  data: PatternData
  options: PatternOptions
  items: readonly TreeviewRenderItem[]
  slotProps: {
    tree: TreeviewSlotProps
  }
  getTreeProps(): TreeviewSlotProps
  getTreeItemProps(key: Key): TreeviewSlotProps
  getIndicatorProps(key: Key): TreeviewSlotProps
  keyToElementId(key: Key): string
  emit(event: PatternEvent): void
}

export interface CreateTreeviewRuntimeInput {
  data: unknown
  onEvent: (event: PatternEvent) => void
  options?: unknown
  typeaheadBuffer?: TypeaheadBuffer
  keyToElementId?: (key: Key) => string
}

export function createTreeviewRuntime(input: CreateTreeviewRuntimeInput): TreeviewRuntime {
  const data = PatternDataSchema.parse(input.data)
  const options = { ...treeviewDefaultOptions, ...PatternOptionsSchema.parse(input.options ?? {}) }
  const emit = (event: PatternEvent) => input.onEvent(withNonEnumerableMeta(PatternEventSchema.parse(event)))
  const keyToElementId = input.keyToElementId ?? ((key: Key) => createElementId(options.elementIdPrefix ?? treeviewDefaultOptions.elementIdPrefix, key))
  const typeahead = input.typeaheadBuffer ?? createTypeaheadBuffer()
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data,
    options,
    keyToElementId,
    onEvent: emit,
  } satisfies CreatePatternRuntimeInput)

  const getTreeProps = (): TreeviewSlotProps => createTreeProps({ runtime, data, options, typeahead, emit })

  const getTreeItemProps = (key: Key): TreeviewSlotProps => {
    return runtime.getPartProps('treeitem', key)
  }

  const getIndicatorProps = (key: Key): TreeviewSlotProps => {
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

// 호환용 re-export — 기존 import 경로 유지
export { resolveEventTemplate, evaluatePredicate, createParentByKey } from '../../kernel/patternKernel'
export { resolveTypeaheadTarget, resolveTreeviewVisibleKeys } from './typeahead'

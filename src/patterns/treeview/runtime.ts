import { createTypeaheadBuffer, type KeyInput, type TypeaheadBuffer } from '@interactive-os/keyboard'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  type Key,
  type KeyboardBinding,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
} from '../../schema'
import { treeviewDefinition } from './definition'
import {
  createParentByKey,
  resolveEventTemplate,
  resolveNavigationTarget,
} from '../../kernel/patternKernel'
import { createPatternRuntime, type CreatePatternRuntimeInput } from '../../kernel/patternRuntime'
import { resolveTreeKeyboardBinding, type ResolvedKeyboardBinding } from './keyboardBinding'
import { createTreeviewRenderItems, type TreeviewRenderItem, type TreeviewSlotProps } from './renderItem'
import { createTreeProps } from './treeProps'
import { resolveTreeviewVisibleKeys } from './typeahead'

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
}

const defaultOptions = {
  selectionMode: 'single',
  focusStrategy: 'rovingTabIndex',
  followFocus: false,
  itemClickAction: 'select',
  indicatorClickAction: 'toggleExpand',
  typeaheadEnabled: true,
  elementIdPrefix: 'treeitem-',
} satisfies PatternOptions

export function createTreeviewRuntime(input: CreateTreeviewRuntimeInput): TreeviewRuntime {
  const data = PatternDataSchema.parse(input.data)
  const options = { ...defaultOptions, ...PatternOptionsSchema.parse(input.options ?? {}) }
  const emit = (event: PatternEvent) => input.onEvent(withNonEnumerableMeta(PatternEventSchema.parse(event)))
  const keyToElementId = (key: Key) => `${options.elementIdPrefix ?? defaultOptions.elementIdPrefix}${key}`
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

export { getTreeItemState } from './renderState'

export function resolveTreeviewKeyboardBinding(
  input: KeyInput,
  activeKey: Key,
  data: PatternData,
  options: PatternOptions = defaultOptions,
  keyboard: readonly KeyboardBinding[] = treeviewDefinition.keyboard,
): ResolvedKeyboardBinding | null {
  return resolveTreeKeyboardBinding({ input, activeKey, data, options, keyboard })
}

// 호환용 re-export — 기존 import 경로 유지
export { resolveEventTemplate, evaluatePredicate, createParentByKey } from '../../kernel/patternKernel'

export function resolveTreeviewNavigationTarget(
  direction: Extract<PatternEvent, { type: 'navigate' }>,
  activeKey: Key,
  data: PatternData,
  parentByKey: ReadonlyMap<Key, Key> = createParentByKey(data),
): Key | null {
  const target = treeviewDefinition.navigation.targets[direction.direction]
  if (!target) return null
  return resolveNavigationTarget(target, {
    activeKey,
    data,
    parentByKey,
    visibleKeys: resolveTreeviewVisibleKeys(data),
  })
}
export { resolveTypeaheadTarget, resolveTreeviewVisibleKeys } from './typeahead'

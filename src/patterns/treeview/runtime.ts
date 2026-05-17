import { createTypeaheadBuffer, matchesShortcut, type KeyInput, type TypeaheadBuffer } from '@interactive-os/keyboard'
import { findTypeaheadMatch } from '@interactive-os/collection-navigation'
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
  evaluatePredicate,
  resolveEventTemplate,
  resolveNavigationTarget,
  resolveVisibleOrder,
} from '../../kernel/patternKernel'
import { createPatternRuntime, type CreatePatternRuntimeInput } from '../../kernel/patternRuntime'

export type TreeviewSlotProps = Record<string, unknown>
export type TreeviewRenderState = Record<'active' | 'selected' | 'disabled' | 'expanded', boolean> & {
  checked?: boolean | 'mixed'
}

export interface TreeviewRenderItem {
  key: Key
  state: TreeviewRenderState
  slotProps: {
    treeitem: TreeviewSlotProps
    indicator?: TreeviewSlotProps
  }
}

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
  const emit = (event: PatternEvent) => input.onEvent(PatternEventSchema.parse(event))
  const keyToElementId = (key: Key) => `${options.elementIdPrefix ?? defaultOptions.elementIdPrefix}${key}`
  const typeahead = input.typeaheadBuffer ?? createTypeaheadBuffer()
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data,
    options,
    keyToElementId,
    onEvent: emit,
  } satisfies CreatePatternRuntimeInput)

  const getTreeProps = (): TreeviewSlotProps => {
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
          emit({ type: 'focus', key: typeaheadTarget })
          return
        }
        runtime.getRootKeyboardHandler()(event)
      },
    }
  }

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
      return getVisibleKeys(data).map((key) => ({
        key,
        state: getTreeItemState(data, key),
        slotProps: { treeitem: getTreeItemProps(key), indicator: getIndicatorProps(key) },
      }))
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
    emit,
  }
}

function getVisibleKeys(data: PatternData): readonly Key[] {
  return resolveVisibleOrder(treeviewDefinition.navigation.visibleOrder, data)
}

export function getTreeItemState(data: PatternData, key: Key): TreeviewRenderState {
  const runtime = createPatternRuntime({
    definition: treeviewDefinition,
    data: PatternDataSchema.parse(data),
    options: defaultOptions,
    onEvent: () => undefined,
  })
  const state = runtime.getItemState(key, 'treeitem')
  const out: TreeviewRenderState = { active: false, selected: false, disabled: false, expanded: false }
  out.active = Boolean(state.active)
  out.selected = Boolean(state.selected)
  out.disabled = Boolean(state.disabled)
  out.expanded = Boolean(state.expanded)
  if (state.checked !== undefined) out.checked = state.checked as boolean | 'mixed'
  return out
}

export interface ResolvedKeyboardBinding {
  preventDefault: boolean
  events: readonly PatternEvent[]
}

export function resolveTreeKeyboardBinding(
  input: KeyInput,
  activeKey: Key,
  data: PatternData,
  options: PatternOptions = defaultOptions,
  keyboard: readonly KeyboardBinding[] = treeviewDefinition.keyboard,
): ResolvedKeyboardBinding | null {
  for (const binding of keyboard) {
    if (!matchesShortcut(input, binding.shortcut)) continue
    for (const item of binding.cases) {
      if (item.case === 'otherwise' || item.case === 'always' || evaluatePredicate(item.when, { data, options, activeKey })) {
        return {
          preventDefault: binding.preventDefault ?? false,
          events: item.events.flatMap((template) => resolveEventTemplate(template, activeKey, data)),
        }
      }
    }
    continue
  }

  return null
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
    visibleKeys: getVisibleKeys(data),
  })
}

export function resolveTypeaheadTarget(query: string | null, data: PatternData, options: PatternOptions = defaultOptions): Key | null {
  if (options.typeaheadEnabled === false) return null
  if (!query) return null

  return findTypeaheadMatch(
    getVisibleKeys(data).map((key) => ({
      item: key,
      label: data.state?.typeaheadTextByKey?.[key] ?? data.items[key]?.textValue ?? data.items[key]?.label ?? key,
    })),
    query,
  )
}

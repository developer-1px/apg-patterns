import { createTypeaheadBuffer, matchesShortcut, type KeyInput, type TypeaheadBuffer } from '@interactive-os/keyboard'
import { findTypeaheadMatch } from '@interactive-os/keyboard-navigation'
import {
  PatternDataSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  type EventTemplate,
  type Key,
  type KeyboardBinding,
  type PartEventBinding,
  type PatternData,
  type PatternEvent,
  type PatternOptions,
  type Predicate,
} from '../../schema'
import { treeviewPatternDefinition } from './definition'
import {
  createParentByKey,
  evaluatePredicate,
  resolveAriaSource,
  resolveEventTemplate,
  dispatchNavigationTarget,
  resolveStateProjection,
  resolveVisibleOrder,
  type PatternRuntimeContext,
} from '../../patternKernel'

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
  definition: typeof treeviewPatternDefinition
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
  const visibleKeys = getVisibleKeys(data)
  const parentByKey = createParentByKey(data)
  const typeahead = input.typeaheadBuffer ?? createTypeaheadBuffer()

  const context = (key?: Key): PatternRuntimeContext => ({
    data,
    options,
    key,
    activeKey: data.state?.activeKey ?? visibleKeys[0] ?? null,
    keyToElementId,
    parentByKey,
  })

  const getTreeProps = (): TreeviewSlotProps => {
    const part = treeviewPatternDefinition.parts.tree
    return compactProps({
      role: part.role,
      ...resolveAria(part.aria ?? [], context()),
      ...resolveFocus(part.focus, context()),
      onKeyDown: (event: KeyInput & { preventDefault?: () => void }) => {
        const active = data.state?.activeKey ?? visibleKeys[0]
        if (!active) return
        const typeaheadQuery = options.typeaheadEnabled === false ? null : typeahead.feed(event)
        const typeaheadTarget = resolveTypeaheadTarget(typeaheadQuery, data, options)
        if (typeaheadTarget) {
          event.preventDefault?.()
          emit({ type: 'focus', key: typeaheadTarget })
          return
        }
        const result = resolveTreeKeyboardBinding(event, active, data, options)
        if (!result) return
        if (result.preventDefault) event.preventDefault?.()
        for (const next of result.events) emit(next)
      },
    })
  }

  const getTreeItemProps = (key: Key): TreeviewSlotProps => {
    assertKnownKey(data, key)
    const part = treeviewPatternDefinition.parts.treeitem
    const ctx = context(key)

    return compactProps({
      role: part.role,
      id: keyToElementId(key),
      ...resolveFocus(part.focus, ctx),
      ...resolveAria(part.aria ?? [], ctx),
      ...resolvePartEvents(part.events ?? [], ctx, emit),
    })
  }

  const getIndicatorProps = (key: Key): TreeviewSlotProps => {
    assertKnownKey(data, key)
    const part = treeviewPatternDefinition.parts.indicator
    if (!part) return {}
    return compactProps(resolvePartEvents(part.events ?? [], context(key), emit))
  }

  return {
    definition: treeviewPatternDefinition,
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
  return resolveVisibleOrder(treeviewPatternDefinition.navigation.visibleOrder, data)
}

export function getTreeItemState(data: PatternData, key: Key): TreeviewRenderState {
  const projections = treeviewPatternDefinition.parts.treeitem.state ?? []
  const out: TreeviewRenderState = { active: false, selected: false, disabled: false, expanded: false }
  const ctx: PatternRuntimeContext = { data, key, activeKey: data.state?.activeKey ?? null }
  for (const projection of projections) {
    const value = resolveStateProjection(projection.from, ctx)
    if (projection.name === 'checked') {
      if (value !== undefined) out.checked = value as boolean | 'mixed'
    } else if (projection.name === 'active' || projection.name === 'selected' || projection.name === 'disabled' || projection.name === 'expanded') {
      out[projection.name] = Boolean(value)
    }
  }
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
  keyboard: readonly KeyboardBinding[] = treeviewPatternDefinition.keyboard,
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
export { resolveEventTemplate, evaluatePredicate, createParentByKey } from '../../patternKernel'

export function resolveNavigationTarget(
  direction: Extract<PatternEvent, { type: 'navigate' }>,
  activeKey: Key,
  data: PatternData,
  parentByKey: ReadonlyMap<Key, Key> = createParentByKey(data),
): Key | null {
  const target = treeviewPatternDefinition.navigation.targets[direction.direction]
  if (!target) return null
  return dispatchNavigationTarget(target, {
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

function resolveAria(projections: readonly { attribute: string; from: string; when?: Predicate }[], ctx: PatternRuntimeContext): TreeviewSlotProps {
  const out: TreeviewSlotProps = {}
  for (const projection of projections) {
    if (projection.when && !evaluatePredicate(projection.when, ctx)) continue
    const value = resolveAriaSource(projection.from, ctx)
    if (value !== undefined && value !== false) out[projection.attribute] = value
  }
  return out
}

function resolveFocus(focus: typeof treeviewPatternDefinition.parts.tree.focus | undefined, ctx: PatternRuntimeContext): TreeviewSlotProps {
  if (!focus?.tabIndex || !evaluatePredicate(focus.tabIndex.when, ctx)) return {}
  const active = ctx.key != null && ctx.activeKey === ctx.key
  const value = focus.tabIndex.value ?? (active ? focus.tabIndex.active : focus.tabIndex.inactive)
  return value === undefined ? {} : { tabIndex: value }
}

function resolvePartEvents(
  bindings: NonNullable<typeof treeviewPatternDefinition.parts.treeitem.events>,
  ctx: PatternRuntimeContext,
  emit: (event: PatternEvent) => void,
): TreeviewSlotProps {
  const byEvent = new Map<PartEventBinding['event'], Array<(typeof bindings)[number]>>()
  for (const binding of bindings) {
    const group = byEvent.get(binding.event)
    if (group) group.push(binding)
    else byEvent.set(binding.event, [binding])
  }

  const out: TreeviewSlotProps = {}
  for (const [eventName, eventBindings] of byEvent) {
    const handler = () => {
      for (const binding of eventBindings) {
        if (binding.when && !evaluatePredicate(binding.when, ctx)) continue
        const active = ctx.activeKey ?? ctx.key
        if (!active) continue
        for (const event of binding.events.flatMap((template: EventTemplate) => resolveEventTemplate(template, active, ctx.data, ctx.key))) emit(event)
      }
    }
    if (eventName === 'focus') out.onFocus = handler
    if (eventName === 'click') out.onClick = handler
  }
  return out
}

function assertKnownKey(data: PatternData, key: Key): void {
  if (!(key in data.items)) throw new Error(`Unknown treeitem key: ${key}`)
}

function compactProps(props: TreeviewSlotProps): TreeviewSlotProps {
  return Object.fromEntries(Object.entries(props).filter(([, value]) => value !== undefined))
}

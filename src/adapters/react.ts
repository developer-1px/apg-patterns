import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { findTypeaheadMatch } from '@interactive-os/collection-navigation'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from '../patterns/treeview/runtime'
import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from '../patterns/tabs/runtime'
import { listboxDefinition } from '../patterns/listbox/definition'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../schema'
import type { ElementTarget, PatternDefinition } from '../schema'
import { createPatternRuntime, type PatternRuntime } from '../kernel/patternRuntime'
import {
  createParentByKey,
  evaluatePredicate,
  resolveKeyToken,
  resolveVisibleOrder,
} from '../kernel/patternKernel'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function usePatternEffects({
  definition,
  data,
  keyToElementId,
}: {
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
}) {
  const previousMatches = useRef<boolean[]>([])

  useLayoutEffect(() => {
    const nextMatches: boolean[] = []
    for (const [index, effect] of (definition.effects ?? []).entries()) {
      const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
      const matches = evaluatePredicate(effect.when ?? { kind: 'always' }, ctx)
      nextMatches[index] = matches
      if (!shouldRunEffect({ effect, matches, previousMatches: previousMatches.current[index], data, definition, keyToElementId })) continue
      if (effect.kind === 'focus') runFocusEffect(effect, data, keyToElementId)
      if (effect.kind === 'restoreFocus') runRestoreFocusEffect(effect, data, keyToElementId)
    }
    previousMatches.current = nextMatches
  }, [data, definition, keyToElementId])
}

type EffectDefinition = NonNullable<PatternDefinition['effects']>[number]
type FocusEffect = Extract<EffectDefinition, { kind: 'focus' }>
type RestoreFocusEffect = Extract<EffectDefinition, { kind: 'restoreFocus' }>
type FocusEffectTarget = FocusEffect['target']

function runFocusEffect(effect: FocusEffect, data: PatternData, keyToElementId: (key: Key) => string) {
  const target = resolveFocusEffectTarget(effect.target, data, keyToElementId)
  target?.focus({ preventScroll: effect.preventScroll ?? Boolean(effect.on) })
}

function runRestoreFocusEffect(effect: RestoreFocusEffect, data: PatternData, keyToElementId: (key: Key) => string) {
  const target = resolveElementTarget(effect.target, data, keyToElementId)
  target?.focus({ preventScroll: effect.preventScroll })
}

function shouldRunEffect({
  effect,
  matches,
  previousMatches,
  data,
  definition,
  keyToElementId,
}: {
  effect: EffectDefinition
  matches: boolean
  previousMatches: boolean | undefined
  data: PatternData
  definition: PatternDefinition
  keyToElementId: (key: Key) => string
}): boolean {
  if (!matches) return false
  if (effect.kind === 'focus' && effect.on?.state === 'activeKey') {
    const activeKey = data.state?.activeKey
    const reason = data.state?.lastEventReason
    if (!activeKey || !reason || !effect.on.reasons.some((item) => item === reason)) return false
    return effect.scope?.kind !== 'focusWithin' || reason === 'keyboard' || reason === 'typeahead' || containsActiveElement(effect.target, data, keyToElementId, definition.rootRole)
  }
  return previousMatches !== undefined && previousMatches !== matches
}

export function handlePatternTrapFocus({
  event,
  definition,
  data,
  keyToElementId,
}: {
  event: { key: string; shiftKey?: boolean; preventDefault?: () => void }
  definition: PatternDefinition
  data: PatternData
  keyToElementId: (key: Key) => string
}) {
  if (event.key !== 'Tab') return
  const ctx = { data, activeKey: data.state?.activeKey ?? null, parentByKey: createParentByKey(data), keyToElementId }
  const trap = (definition.effects ?? []).find((effect) => effect.kind === 'trapFocus' && evaluatePredicate(effect.when, ctx))
  if (!trap || trap.kind !== 'trapFocus') return
  const root = resolveElementTarget(trap.root, data, keyToElementId)
  const items = root ? Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
  if (items.length === 0) {
    event.preventDefault?.()
    return
  }
  const first = items[0]!
  const last = items[items.length - 1]!
  const active = document.activeElement as HTMLElement | null
  if (event.shiftKey && active === first) {
    event.preventDefault?.()
    last.focus()
  } else if (!event.shiftKey && active === last) {
    event.preventDefault?.()
    first.focus()
  }
}

function resolveElementTarget(target: ElementTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  if (target.kind === 'firstFocusable') {
    return resolveElementTarget(target.root, data, keyToElementId)?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? null
  }
  const key = resolveElementTargetKey(target, data)
  return key ? document.getElementById(keyToElementId(key)) : null
}

function resolveFocusEffectTarget(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string): HTMLElement | null {
  const activeKey = data.state?.activeKey
  if (target.kind === 'activeKeyElement') return activeKey ? document.getElementById(keyToElementId(activeKey)) : null
  return resolveElementTarget(target, data, keyToElementId)
}

function containsActiveElement(target: FocusEffectTarget, data: PatternData, keyToElementId: (key: Key) => string, rootRole: string): boolean {
  const targetElement = resolveFocusEffectTarget(target, data, keyToElementId)
  const root = targetElement ? closestRole(targetElement, rootRole) : null
  return Boolean(root && document.activeElement && root.contains(document.activeElement))
}

function closestRole(element: HTMLElement, role: string): HTMLElement | null {
  let current: HTMLElement | null = element
  while (current) {
    if (current.getAttribute('role') === role) return current
    current = current.parentElement
  }
  return null
}

function resolveElementTargetKey(target: Exclude<ElementTarget, { kind: 'firstFocusable' }>, data: PatternData): Key | null {
  const activeKey = data.state?.activeKey ?? null
  if (target.kind === 'key') return resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  const ownerKey = resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  return data.relations?.controlsByKey?.[ownerKey]?.[0] ?? null
}

export type ReactTreeviewProps = HTMLAttributes<HTMLElement>

export type ReactPatternProps = HTMLAttributes<HTMLElement>

export interface ReactRenderItemState {
  active: boolean
  selected: boolean
  disabled: boolean
}

export interface ReactListboxRenderItem {
  kind: 'option'
  key: Key
  label: string
  textValue: string
  state: ReactRenderItemState
  optionProps: ReactPatternProps
}

export type ReactTreeviewRenderItem =
  | {
      kind: 'leaf'
      key: Key
      label: string
      textValue: string
      level: number
      parentKey: Key | null
      indexInParent: number
      state: ReactRenderItemState
      treeitemProps: ReactPatternProps
    }
  | {
      kind: 'branch'
      key: Key
      label: string
      textValue: string
      level: number
      parentKey: Key | null
      indexInParent: number
      state: ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
      treeitemProps: ReactPatternProps
      toggleButtonProps: ReactPatternProps
    }

export interface CreateReactPatternInput {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  options?: PatternOptions
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

export interface ReactTreeviewRuntime extends Omit<TreeviewRuntime, 'getTreeProps' | 'getTreeItemProps' | 'getIndicatorProps' | 'slotProps' | 'items'> {
  items: readonly (Omit<TreeviewRuntime['items'][number], 'slotProps'> & {
    slotProps: {
      treeitem: ReactTreeviewProps
      indicator?: ReactTreeviewProps
    }
  })[]
  slotProps: {
    tree: ReactTreeviewProps
  }
  rootProps: ReactTreeviewProps
  renderItems: readonly ReactTreeviewRenderItem[]
  state: {
    activeKey: Key | null
    selectedKeys: readonly Key[]
    disabledKeys: readonly Key[]
    expandedKeys: readonly Key[]
  }
  actions: {
    focus(key: Key): void
    select(key: Key): void
    toggle(key: Key): void
  }
  ids: {
    forKey(key: Key): string
  }
  getTreeProps(): ReactTreeviewProps
  getTreeItemProps(key: string): ReactTreeviewProps
  getIndicatorProps(key: string): ReactTreeviewProps
}

export function useTreeviewPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime
export function useTreeviewPattern(input: CreateTreeviewRuntimeInput): ReactTreeviewRuntime
export function useTreeviewPattern(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): ReactTreeviewRuntime {
  const input = normalizePatternInput(inputOrData, onEvent, options)
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())

  const runtime = createTreeviewRuntime({
    data: input.data,
    options: input.options,
    typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
    onEvent: input.onEvent,
  })
  usePatternEffects({ definition: runtime.definition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  return adaptRuntime(runtime)
}

function adaptRuntime(runtime: TreeviewRuntime): ReactTreeviewRuntime {
  const getTreeProps = () => toReactProps(runtime.getTreeProps())
  const getTreeItemProps = (key: string) => toReactProps(runtime.getTreeItemProps(key))
  const getIndicatorProps = (key: string) => toIndicatorProps(runtime.getIndicatorProps(key))

  return {
    ...runtime,
    get items() {
      return runtime.items.map((item) => ({
        ...item,
        slotProps: {
          treeitem: toReactProps(item.slotProps.treeitem),
          indicator: item.slotProps.indicator ? toIndicatorProps(item.slotProps.indicator) : undefined,
        },
      }))
    },
    get slotProps() {
      return { tree: getTreeProps() }
    },
    get rootProps() {
      return getTreeProps()
    },
    get renderItems() {
      return createTreeviewRenderItems(runtime, getTreeItemProps, getIndicatorProps)
    },
    get state() {
      return {
        activeKey: runtime.data.state?.activeKey ?? null,
        selectedKeys: runtime.data.state?.selectedKeys ?? [],
        disabledKeys: runtime.data.state?.disabledKeys ?? [],
        expandedKeys: runtime.data.state?.expandedKeys ?? [],
      }
    },
    get actions() {
      return {
        focus: (key: Key) => runtime.emit({ type: 'focus', key }),
        select: (key: Key) => runtime.emit({ type: 'select', keys: [key], anchorKey: key, extentKey: key }),
        toggle: (key: Key) => runtime.emit({ type: 'expand', key, expanded: !(runtime.data.state?.expandedKeys ?? []).includes(key) }),
      }
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}

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

function normalizePatternInput(inputOrData: CreateTreeviewRuntimeInput | PatternData, onEvent?: (event: PatternEvent) => void, options?: PatternOptions): CreateTreeviewRuntimeInput {
  if (onEvent) return { data: inputOrData, onEvent, options }
  return inputOrData as CreateTreeviewRuntimeInput
}

function toListboxRootProps(runtime: PatternRuntime, typeahead: ReturnType<typeof createTypeaheadBuffer>): ReactPatternProps {
  const props = toReactProps(runtime.getPartProps('listbox'))
  const baseKeyDown = props.onKeyDown
  return {
    ...props,
    onKeyDown: (event) => {
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
  return {
    kind: 'option',
    key,
    label: getLabel(runtime.data, key),
    textValue: getTextValue(runtime.data, key),
    state: getItemState(runtime, key, 'option'),
    optionProps: toReactProps(runtime.getPartProps('option', key)),
  }
}

function createTreeviewRenderItems(
  runtime: TreeviewRuntime,
  getTreeItemProps: (key: Key) => ReactTreeviewProps,
  getIndicatorProps: (key: Key) => ReactTreeviewProps,
): readonly ReactTreeviewRenderItem[] {
  const parentByKey = createParentByKey(runtime.data)
  const visibleKeys = resolveVisibleOrder(runtime.definition.navigation.visibleOrder, runtime.data)
  return visibleKeys.map((key) => {
    const hasChildren = (runtime.data.relations?.childrenByKey?.[key]?.length ?? 0) > 0
    const base = {
      key,
      label: getLabel(runtime.data, key),
      textValue: getTextValue(runtime.data, key),
      level: runtime.data.state?.levelByKey?.[key] ?? 1,
      parentKey: parentByKey.get(key) ?? null,
      indexInParent: getIndexInParent(runtime.data, key),
      treeitemProps: getTreeItemProps(key),
    }
    if (!hasChildren) {
      return {
        kind: 'leaf',
        ...base,
        state: getTreeItemRenderState(runtime, key, false),
      }
    }
    return {
      kind: 'branch',
      ...base,
      state: getTreeItemRenderState(runtime, key, true),
      toggleButtonProps: getIndicatorProps(key),
    }
  })
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

function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: false): ReactRenderItemState
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: true): ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }
function getTreeItemRenderState(runtime: TreeviewRuntime, key: Key, branch: boolean): ReactRenderItemState | (ReactRenderItemState & { expanded: boolean; toggleDisabled: boolean }) {
  const state = runtime.items.find((item) => item.key === key)?.state ?? { active: false, selected: false, disabled: false, expanded: false }
  const base = {
    active: Boolean(state.active),
    selected: Boolean(state.selected),
    disabled: Boolean(state.disabled),
  }
  if (!branch) return base
  return {
    ...base,
    expanded: Boolean(state.expanded),
    toggleDisabled: Boolean(state.disabled),
  }
}

function getIndexInParent(data: PatternData, key: Key): number {
  const parentByKey = createParentByKey(data)
  const parentKey = parentByKey.get(key)
  const siblings = parentKey ? data.relations?.childrenByKey?.[parentKey] : data.relations?.rootKeys
  return (siblings?.indexOf(key) ?? 0) + 1
}

function toReactProps(props: TreeviewSlotProps): ReactTreeviewProps {
  return props as ReactTreeviewProps
}

function toIndicatorProps(props: TreeviewSlotProps): ReactTreeviewProps {
  const reactProps = toReactProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    type: 'button',
    tabIndex: -1,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  } as ReactTreeviewProps
}

export type ReactTabsProps = HTMLAttributes<HTMLElement>

export interface ReactTabsRuntime extends Omit<TabsRuntime, 'getTablistProps' | 'getTabProps' | 'getTabPanelProps'> {
  getTablistProps(): ReactTabsProps
  getTabProps(key: string): ReactTabsProps
  getTabPanelProps(key: string): ReactTabsProps
}

export function useTabsPattern(input: CreateTabsRuntimeInput): ReactTabsRuntime {
  return adaptTabsRuntime(
    createTabsRuntime({
      data: input.data,
      options: input.options,
      onEvent: input.onEvent,
    }),
  )
}

function adaptTabsRuntime(runtime: TabsRuntime): ReactTabsRuntime {
  return {
    ...runtime,
    getTablistProps: () => toReactProps(runtime.getTablistProps()),
    getTabProps: (key: string) => toReactProps(runtime.getTabProps(key)),
    getTabPanelProps: (key: string) => toReactProps(runtime.getTabPanelProps(key)),
  }
}

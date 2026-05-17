import { useLayoutEffect, useRef } from 'react'
import type { HTMLAttributes } from 'react'
import { createTypeaheadBuffer } from '@interactive-os/keyboard'
import { createTreeviewRuntime, type CreateTreeviewRuntimeInput, type TreeviewRuntime, type TreeviewSlotProps } from '../patterns/treeview/runtime'
import { createTabsRuntime, type CreateTabsRuntimeInput, type TabsRuntime } from '../patterns/tabs/runtime'
import type { Key, PatternData, PatternOptions } from '../schema'
import type { ElementTarget, PatternDefinition } from '../schema'
import type { PatternRuntime } from '../kernel/patternRuntime'
import {
  createParentByKey,
  evaluatePredicate,
  resolveKeyToken,
} from '../kernel/patternKernel'

export interface PatternAutoFocusRuntime {
  data: PatternData
  options?: PatternOptions
  keyToElementId?: (key: Key) => string
}

export interface PatternAutoFocusOptions {
  enabled?: boolean
  skipInitialFocus?: boolean
  suspend?: boolean
  preventScroll?: boolean
  keyToElementId?: (key: Key) => string
  getScopeElement?: () => HTMLElement | null
  getTargetElement?: (runtime: PatternAutoFocusRuntime, activeKey: Key) => HTMLElement | null
}

export function usePatternAutoFocus(
  runtime: PatternAutoFocusRuntime | PatternRuntime,
  {
    enabled = true,
    skipInitialFocus = false,
    suspend = false,
    preventScroll = true,
    keyToElementId = runtime.keyToElementId,
    getScopeElement,
    getTargetElement,
  }: PatternAutoFocusOptions = {},
) {
  const didMountRef = useRef(false)
  const activeKey = runtime.data.state?.activeKey ?? null
  const focusStrategy = runtime.options?.focusStrategy ?? 'rovingTabIndex'

  useLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true
      if (skipInitialFocus) return
    }
    if (!enabled || suspend || !activeKey) return
    const scope = getScopeElement?.()
    if (scope && !scope.contains(document.activeElement)) return
    const target =
      getTargetElement?.(runtime, activeKey) ??
      resolveAutoFocusTarget({ activeKey, focusStrategy, keyToElementId })
    target?.focus({ preventScroll })
  }, [activeKey, enabled, focusStrategy, getScopeElement, getTargetElement, keyToElementId, preventScroll, skipInitialFocus, suspend])
}

function resolveAutoFocusTarget({
  activeKey,
  focusStrategy,
  keyToElementId,
}: {
  activeKey: Key
  focusStrategy: PatternOptions['focusStrategy']
  keyToElementId?: (key: Key) => string
}) {
  const id = keyToElementId?.(activeKey) ?? activeKey
  if (focusStrategy === 'ariaActiveDescendant') {
    return findActiveDescendantHost(id) ?? document.getElementById(id)
  }
  return document.getElementById(id)
}

function findActiveDescendantHost(id: string) {
  for (const element of Array.from(document.querySelectorAll<HTMLElement>('[aria-activedescendant]'))) {
    if (element.getAttribute('aria-activedescendant') === id) return element
  }
  return null
}

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
      const matches = evaluatePredicate(effect.when, ctx)
      nextMatches[index] = matches
      if (!matches || previousMatches.current[index] === matches) continue
      if (effect.kind === 'focus' || effect.kind === 'restoreFocus') {
        const target = resolveElementTarget(effect.target, data, keyToElementId)
        target?.focus({ preventScroll: effect.preventScroll })
      }
    }
    previousMatches.current = nextMatches
  }, [data, definition, keyToElementId])
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

function resolveElementTargetKey(target: Exclude<ElementTarget, { kind: 'firstFocusable' }>, data: PatternData): Key | null {
  const activeKey = data.state?.activeKey ?? null
  if (target.kind === 'key') return resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  const ownerKey = resolveKeyToken(target.key, undefined, activeKey, { data, activeKey })
  return data.relations?.controlsByKey?.[ownerKey]?.[0] ?? null
}

export type ReactTreeviewProps = HTMLAttributes<HTMLElement>

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
  getTreeProps(): ReactTreeviewProps
  getTreeItemProps(key: string): ReactTreeviewProps
  getIndicatorProps(key: string): ReactTreeviewProps
}

export function useTreeviewPattern(input: CreateTreeviewRuntimeInput): ReactTreeviewRuntime {
  const typeaheadBufferRef = useRef(createTypeaheadBuffer())

  return adaptRuntime(
    createTreeviewRuntime({
      data: input.data,
      options: input.options,
      typeaheadBuffer: input.typeaheadBuffer ?? typeaheadBufferRef.current,
      onEvent: input.onEvent,
    }),
  )
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
    getTreeProps,
    getTreeItemProps,
    getIndicatorProps,
  }
}

function toReactProps(props: TreeviewSlotProps): ReactTreeviewProps {
  return props as ReactTreeviewProps
}

function toIndicatorProps(props: TreeviewSlotProps): ReactTreeviewProps {
  const reactProps = toReactProps(props)
  const onClick = reactProps.onClick
  return {
    ...reactProps,
    onClick: (event) => {
      event.stopPropagation()
      onClick?.(event)
    },
  }
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

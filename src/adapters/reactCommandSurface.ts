import {
  useMemo,
  useState,
} from 'react'
import { reducePatternData } from '../kernel/patternReducer'
import type {
  Key,
  PatternData,
  PatternDefinition,
  PatternEvent,
  PatternItem,
  PatternState,
} from '../schema'
import { PatternDataSchema } from '../schema'

type ToggleState = boolean | 'mixed'
type PatternStateAction = PatternState | ((state: PatternState) => PatternState)
type PatternStateDispatch = (action: PatternStateAction) => void

export interface CommandSurfaceItem {
  readonly key: Key
  readonly label: string
  readonly disabled?: boolean
  readonly selected?: boolean
  readonly pressed?: boolean
  readonly checked?: ToggleState
  readonly kind?: string
  readonly textValue?: string
  readonly itemValue?: string | number | boolean | null
}

export interface CommandSurfaceDataOptions {
  readonly activeKey?: Key | null
  readonly disabledKeys?: readonly Key[]
  readonly label?: string
  readonly state?: PatternState
}

export interface SelectableCommandSurfaceDataOptions
  extends CommandSurfaceDataOptions {
  readonly selectedKey?: Key | null
  readonly selectedKeys?: readonly Key[]
}

export interface MenuButtonCommandSurfaceDataOptions
  extends CommandSurfaceDataOptions {
  readonly checkedByKey?: Record<Key, ToggleState>
  readonly expanded?: boolean
  readonly menuKey?: Key
  readonly menuLabel?: string
}

export interface PatternStateReducerOptions {
  readonly defaultState?: PatternState
  readonly onStateChange?: (state: PatternState, event?: PatternEvent) => void
  readonly state?: PatternState
}

export interface PatternStateReducerResult<TData extends PatternData = PatternData> {
  readonly data: TData
  readonly dispatch: (event: PatternEvent) => void
  readonly onEvent: (event: PatternEvent) => void
  readonly reset: (state?: PatternState) => void
  readonly setState: PatternStateDispatch
  readonly state: PatternState
}

export function createToolbarPatternData(
  items: readonly CommandSurfaceItem[],
  options: SelectableCommandSurfaceDataOptions = {},
): PatternData {
  const rootKeys = commandKeys(items)
  const selectedKeys = options.selectedKeys ??
    items.filter((item) => item.selected === true || item.pressed === true)
      .map((item) => item.key)
  const disabledKeys = commandDisabledKeys(items, options.disabledKeys)

  return parsePatternData({
    items: commandItemsRecord(items),
    relations: { rootKeys },
    state: {
      activeKey: fallbackActiveKey(rootKeys, disabledKeys, options.activeKey),
      selectedKeys,
      ...(disabledKeys.length > 0 ? { disabledKeys } : {}),
      ...options.state,
    },
    ...(options.label ? { refs: { label: options.label } } : {}),
  })
}

export function createRadioGroupPatternData(
  items: readonly CommandSurfaceItem[],
  options: SelectableCommandSurfaceDataOptions = {},
): PatternData {
  const rootKeys = commandKeys(items)
  const disabledKeys = commandDisabledKeys(items, options.disabledKeys)
  const selectedKey = options.selectedKey ??
    options.selectedKeys?.[0] ??
    items.find((item) => item.selected === true || item.checked === true)?.key ??
    fallbackActiveKey(rootKeys, disabledKeys, options.activeKey)
  const activeKey = options.activeKey ?? selectedKey

  return parsePatternData({
    items: commandItemsRecord(items),
    relations: { rootKeys },
    state: {
      activeKey,
      selectedKeys: selectedKey ? [selectedKey] : [],
      ...(disabledKeys.length > 0 ? { disabledKeys } : {}),
      ...options.state,
    },
    ...(options.label ? { refs: { label: options.label } } : {}),
  })
}

export function createMenuButtonPatternData(
  trigger: CommandSurfaceItem,
  menuItems: readonly CommandSurfaceItem[],
  options: MenuButtonCommandSurfaceDataOptions = {},
): PatternData {
  const menuKey = options.menuKey ?? `${trigger.key}-menu`
  assertUniqueKeys([trigger.key, menuKey, ...menuItems.map((item) => item.key)])

  const itemKeys = menuItems.map((item) => item.key)
  const disabledKeys = commandDisabledKeys(menuItems, options.disabledKeys)
  const checkedByKey = commandCheckedByKey(menuItems, options.checkedByKey)

  return parsePatternData({
    items: {
      [trigger.key]: commandItemRecordValue(trigger),
      [menuKey]: { label: options.menuLabel ?? `${trigger.label} menu` },
      ...commandItemsRecord(menuItems),
    },
    relations: {
      rootKeys: [trigger.key],
      controlsByKey: { [trigger.key]: [menuKey] },
      ownerByKey: { [menuKey]: trigger.key },
      childrenByKey: {
        [trigger.key]: [menuKey],
        [menuKey]: itemKeys,
      },
    },
    state: {
      activeKey: fallbackActiveKey(itemKeys, disabledKeys, options.activeKey),
      expandedKeys: options.expanded ? [trigger.key] : [],
      ...(disabledKeys.length > 0 ? { disabledKeys } : {}),
      ...(Object.keys(checkedByKey).length > 0 ? { checkedByKey } : {}),
      ...options.state,
    },
  })
}

export function usePatternStateReducer<TData extends PatternData>(
  definition: PatternDefinition,
  data: TData,
  options: PatternState | PatternStateReducerOptions = {},
): PatternStateReducerResult<TData> {
  const reducerOptions = isPatternStateReducerOptions(options)
    ? options
    : { defaultState: options }
  const controlled = reducerOptions.state !== undefined
  const [uncontrolledState, setUncontrolledState] = useState<PatternState>(() => ({
    ...(data.state ?? {}),
    ...(reducerOptions.defaultState ?? {}),
  }))
  const state = controlled ? reducerOptions.state ?? {} : uncontrolledState

  const currentData = useMemo(
    () => withPatternState(data, state),
    [data, state],
  )

  const setState: PatternStateDispatch = (nextState) => {
    if (controlled) {
      const next = resolveStateAction(nextState, state)
      reducerOptions.onStateChange?.(next)
      return
    }

    setUncontrolledState((currentState) => {
      const next = resolveStateAction(nextState, currentState)
      reducerOptions.onStateChange?.(next)
      return next
    })
  }

  const dispatch = (event: PatternEvent) => {
    if (controlled) {
      const next = reducePatternData(
        definition,
        withPatternState(data, state),
        event,
      ).state ?? {}
      reducerOptions.onStateChange?.(next, event)
      return
    }

    setUncontrolledState((currentState) => {
      const next = reducePatternData(
        definition,
        withPatternState(data, currentState),
        event,
      ).state ?? {}
      reducerOptions.onStateChange?.(next, event)
      return next
    })
  }

  const reset = (nextState?: PatternState) => {
    setState({ ...(nextState ?? reducerOptions.defaultState ?? data.state ?? {}) })
  }

  return {
    data: currentData,
    dispatch,
    onEvent: dispatch,
    reset,
    setState,
    state,
  }
}

function commandKeys(items: readonly CommandSurfaceItem[]): readonly Key[] {
  const keys = items.map((item) => item.key)
  assertUniqueKeys(keys)
  return keys
}

function commandItemsRecord(
  items: readonly CommandSurfaceItem[],
): Record<Key, PatternItem> {
  return Object.fromEntries(
    items.map((item) => [item.key, commandItemRecordValue(item)]),
  )
}

function commandItemRecordValue(item: CommandSurfaceItem): PatternItem {
  return {
    label: item.label,
    ...(item.kind ? { kind: item.kind } : {}),
    ...(item.textValue ? { textValue: item.textValue } : {}),
    ...(item.itemValue !== undefined ? { itemValue: item.itemValue } : {}),
  }
}

function commandDisabledKeys(
  items: readonly CommandSurfaceItem[],
  disabledKeys: readonly Key[] = [],
): readonly Key[] {
  return uniqueKeys([
    ...disabledKeys,
    ...items.filter((item) => item.disabled === true).map((item) => item.key),
  ])
}

function commandCheckedByKey(
  items: readonly CommandSurfaceItem[],
  checkedByKey: Record<Key, ToggleState> = {},
): Record<Key, ToggleState> {
  return {
    ...checkedByKey,
    ...Object.fromEntries(
      items
        .filter((item) => item.checked !== undefined)
        .map((item) => [item.key, item.checked as ToggleState]),
    ),
  }
}

function fallbackActiveKey(
  keys: readonly Key[],
  disabledKeys: readonly Key[],
  activeKey: Key | null | undefined,
): Key | null {
  if (activeKey !== undefined) return activeKey
  const disabled = new Set(disabledKeys)
  return keys.find((key) => !disabled.has(key)) ?? keys[0] ?? null
}

function withPatternState<TData extends PatternData>(
  data: TData,
  state: PatternState,
): TData {
  return {
    ...data,
    state: {
      ...(data.state ?? {}),
      ...state,
    },
  } as TData
}

function parsePatternData(data: PatternData): PatternData {
  return PatternDataSchema.parse(data)
}

function isPatternStateReducerOptions(
  options: PatternState | PatternStateReducerOptions,
): options is PatternStateReducerOptions {
  return 'state' in options ||
    'defaultState' in options ||
    'onStateChange' in options
}

function resolveStateAction(
  nextState: PatternStateAction,
  currentState: PatternState,
): PatternState {
  return typeof nextState === 'function'
    ? nextState(currentState)
    : nextState
}

function uniqueKeys(keys: readonly Key[]): readonly Key[] {
  return [...new Set(keys)]
}

function assertUniqueKeys(keys: readonly Key[]): void {
  const seen = new Set<Key>()
  const duplicates = new Set<Key>()
  for (const key of keys) {
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }
  if (duplicates.size > 0) {
    throw new Error(
      `[apg-pattern] command surface keys must be unique: ${
        [...duplicates].join(', ')
      }`,
    )
  }
}

import { type HTMLAttributes, type KeyboardEvent, useMemo } from 'react'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import type { ReactPatternProps } from '../../adapters/reactBaseTypes'
import type { ReactListboxRenderItem, ReactListboxRuntime } from '../../adapters/reactTypes'
import { createElementId, createElementIdPrefix } from '../../kernel/domIds'
import { useListboxPattern } from '../listbox/useListboxPattern'

export type AutocompleteOwnerAutocomplete = 'none' | 'list' | 'inline' | 'both'

export interface AutocompleteListboxOptions extends PatternOptions {
  autocomplete?: AutocompleteOwnerAutocomplete
  label?: string
  labelledBy?: string | readonly string[]
  open?: boolean
  ownerKey?: Key
  popupId?: string
}

export interface AutocompleteListboxState {
  activeDescendantId?: string
  activeKey: Key | null
  open: boolean
  selectedKeys: readonly Key[]
}

export interface AutocompleteListboxActions {
  close(): void
  dismiss(): void
  focus(key: Key): void
  open(): void
  select(key: Key): void
}

export interface ReactAutocompleteListboxRuntime<TElement extends HTMLElement = HTMLElement> {
  actions: AutocompleteListboxActions
  activeDescendantId?: string
  dispatchOwnerKeyDown(event: KeyboardEvent<TElement>): boolean
  ownerProps: HTMLAttributes<TElement>
  popupId: string
  popupProps: ReactPatternProps
  renderItems: readonly ReactListboxRenderItem[]
  state: AutocompleteListboxState
}

export function useAutocompleteListbox<TElement extends HTMLElement = HTMLElement>(
  data: PatternData,
  onEvent: (event: PatternEvent) => void,
  options: AutocompleteListboxOptions = {},
): ReactAutocompleteListboxRuntime<TElement> {
  const ownerKey = options.ownerKey ?? 'autocomplete'
  const open = options.open ?? Boolean(data.state?.expandedKeys?.includes(ownerKey))
  const listbox = useListboxPattern(data, onEvent, {
    ...options,
    focusStrategy: 'ariaActiveDescendant',
    selectionMode: options.selectionMode ?? 'single',
  })
  const popupId = useAutocompletePopupId(options)
  const activeKey = listbox.state.activeKey
  const activeDescendantId = open && activeKey ? listbox.ids.forKey(activeKey) : undefined
  const dispatchOwnerKeyDown = (event: KeyboardEvent<TElement>) =>
    dispatchAutocompleteOwnerKeyDown(event, {
      activeKey,
      onEvent,
      open,
      ownerKey,
    })

  return {
    actions: createAutocompleteListboxActions({ onEvent, ownerKey, listbox }),
    activeDescendantId,
    dispatchOwnerKeyDown,
    ownerProps: createAutocompleteOwnerProps({
      activeDescendantId,
      autocomplete: options.autocomplete ?? 'list',
      label: options.label ?? data.refs?.label,
      labelledBy: options.labelledBy ?? data.refs?.labelledBy,
      onKeyDown: dispatchOwnerKeyDown,
      open,
      popupId,
    }),
    popupId,
    popupProps: createAutocompletePopupProps(listbox.rootProps, popupId),
    renderItems: listbox.renderItems,
    state: {
      activeDescendantId,
      activeKey,
      open,
      selectedKeys: listbox.state.selectedKeys,
    },
  }
}

export function dispatchAutocompleteOwnerKeyDown<TElement extends HTMLElement>(
  event: KeyboardEvent<TElement>,
  input: {
    activeKey?: Key | null
    onEvent: (event: PatternEvent) => void
    open: boolean
    ownerKey?: Key
  },
): boolean {
  if (event.nativeEvent.isComposing) return false

  const ownerKey = input.ownerKey ?? 'autocomplete'
  const activeKey = input.activeKey ?? null

  if (event.key === 'ArrowDown') {
    event.preventDefault()
    if (!input.open) input.onEvent(keyboardEvent({ type: 'expand', key: ownerKey, expanded: true }))
    input.onEvent(keyboardEvent({ type: 'navigate', direction: input.open ? 'next' : 'first' }))
    return true
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    if (!input.open) input.onEvent(keyboardEvent({ type: 'expand', key: ownerKey, expanded: true }))
    input.onEvent(keyboardEvent({ type: 'navigate', direction: input.open ? 'previous' : 'last' }))
    return true
  }

  if (event.key === 'Enter' && input.open && activeKey) {
    event.preventDefault()
    input.onEvent(keyboardEvent({ type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
    input.onEvent(keyboardEvent({ type: 'expand', key: ownerKey, expanded: false }))
    return true
  }

  if (event.key === 'Tab' && input.open) {
    if (activeKey) input.onEvent(keyboardEvent({ type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey }))
    input.onEvent(keyboardEvent({ type: 'expand', key: ownerKey, expanded: false }))
    return true
  }

  if (event.key === 'Escape' && input.open) {
    event.preventDefault()
    input.onEvent(keyboardEvent({ type: 'dismiss', key: ownerKey }))
    input.onEvent(keyboardEvent({ type: 'expand', key: ownerKey, expanded: false }))
    return true
  }

  return false
}

function createAutocompleteOwnerProps<TElement extends HTMLElement>({
  activeDescendantId,
  autocomplete,
  label,
  labelledBy,
  onKeyDown,
  open,
  popupId,
}: {
  activeDescendantId?: string
  autocomplete: AutocompleteOwnerAutocomplete
  label?: string
  labelledBy?: string | readonly string[]
  onKeyDown: (event: KeyboardEvent<TElement>) => boolean
  open: boolean
  popupId: string
}): HTMLAttributes<TElement> {
  return compactProps({
    role: 'combobox',
    'aria-autocomplete': autocomplete,
    'aria-controls': popupId,
    'aria-activedescendant': activeDescendantId,
    'aria-expanded': open,
    'aria-haspopup': 'listbox' as const,
    'aria-label': label,
    'aria-labelledby': typeof labelledBy === 'string' ? labelledBy : labelledBy?.join(' '),
    onKeyDown,
  })
}

function createAutocompletePopupProps(
  rootProps: ReactPatternProps,
  popupId: string,
): ReactPatternProps {
  const {
    'aria-activedescendant': _activeDescendant,
    onKeyDown: _onKeyDown,
    ...popupProps
  } = rootProps

  return {
    ...popupProps,
    id: popupId,
  }
}

function createAutocompleteListboxActions({
  listbox,
  onEvent,
  ownerKey,
}: {
  listbox: ReactListboxRuntime
  onEvent: (event: PatternEvent) => void
  ownerKey: Key
}): AutocompleteListboxActions {
  return {
    close: () => onEvent({ type: 'expand', key: ownerKey, expanded: false, meta: { reason: 'external' } }),
    dismiss: () => onEvent({ type: 'dismiss', key: ownerKey, meta: { reason: 'external' } }),
    focus: listbox.actions.focus,
    open: () => onEvent({ type: 'expand', key: ownerKey, expanded: true, meta: { reason: 'external' } }),
    select: listbox.actions.select,
  }
}

function useAutocompletePopupId(options: AutocompleteListboxOptions): string {
  const popupId = options.popupId
  const elementIdPrefix = options.elementIdPrefix

  return useMemo(() => {
    if (popupId) return popupId
    return createElementId(
      createElementIdPrefix(elementIdPrefix ? { elementIdPrefix } : undefined, 'autocomplete-'),
      'popup',
    )
  }, [elementIdPrefix, popupId])
}

function keyboardEvent(event: PatternEvent): PatternEvent {
  return { ...event, meta: { ...event.meta, reason: 'keyboard' } }
}

function compactProps<TProps extends Record<string, unknown>>(props: TProps): TProps {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  ) as TProps
}

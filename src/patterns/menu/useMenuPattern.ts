import { useLayoutEffect, useMemo, useRef, type KeyboardEvent, type MouseEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { reactProps, type ReactPatternProps, type ReactRenderItemState } from '../../adapters/reactBaseTypes'
import { withDefaultReason } from '../../kernel/domEventBindings'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { resolveReactFocusTarget } from '../../adapters/reactElementTargets'
import type { Key, PatternData, PatternEvent, PatternEventReason, PatternOptions } from '../../schema'
import { menuButtonDefinition } from './definition'
import { resolveMenuButtonKey } from './menuButtonKeyboard'

type MenuDismissEvent = Extract<PatternEvent, { type: 'dismiss' }>
type RestoreFocusTarget = HTMLElement | null | { current: HTMLElement | null } | (() => HTMLElement | null)
type MenuElementRef = (element: HTMLElement | null) => void
type ReactMenuProps = ReactPatternProps & { ref?: MenuElementRef }

export interface ReactMenuPatternOptions extends PatternOptions {
  open?: boolean
  initialActiveKey?: Key | null
  onClose?: (event: MenuDismissEvent) => void
  restoreFocusTo?: RestoreFocusTarget
  dismissOnInteractOutside?: boolean
}

export interface ReactMenuItem {
  key: Key
  label: string
  state: Pick<ReactRenderItemState, 'active' | 'disabled'>
  itemProps: ReactPatternProps
}

export interface ReactMenuRuntime {
  menuKey: Key | null
  open: boolean
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  menuProps: ReactMenuProps
  items: readonly ReactMenuItem[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
  close(reason?: PatternEventReason): void
}

export function useMenuPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: ReactMenuPatternOptions): ReactMenuRuntime {
  const {
    open: controlledOpen,
    initialActiveKey,
    onClose,
    restoreFocusTo,
    dismissOnInteractOutside = true,
    ...patternOptions
  } = options ?? {}
  const menuKey = data.relations?.rootKeys?.[0] ?? null
  const open = controlledOpen ?? Boolean(menuKey)
  const itemKeys = menuKey ? data.relations?.childrenByKey?.[menuKey] ?? [] : []
  const enabledItemKeys = itemKeys.filter((key) => !data.state?.disabledKeys?.includes(key))
  const focusStrategy = patternOptions.focusStrategy === 'ariaActiveDescendant' || data.state?.focusStrategy === 'ariaActiveDescendant' ? 'ariaActiveDescendant' : 'rovingTabIndex'
  const runtimeOptions = { ...patternOptions, focusStrategy } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'menu-')
  const runtimeData = useMemo(
    () => createMenuRuntimeData(data, open, enabledItemKeys, initialActiveKey),
    [data, enabledItemKeys, initialActiveKey, open],
  )
  const runtime = createPatternRuntime({
    definition: menuButtonDefinition,
    data: runtimeData,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const menuElementRef = useRef<HTMLElement | null>(null)
  const setMenuElement: MenuElementRef = (element) => {
    menuElementRef.current = element
  }
  const closeMenu = (reason: PatternEventReason, closeOptions?: { emitDismiss?: boolean; restoreFocus?: boolean }) => {
    const dismissEvent: MenuDismissEvent = { type: 'dismiss', ...(menuKey ? { key: menuKey } : {}), meta: { reason } }
    if (closeOptions?.emitDismiss !== false) onEvent(dismissEvent)
    onClose?.(dismissEvent)
    if (closeOptions?.restoreFocus === false) return
    resolveReactFocusTarget(restoreFocusTo)?.focus({ preventScroll: true })
  }

  usePatternEffects({ definition: menuButtonDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })
  useMenuActiveDescendantFocus({ data: runtime.data, focusStrategy, menuKey, open, runtime })
  useMenuOutsideDismiss({ closeMenu, enabled: dismissOnInteractOutside, menuElementRef, open })

  return {
    menuKey,
    open,
    focusStrategy,
    get menuProps() {
      return createMenuProps({ runtime, data: runtime.data, menuKey, enabledItemKeys, focusStrategy, open, setMenuElement, closeMenu, onEvent })
    },
    get items() {
      if (!open) return []
      return itemKeys.map((key) => createMenuItem({ runtime, data: runtime.data, key, closeMenu, onEvent }))
    },
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
    close(reason = 'external') {
      closeMenu(reason, { emitDismiss: true, restoreFocus: true })
    },
  }
}

function createMenuProps({
  runtime,
  data,
  menuKey,
  enabledItemKeys,
  focusStrategy,
  open,
  setMenuElement,
  closeMenu,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  menuKey: Key | null
  enabledItemKeys: readonly Key[]
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  open: boolean
  setMenuElement: MenuElementRef
  closeMenu(reason: PatternEventReason, options?: { emitDismiss?: boolean; restoreFocus?: boolean }): void
  onEvent: (event: PatternEvent) => void
}): ReactMenuProps {
  if (!open || !menuKey) return { ref: setMenuElement }
  const props = reactProps(runtime.getPartProps('menu', menuKey))
  return {
    ...props,
    ...menuLabelProps(data, props),
    ref: setMenuElement,
    tabIndex: focusStrategy === 'ariaActiveDescendant' ? 0 : -1,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeMenu('keyboard', { emitDismiss: true, restoreFocus: true })
        return
      }
      if (event.key === 'Tab') {
        closeMenu('keyboard', { emitDismiss: true, restoreFocus: false })
        return
      }
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        const activeKey = activeEnabledKey(data, enabledItemKeys)
        if (activeKey) onEvent({ type: 'activate', key: activeKey, meta: { reason: 'keyboard' } })
        closeMenu('keyboard', { emitDismiss: true, restoreFocus: true })
        return
      }
      const nextKey = resolveMenuButtonKey(event.key, enabledItemKeys, data.state?.activeKey, data)
      if (nextKey) {
        event.preventDefault()
        onEvent({ type: 'focus', key: nextKey, meta: { reason: event.key.length === 1 ? 'typeahead' : 'keyboard' } })
        return
      }
    },
  }
}

function createMenuItem({
  runtime,
  data,
  key,
  closeMenu,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  closeMenu(reason: PatternEventReason, options?: { emitDismiss?: boolean; restoreFocus?: boolean }): void
  onEvent: (event: PatternEvent) => void
}): ReactMenuItem {
  const itemProps = reactProps(runtime.getPartProps('menuitem', key))
  const state = runtime.getItemState(key, 'menuitem')
  const disabled = Boolean(state.disabled)
  return {
    key,
    label: data.items[key]?.label ?? key,
    state: {
      active: Boolean(state.active),
      disabled,
    },
    itemProps: {
      ...itemProps,
      id: runtime.keyToElementId(key),
      onFocus: () => {
        if (!disabled) onEvent(withDefaultReason({ type: 'focus', key }, 'focus'))
      },
      onClick: (event: MouseEvent<HTMLElement>) => {
        if (disabled) return
        itemProps.onClick?.(event)
        closeMenu('pointer', { emitDismiss: false, restoreFocus: true })
      },
    },
  }
}

function createMenuRuntimeData(data: PatternData, open: boolean, enabledItemKeys: readonly Key[], initialActiveKey: Key | null | undefined): PatternData {
  if (!open) return data
  const initialKey = initialActiveKey && enabledItemKeys.includes(initialActiveKey) ? initialActiveKey : enabledItemKeys[0] ?? null
  const activeKey = activeEnabledKey(data, enabledItemKeys) ?? initialKey
  if (!activeKey) return data
  const lastEventReason = data.state?.lastEventReason ?? 'open'
  if (data.state?.activeKey === activeKey && data.state?.lastEventReason === lastEventReason) return data
  return { ...data, state: { ...data.state, activeKey, lastEventReason } }
}

function activeEnabledKey(data: PatternData, enabledItemKeys: readonly Key[]): Key | null {
  const activeKey = data.state?.activeKey
  return activeKey && enabledItemKeys.includes(activeKey) ? activeKey : null
}

function menuLabelProps(data: PatternData, props: ReactPatternProps): ReactPatternProps {
  if (props['aria-label'] || props['aria-labelledby']) return {}
  if (data.refs?.label) return { 'aria-label': data.refs.label }
  const labelledBy = data.refs?.labelledBy
  if (!labelledBy) return {}
  return { 'aria-labelledby': typeof labelledBy === 'string' ? labelledBy : labelledBy.join(' ') }
}

function useMenuActiveDescendantFocus({
  data,
  focusStrategy,
  menuKey,
  open,
  runtime,
}: {
  data: PatternData
  focusStrategy: 'rovingTabIndex' | 'ariaActiveDescendant'
  menuKey: Key | null
  open: boolean
  runtime: PatternRuntime
}): void {
  useLayoutEffect(() => {
    if (focusStrategy !== 'ariaActiveDescendant' || !open || !menuKey) return
    const reason = data.state?.lastEventReason
    if (reason !== 'open' && reason !== 'keyboard' && reason !== 'typeahead') return
    document.getElementById(runtime.keyToElementId(menuKey))?.focus({ preventScroll: true })
  }, [data.state?.activeKey, data.state?.lastEventReason, focusStrategy, menuKey, open, runtime])
}

function useMenuOutsideDismiss({
  closeMenu,
  enabled,
  menuElementRef,
  open,
}: {
  closeMenu(reason: PatternEventReason, options?: { emitDismiss?: boolean; restoreFocus?: boolean }): void
  enabled: boolean
  menuElementRef: { current: HTMLElement | null }
  open: boolean
}): void {
  useLayoutEffect(() => {
    if (!open || !enabled) return
    const ownerDocument = menuElementRef.current?.ownerDocument ?? (typeof document === 'undefined' ? null : document)
    if (!ownerDocument) return
    let dismissed = false
    const dismissIfOutside = (event: Event) => {
      if (dismissed || isEventTargetInside(event.target, menuElementRef.current)) return
      dismissed = true
      closeMenu('pointer', { emitDismiss: true, restoreFocus: false })
    }
    ownerDocument.addEventListener('pointerdown', dismissIfOutside, true)
    ownerDocument.addEventListener('contextmenu', dismissIfOutside, true)
    return () => {
      ownerDocument.removeEventListener('pointerdown', dismissIfOutside, true)
      ownerDocument.removeEventListener('contextmenu', dismissIfOutside, true)
    }
  }, [closeMenu, enabled, menuElementRef, open])
}

function isEventTargetInside(target: EventTarget | null, element: HTMLElement | null): boolean {
  if (!target || !element || typeof Node === 'undefined' || !(target instanceof Node)) return false
  return element.contains(target)
}

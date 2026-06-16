import { useRef, type KeyboardEvent } from 'react'
import { createPatternRuntime, type PatternRuntime } from '../../kernel/patternRuntime'
import { withDefaultReason } from '../../kernel/domEventBindings'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'
import { getEnabledMenubarKeys, getMenubarChildEntryKey, getMenubarSiblingKey } from './menubarNavigation'
import { withMenuItemRoleProps } from './menuItemRole'
import { usePatternElementId } from '../../adapters/reactDomIds'

export interface ReactMenubarItem {
  key: Key
  label: string
  expanded: boolean
  hasChildren: boolean
  itemProps: ReactPatternProps
}

export interface ReactMenubarRuntime {
  rootProps: ReactPatternProps
  rootItems: readonly ReactMenubarItem[]
  itemsFor(parentKey: Key): readonly ReactMenubarItem[]
  submenuProps(ownerKey: Key): ReactPatternProps
  expandedRootKeys: readonly Key[]
  ids: {
    forKey(key: Key): string
  }
  keyToElementId(key: Key): string
}

export function useMenubarPattern(data: PatternData, onEvent: (event: PatternEvent) => void, options?: PatternOptions): ReactMenubarRuntime {
  const runtimeOptions = { focusStrategy: 'rovingTabIndex', orientation: 'horizontal', ...(options ?? {}) } satisfies PatternOptions
  const keyToElementId = usePatternElementId(runtimeOptions, 'menubar-')
  const runtime = createPatternRuntime({
    definition: menubarDefinition,
    data,
    options: runtimeOptions,
    onEvent,
    keyToElementId,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  const typeahead = useMenubarTypeahead(data, rootKeys, onEvent)
  const expandedRootKeys = rootKeys.filter((key) => data.state?.expandedKeys?.includes(key))

  usePatternEffects({ definition: menubarDefinition, data: runtime.data, keyToElementId: runtime.keyToElementId })

  return {
    get rootProps() {
      const props = reactProps(runtime.getPartProps('menubar'))
      return {
        ...props,
        onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleMenubarKey(event, props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead),
      }
    },
    get rootItems() {
      return rootKeys.map((key) => createMenubarItem({ runtime, data, key, rootKeys, onEvent }))
    },
    itemsFor(parentKey) {
      const itemKeys = data.relations?.childrenByKey?.[parentKey] ?? []
      return itemKeys.map((key) => createMenubarItem({ runtime, data, key, rootKeys: itemKeys, onEvent }))
    },
    submenuProps(ownerKey) {
      return createMenubarSubmenuProps({ data, ownerKey, rootKeys, onEvent, keyToElementId: runtime.keyToElementId })
    },
    expandedRootKeys,
    get ids() {
      return { forKey: runtime.keyToElementId }
    },
    keyToElementId: runtime.keyToElementId,
  }
}

function createMenubarItem({
  runtime,
  data,
  key,
  rootKeys,
  onEvent,
}: {
  runtime: PatternRuntime
  data: PatternData
  key: Key
  rootKeys: readonly Key[]
  onEvent: (event: PatternEvent) => void
}): ReactMenubarItem {
  const itemProps = withMenuItemRoleProps(reactProps(runtime.getPartProps('menuitem', key)), data, key)
  const children = data.relations?.childrenByKey?.[key] ?? []
  return {
    key,
    label: data.items[key]?.label ?? key,
    expanded: data.state?.expandedKeys?.includes(key) ?? false,
    hasChildren: children.length > 0,
    itemProps: {
      ...itemProps,
      id: runtime.keyToElementId(key),
      onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
          event.preventDefault()
          event.stopPropagation()
          const target = getMenubarSiblingKey(rootKeys, key, event.key === 'ArrowRight' ? 'next' : 'previous', data)
          if (target) onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
          return
        }
        if ((event.key === 'ArrowDown' || event.key === 'ArrowUp') && children.length > 0) {
          event.preventDefault()
          event.stopPropagation()
          onEvent(withDefaultReason({ type: 'expand', key, expanded: true }, 'keyboard'))
          const target = getMenubarChildEntryKey(children, event.key === 'ArrowDown' ? 'first' : 'last', data)
          if (target) onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
          return
        }
        itemProps.onKeyDown?.(event)
      },
    },
  }
}

function createMenubarSubmenuProps({
  data,
  ownerKey,
  rootKeys,
  onEvent,
  keyToElementId,
}: {
  data: PatternData
  ownerKey: Key
  rootKeys: readonly Key[]
  onEvent: (event: PatternEvent) => void
  keyToElementId(key: Key): string
}): ReactPatternProps {
  return {
    role: 'menu',
    'aria-labelledby': keyToElementId(ownerKey),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleMenubarSubmenuKey(event, {
      data,
      ownerKey,
      rootKeys,
      onEvent,
      keyToElementId,
    }),
  }
}

function handleMenubarSubmenuKey(
  event: KeyboardEvent<HTMLElement>,
  input: {
    data: PatternData
    ownerKey: Key
    rootKeys: readonly Key[]
    onEvent: (event: PatternEvent) => void
    keyToElementId(key: Key): string
  },
) {
  const children = getEnabledMenubarKeys(input.data.relations?.childrenByKey?.[input.ownerKey] ?? [], input.data)
  const activeKey = children.includes(input.data.state?.activeKey ?? '') ? input.data.state?.activeKey : undefined
  const focusChild = (key: Key | undefined) => {
    if (key) input.onEvent({ type: 'focus', key, meta: { reason: 'keyboard' } })
  }
  const closeOwner = () => input.onEvent({ type: 'expand', key: input.ownerKey, expanded: false, meta: { reason: 'keyboard' } })
  const focusOwner = () => {
    const owner = document.getElementById(input.keyToElementId(input.ownerKey))
    if (owner && document.activeElement !== owner) {
      owner.focus({ preventScroll: true })
      return
    }
    input.onEvent({ type: 'focus', key: input.ownerKey, meta: { reason: 'keyboard' } })
  }
  const openSibling = (direction: 'next' | 'previous') => {
    if (input.rootKeys.length === 0) return
    const ownerIndex = input.rootKeys.indexOf(input.ownerKey)
    if (ownerIndex === -1) return
    const target = input.rootKeys[(ownerIndex + (direction === 'next' ? 1 : -1) + input.rootKeys.length) % input.rootKeys.length]
    const targetChildren = getEnabledMenubarKeys(input.data.relations?.childrenByKey?.[target] ?? [], input.data)
    closeOwner()
    input.onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
    if (targetChildren.length > 0) {
      input.onEvent({ type: 'expand', key: target, expanded: true, meta: { reason: 'keyboard' } })
      focusChild(targetChildren[0])
    }
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      event.stopPropagation()
      closeOwner()
      focusOwner()
      return
    case 'ArrowDown':
    case 'ArrowUp':
    case 'Home':
    case 'End': {
      event.preventDefault()
      event.stopPropagation()
      const target = event.key === 'ArrowDown'
        ? stepKey(children, activeKey, 1)
        : event.key === 'ArrowUp'
          ? stepKey(children, activeKey, -1)
          : children[event.key === 'Home' ? 0 : children.length - 1]
      focusChild(target)
      return
    }
    case 'ArrowRight':
    case 'ArrowLeft':
      event.preventDefault()
      event.stopPropagation()
      openSibling(event.key === 'ArrowRight' ? 'next' : 'previous')
  }
}

function stepKey(keys: readonly Key[], activeKey: Key | null | undefined, delta: 1 | -1) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (index === -1) return keys[delta === 1 ? 0 : keys.length - 1]
  return keys[(index + delta + keys.length) % keys.length]
}

function handleMenubarKey(event: KeyboardEvent<HTMLElement>, baseKeyDown: ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead: (char: string) => void) {
  const printable = event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && /\S/.test(event.key)
  if (printable && event.key !== ' ') {
    event.preventDefault()
    typeahead(event.key)
    return
  }
  baseKeyDown?.(event)
}

function useMenubarTypeahead(data: PatternData, rootKeys: readonly string[], onEvent: (event: PatternEvent) => void) {
  const ref = useRef<{ query: string; timer: number | null }>({ query: '', timer: null })
  return (char: string) => {
    const state = ref.current
    state.query += char.toLowerCase()
    if (state.timer !== null) window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.query = ''
      state.timer = null
    }, 500)
    const enabledRootKeys = getEnabledMenubarKeys(rootKeys, data)
    const start = data.state?.activeKey ? enabledRootKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...enabledRootKeys.slice(start + 1), ...enabledRootKeys.slice(0, start + 1)]
    const match = ordered.find((key) => (data.items[key]?.label ?? '').toLowerCase().startsWith(state.query))
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
  }
}

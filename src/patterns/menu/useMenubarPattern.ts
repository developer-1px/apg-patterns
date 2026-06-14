import { useRef, type KeyboardEvent } from 'react'
import { createPatternRuntime } from '../../kernel/patternRuntime'
import type { Key, PatternData, PatternEvent, PatternOptions } from '../../schema'
import { usePatternEffects } from '../../adapters/reactPatternEffects'
import { reactProps, type ReactPatternProps } from '../../adapters/reactBaseTypes'
import { menubarDefinition } from './definition'
import { createMenubarItem, type ReactMenubarItem } from './menubarItem'
import { usePatternElementId } from '../../adapters/reactDomIds'
import { registerKernelBuiltins } from '../../kernel/kernelBuiltins'

export type { ReactMenubarItem } from './menubarItem'

registerKernelBuiltins()

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
      return createMenubarRootProps(props, typeahead)
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
  const children = enabledMenuItemKeys(input.data, input.data.relations?.childrenByKey?.[input.ownerKey] ?? [])
  const activeKey = children.includes(input.data.state?.activeKey ?? '') ? input.data.state?.activeKey : undefined
  const focusChild = (key: Key | undefined) => {
    if (key) input.onEvent({ type: 'focus', key, meta: { reason: 'keyboard' } })
  }
  const closeOwner = () => input.onEvent({ type: 'expand', key: input.ownerKey, expanded: false, meta: { reason: 'keyboard' } })
  const focusOwner = () => {
    input.onEvent({ type: 'focus', key: input.ownerKey, meta: { reason: 'keyboard' } })
    document.getElementById(input.keyToElementId(input.ownerKey))?.focus({ preventScroll: true })
  }
  const openSibling = (direction: 'next' | 'previous') => {
    const target = siblingKey(input.rootKeys, input.ownerKey, direction)
    if (!target) return
    const targetChildren = enabledMenuItemKeys(input.data, input.data.relations?.childrenByKey?.[target] ?? [])
    closeOwner()
    input.onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
    if (targetChildren.length > 0) {
      input.onEvent({ type: 'expand', key: target, expanded: true, meta: { reason: 'keyboard' } })
      focusChild(targetChildren[0])
    }
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    event.stopPropagation()
    closeOwner()
    focusOwner()
    return
  }
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    event.stopPropagation()
    focusChild(stepKey(children, activeKey, 1))
    return
  }
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    event.stopPropagation()
    focusChild(stepKey(children, activeKey, -1))
    return
  }
  if (event.key === 'Home') {
    event.preventDefault()
    event.stopPropagation()
    focusChild(children[0])
    return
  }
  if (event.key === 'End') {
    event.preventDefault()
    event.stopPropagation()
    focusChild(children[children.length - 1])
    return
  }
  if (event.key === 'ArrowRight') {
    event.preventDefault()
    event.stopPropagation()
    openSibling('next')
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    event.stopPropagation()
    openSibling('previous')
  }
}

function enabledMenuItemKeys(data: PatternData, keys: readonly Key[]): readonly Key[] {
  const disabled = new Set(data.state?.disabledKeys ?? [])
  return keys.filter((key) => !disabled.has(key))
}

function stepKey(keys: readonly Key[], activeKey: Key | null | undefined, delta: 1 | -1) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (index === -1) return keys[delta === 1 ? 0 : keys.length - 1]
  return keys[(index + delta + keys.length) % keys.length]
}

function siblingKey(keys: readonly Key[], key: Key, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}

function createMenubarRootProps(props: ReactPatternProps, typeahead: (char: string) => void): ReactPatternProps {
  return {
    ...props,
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => handleMenubarKey(event, props.onKeyDown as ((event: KeyboardEvent<HTMLElement>) => void) | undefined, typeahead),
  }
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
    const start = data.state?.activeKey ? rootKeys.indexOf(data.state.activeKey) : -1
    const ordered = [...rootKeys.slice(start + 1), ...rootKeys.slice(0, start + 1)]
    const match = ordered.find((key) => (data.items[key]?.label ?? '').toLowerCase().startsWith(state.query))
    if (match) onEvent({ type: 'focus', key: match, meta: { reason: 'typeahead' } })
  }
}

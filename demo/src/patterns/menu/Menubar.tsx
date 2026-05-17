import type { HTMLAttributes } from 'react'
import { useMenubarPattern, type PatternData, type PatternEvent } from '../../../../src'
import { Icon } from '../../shared/Icon'
import type { MenuProps } from './menuTypes'

type Props = HTMLAttributes<HTMLElement>

export function Menubar({ data, onEvent }: MenuProps) {
  const menubar = useMenubarPattern(data, onEvent)
  const rootKeys = data.relations?.rootKeys ?? []

  return (
    <div className="relative grid gap-2">
      <div {...menubar.rootProps} className="flex items-center gap-0.5 rounded-[6px] bg-zinc-100/70 p-1 outline-none shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:shadow-black/10">
        {menubar.rootItems.map((item) => (
          <RootMenuItem key={item.key} item={item} />
        ))}
      </div>
      {menubar.expandedRootKeys.map((rootKey) => (
        <Submenu key={rootKey} data={data} ownerKey={rootKey} rootKeys={rootKeys} onEvent={onEvent} />
      ))}
    </div>
  )
}

function RootMenuItem({ item }: { item: ReturnType<typeof useMenubarPattern>['rootItems'][number] }) {
  return (
    <button
      type="button"
      {...item.itemProps}
      className="h-8 rounded-[4px] px-2.5 text-sm font-medium text-zinc-800 outline-none transition hover:bg-white/70 aria-disabled:text-zinc-400 aria-expanded:bg-white aria-expanded:text-zinc-950 aria-expanded:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:aria-disabled:text-zinc-600 dark:aria-expanded:bg-zinc-100 dark:aria-expanded:text-zinc-950 dark:focus-visible:outline-zinc-500"
    >
      {item.label}
      {item.hasChildren ? <Icon name="chevron-right" className={`ml-1 text-xs text-zinc-500 ${item.expanded ? 'rotate-90' : ''}`} /> : null}
    </button>
  )
}

function Submenu({ data, ownerKey, rootKeys, onEvent }: { data: PatternData; ownerKey: string; rootKeys: readonly string[]; onEvent: (event: PatternEvent) => void }) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const radioGroup = children.filter((key) => (data.items[key] as { kind?: string } | undefined)?.kind === 'menuitemradio')
  const activeKey = children.includes(data.state?.activeKey ?? '') ? data.state?.activeKey : children[0]
  const focusOwner = () => {
    onEvent({ type: 'focus', key: ownerKey, meta: { reason: 'keyboard' } })
    document.getElementById(`menubar-${ownerKey}`)?.focus({ preventScroll: true })
  }
  const close = () => onEvent({ type: 'expand', key: ownerKey, expanded: false })
  const focusChild = (key: string | undefined) => {
    if (key) onEvent({ type: 'focus', key, meta: { reason: 'keyboard' } })
  }
  const openSibling = (direction: 'next' | 'previous') => {
    const target = siblingKey(rootKeys, ownerKey, direction)
    if (!target) return
    onEvent({ type: 'focus', key: target, meta: { reason: 'keyboard' } })
    const targetChildren = data.relations?.childrenByKey?.[target] ?? []
    if (targetChildren.length > 0) {
      onEvent({ type: 'expand', key: target, expanded: true })
      focusChild(targetChildren[0])
    }
    close()
  }
  const popupLeft = `${rootKeys.indexOf(ownerKey) * 4.25}rem`
  return (
    <ul role="menu" aria-labelledby={`menubar-${ownerKey}`} style={{ left: popupLeft }} className="absolute top-10 z-10 grid w-56 gap-0.5 rounded-[6px] bg-white/96 p-1 text-sm shadow-[0_20px_56px_rgba(24,24,27,0.15)] outline-none backdrop-blur dark:bg-zinc-950/96 dark:shadow-black/35" onKeyDown={(event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
        focusOwner()
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        focusChild(stepKey(children, activeKey, 1))
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        focusChild(stepKey(children, activeKey, -1))
        return
      }
      if (event.key === 'Home') {
        event.preventDefault()
        focusChild(children[0])
        return
      }
      if (event.key === 'End') {
        event.preventDefault()
        focusChild(children[children.length - 1])
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        openSibling('next')
        return
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        openSibling('previous')
      }
    }}>
      {children.map((key) => <SubmenuItem key={key} itemKey={key} data={data} active={key === activeKey} radioGroup={radioGroup} onEvent={onEvent} onClose={close} />)}
    </ul>
  )
}

function SubmenuItem({ itemKey, data, active, radioGroup, onEvent, onClose }: { itemKey: string; data: PatternData; active: boolean; radioGroup: readonly string[]; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
  const item = data.items[itemKey] as { label?: string; kind?: string } | undefined
  const role = item?.kind === 'menuitemcheckbox' ? 'menuitemcheckbox' : item?.kind === 'menuitemradio' ? 'menuitemradio' : 'menuitem'
  const checked = data.state?.checkedByKey?.[itemKey]
  const disabled = data.state?.disabledKeys?.includes(itemKey)
  const activate = () => {
    if (disabled) return
    if (item?.kind === 'menuitemcheckbox') return onEvent({ type: 'check', key: itemKey, checked: !checked })
    if (item?.kind === 'menuitemradio') return radioGroup.forEach((key) => onEvent({ type: 'check', key, checked: key === itemKey }))
    onEvent({ type: 'activate', key: itemKey })
    onClose()
  }
  return (
    <li id={`menubar-${itemKey}`} role={role} tabIndex={active ? 0 : -1} data-active={active ? '' : undefined} aria-disabled={disabled || undefined} aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(checked) : undefined} onFocus={() => onEvent({ type: 'focus', key: itemKey })} onClick={activate} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate()
      }
    }} className="cursor-default rounded-[4px] px-2.5 py-1.5 text-zinc-800 outline-none transition hover:bg-zinc-100/80 aria-disabled:text-zinc-400 data-[active]:bg-zinc-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:hover:bg-white/[0.06] dark:aria-disabled:text-zinc-600 dark:data-[active]:bg-white/[0.07] dark:focus-visible:outline-zinc-500">
      <span className="mr-2 inline-grid w-4 place-items-center text-xs text-zinc-500">
        {role === 'menuitemcheckbox' ? <Icon name={checked ? 'square-check' : 'square'} /> : null}
        {role === 'menuitemradio' ? <Icon name="circle-dot" className={checked ? '' : 'opacity-0'} /> : null}
      </span>
      {item?.label ?? itemKey}
    </li>
  )
}

function stepKey(keys: readonly string[], activeKey: string | null | undefined, delta: 1 | -1) {
  if (keys.length === 0) return undefined
  const index = activeKey ? keys.indexOf(activeKey) : -1
  if (index === -1) return keys[delta === 1 ? 0 : keys.length - 1]
  return keys[(index + delta + keys.length) % keys.length]
}

function siblingKey(keys: readonly string[], key: string, direction: 'next' | 'previous') {
  if (keys.length === 0) return undefined
  const index = keys.indexOf(key)
  if (index === -1) return undefined
  return keys[(index + (direction === 'next' ? 1 : -1) + keys.length) % keys.length]
}

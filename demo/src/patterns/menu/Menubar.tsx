import type { HTMLAttributes } from 'react'
import { useMenubarPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'
import type { MenuProps } from './menuTypes'
import { useMenubarSubmenuKeyboard } from './useMenubarSubmenuKeyboard'

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
        <Submenu key={rootKey} data={data} ids={menubar.ids} ownerKey={rootKey} rootKeys={rootKeys} onEvent={onEvent} />
      ))}
    </div>
  )
}

function RootMenuItem({ item }: { item: ReturnType<typeof useMenubarPattern>['rootItems'][number] }) {
  return (
    <button
      type="button"
      {...item.itemProps}
      className={cx(ds.option, ds.expandable, 'h-8 rounded-[4px] px-2.5 text-sm')}
    >
      {item.label}
      {item.hasChildren ? <Icon name="chevron-right" className={`ml-1 text-xs text-zinc-500 ${item.expanded ? 'rotate-90' : ''}`} /> : null}
    </button>
  )
}

function Submenu({ data, ids, ownerKey, rootKeys, onEvent }: { data: PatternData; ids: ReturnType<typeof useMenubarPattern>['ids']; ownerKey: string; rootKeys: readonly string[]; onEvent: (event: PatternEvent) => void }) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const radioGroup = children.filter((key) => (data.items[key] as { kind?: string } | undefined)?.kind === 'menuitemradio')
  const activeKey = children.includes(data.state?.activeKey ?? '') ? data.state?.activeKey : children[0]
  const close = () => onEvent({ type: 'expand', key: ownerKey, expanded: false })
  const onSubmenuKeyDown = useMenubarSubmenuKeyboard({ data, ownerKey, rootKeys, children, activeKey, onEvent, close })
  const popupLeft = `${rootKeys.indexOf(ownerKey) * 4.25}rem`
  return (
    <ul role="menu" aria-labelledby={ids.forKey(ownerKey)} style={{ left: popupLeft }} className="absolute top-10 z-10 grid w-56 gap-0.5 rounded-[6px] bg-white/96 p-1 text-sm shadow-[0_20px_56px_rgba(24,24,27,0.15)] outline-none backdrop-blur dark:bg-zinc-950/96 dark:shadow-black/35" onKeyDown={onSubmenuKeyDown}>
      {children.map((key) => <SubmenuItem key={key} ids={ids} itemKey={key} data={data} active={key === activeKey} radioGroup={radioGroup} onEvent={onEvent} onClose={close} />)}
    </ul>
  )
}

function SubmenuItem({ itemKey, ids, data, active, radioGroup, onEvent, onClose }: { itemKey: string; ids: ReturnType<typeof useMenubarPattern>['ids']; data: PatternData; active: boolean; radioGroup: readonly string[]; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
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
    <li id={ids.forKey(itemKey)} role={role} tabIndex={active ? 0 : -1} data-active={active ? '' : undefined} aria-disabled={disabled || undefined} aria-checked={role === 'menuitemcheckbox' || role === 'menuitemradio' ? Boolean(checked) : undefined} onFocus={() => onEvent({ type: 'focus', key: itemKey })} onClick={activate} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate()
      }
    }} className={cx(ds.listOption, ds.checkable, 'cursor-default rounded-[4px]')}>
      <span className="mr-2 inline-grid w-4 place-items-center text-xs text-zinc-500">
        {role === 'menuitemcheckbox' ? <Icon name={checked ? 'square-check' : 'square'} /> : null}
        {role === 'menuitemradio' ? <Icon name="circle-dot" className={checked ? '' : 'opacity-0'} /> : null}
      </span>
      {item?.label ?? itemKey}
    </li>
  )
}

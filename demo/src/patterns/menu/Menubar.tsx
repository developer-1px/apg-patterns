import { useMenubarPattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'
import type { MenuProps } from './menuTypes'
import { useMenubarSubmenuKeyboard } from './useMenubarSubmenuKeyboard'

export function Menubar({ data, onEvent }: MenuProps) {
  const menubar = useMenubarPattern(data, onEvent)
  const rootKeys = data.relations?.rootKeys ?? []

  return (
    <div className="relative grid gap-2">
      <div {...menubar.rootProps} className="flex items-center gap-0.5 rounded-md border border-zinc-200 p-1 outline-none dark:border-white/10">
        {menubar.rootItems.map((item) => (
          <RootMenuItem key={item.key} item={item} />
        ))}
      </div>
      {menubar.expandedRootKeys.map((rootKey) => (
        <Submenu key={rootKey} data={data} menubar={menubar} ownerKey={rootKey} rootKeys={rootKeys} onEvent={onEvent} />
      ))}
    </div>
  )
}

function RootMenuItem({ item }: { item: ReturnType<typeof useMenubarPattern>['rootItems'][number] }) {
  return (
    <button
      type="button"
      {...item.itemProps}
      className={cx(ds.option, ds.expandable, 'h-8 px-2.5 text-sm')}
    >
      {item.label}
      {item.hasChildren ? <Icon name="chevron-right" className={`ml-1 text-xs text-zinc-500 ${item.expanded ? 'rotate-90' : ''}`} /> : null}
    </button>
  )
}

function Submenu({ data, menubar, ownerKey, rootKeys, onEvent }: { data: PatternData; menubar: ReturnType<typeof useMenubarPattern>; ownerKey: string; rootKeys: readonly string[]; onEvent: (event: PatternEvent) => void }) {
  const children = data.relations?.childrenByKey?.[ownerKey] ?? []
  const radioGroup = children.filter((key) => (data.items[key] as { kind?: string } | undefined)?.kind === 'menuitemradio')
  const activeKey = children.includes(data.state?.activeKey ?? '') ? data.state?.activeKey : children[0]
  const close = () => onEvent({ type: 'expand', key: ownerKey, expanded: false })
  const onSubmenuKeyDown = useMenubarSubmenuKeyboard({ data, ownerKey, rootKeys, children, activeKey, onEvent, close })
  const popupLeft = `${rootKeys.indexOf(ownerKey) * 4.25}rem`
  const items = menubar.itemsFor(ownerKey)
  return (
    <ul role="menu" aria-labelledby={menubar.ids.forKey(ownerKey)} style={{ left: popupLeft }} className="absolute top-10 z-10 grid w-56 gap-0.5 rounded-md border border-zinc-200 bg-white p-1 text-sm outline-none dark:border-white/10 dark:bg-zinc-950" onKeyDown={onSubmenuKeyDown}>
      {items.map((item) => <SubmenuItem key={item.key} item={item} data={data} active={item.key === activeKey} radioGroup={radioGroup} onEvent={onEvent} onClose={close} />)}
    </ul>
  )
}

function SubmenuItem({ item, data, active, radioGroup, onEvent, onClose }: { item: ReturnType<typeof useMenubarPattern>['rootItems'][number]; data: PatternData; active: boolean; radioGroup: readonly string[]; onEvent: (event: PatternEvent) => void; onClose: () => void }) {
  const itemKey = item.key
  const role = item.itemProps.role
  const checked = data.state?.checkedByKey?.[itemKey]
  const disabled = data.state?.disabledKeys?.includes(itemKey)
  const activate = () => {
    if (disabled) return
    if (role === 'menuitemcheckbox') return onEvent({ type: 'check', key: itemKey, checked: !checked })
    if (role === 'menuitemradio') return radioGroup.forEach((key) => onEvent({ type: 'check', key, checked: key === itemKey }))
    onEvent({ type: 'activate', key: itemKey })
    onClose()
  }
  return (
    <li {...item.itemProps} tabIndex={active ? 0 : -1} data-active={active ? '' : undefined} onFocus={() => onEvent({ type: 'focus', key: itemKey })} onClick={activate} onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        activate()
      }
    }} className={cx(ds.listOption, ds.checkable, 'cursor-default')}>
      <span className="mr-2 inline-grid w-4 place-items-center text-xs text-zinc-500">
        {role === 'menuitemcheckbox' ? <Icon name={checked ? 'square-check' : 'square'} /> : null}
        {role === 'menuitemradio' ? <Icon name="circle-dot" className={checked ? '' : 'opacity-0'} /> : null}
      </span>
      {item.label}
    </li>
  )
}

import { useMenuButtonPattern } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'
import { Menubar } from './Menubar'
import type { MenuProps } from './menuTypes'

export function Menu(props: MenuProps) {
  const flavor = props.data.state?.apgPattern === 'menu-button' ? 'menu-button' : 'menubar'
  if (flavor === 'menubar') return <Menubar {...props} />
  return <MenuButton {...props} />
}

function MenuButton({ data, onEvent }: MenuProps) {
  const menuButton = useMenuButtonPattern(data, onEvent)
  if (!menuButton.triggerKey || !menuButton.menuKey) return null

  return (
    <div className="relative grid max-w-xs gap-2">
      <button
        type="button"
        {...menuButton.triggerProps}
        className={cx(ds.button, ds.expandable, 'justify-between')}
      >
        <span>{data.items[menuButton.triggerKey]?.label ?? 'Menu'}</span>
        <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 ${menuButton.expanded ? 'rotate-90' : ''}`} />
      </button>
      {menuButton.expanded ? (
        <ul
          {...menuButton.menuProps}
          className={cx('absolute top-10 z-10 grid w-56 gap-0.5 rounded-md border border-zinc-200 bg-white p-1 text-sm dark:border-white/10 dark:bg-zinc-950', ds.focusRing)}
        >
          {menuButton.items.map((item) => (
            <li
              key={item.key}
              {...item.itemProps}
              data-active={item.state.active ? '' : undefined}
              className={cx(ds.listOption, 'cursor-default')}
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

import { useMenuButtonPattern } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { Icon } from '../../shared/Icon'
import type { MenuProps } from './menuTypes'

export function MenuButton({ data, onEvent }: MenuProps) {
  const menuButton = useMenuButtonPattern(data, onEvent)
  if (!menuButton.triggerKey || !menuButton.menuKey) return null

  return (
    <div className="relative grid max-w-xs gap-2">
      <button
        type="button"
        {...menuButton.triggerProps}
        className={cx(ds.button, ds.expandable, 'justify-between rounded-[6px]')}
      >
        <span>{data.items[menuButton.triggerKey]?.label ?? 'Menu'}</span>
        <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 ${menuButton.expanded ? 'rotate-90' : ''}`} />
      </button>
      {menuButton.expanded ? (
        <ul
          {...menuButton.menuProps}
          className={cx('absolute top-10 z-10 grid w-56 gap-0.5 rounded-[6px] bg-white/96 p-1 text-sm shadow-[0_20px_56px_rgba(24,24,27,0.15)] backdrop-blur dark:bg-zinc-950/96 dark:shadow-black/35', ds.focusRing)}
        >
          {menuButton.items.map((item) => (
            <li
              key={item.key}
              {...item.itemProps}
              data-active={item.state.active ? '' : undefined}
              className={cx(ds.listOption, 'cursor-default rounded-[4px]')}
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

import { useMenuButtonPattern } from '../../../../src'
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
        className="inline-flex h-8 items-center justify-between rounded-[6px] bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500"
      >
        <span>{data.items[menuButton.triggerKey]?.label ?? 'Menu'}</span>
        <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 ${menuButton.expanded ? 'rotate-90' : ''}`} />
      </button>
      {menuButton.expanded ? (
        <ul
          {...menuButton.menuProps}
          className="absolute top-10 z-10 grid w-56 gap-0.5 rounded-[6px] bg-white/96 p-1 text-sm shadow-[0_20px_56px_rgba(24,24,27,0.15)] outline-none backdrop-blur focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-zinc-950/96 dark:shadow-black/35 dark:focus-visible:outline-zinc-500"
        >
          {menuButton.items.map((item) => (
            <li
              key={item.key}
              {...item.itemProps}
              data-active={item.state.active ? '' : undefined}
              className="cursor-default rounded-[4px] px-2.5 py-1.5 text-zinc-800 outline-none transition aria-disabled:text-zinc-400 data-active:bg-zinc-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-200 dark:aria-disabled:text-zinc-600 dark:data-active:bg-white/[0.07] dark:focus-visible:outline-zinc-500"
            >
              {item.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

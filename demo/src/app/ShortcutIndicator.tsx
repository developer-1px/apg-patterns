import { Icon, type IconName } from '../shared/Icon'

const shortcutIconByToken: Partial<Record<string, IconName>> = {
  ArrowDown: 'arrow-down',
  ArrowLeft: 'arrow-left',
  ArrowRight: 'arrow-right',
  ArrowUp: 'arrow-up',
}

export function ShortcutIndicator({ shortcut }: { shortcut: string }) {
  return (
    <>
      {shortcut.split('+').map((token, index) => {
        const icon = shortcutIconByToken[token]
        return (
          <span key={`${shortcut}-${token}-${index}`} className="inline-flex items-center gap-1">
            {index > 0 ? <Icon name="plus" className="text-[9px] text-zinc-400 dark:text-zinc-600" /> : null}
            {icon ? <Icon name={icon} className="text-xs" /> : <span>{token}</span>}
          </span>
        )
      })}
    </>
  )
}

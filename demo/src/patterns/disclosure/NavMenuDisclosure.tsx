import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useRef } from 'react'
import { useDisclosurePattern, type PatternData, type PatternEvent } from '../../../../src'
import { navMenuContent, navMenuTopLinksContent } from './disclosureData'
import { Icon } from '../../shared/Icon'
import { useNavMenuKeyboard } from './useNavMenuKeyboard'

type Props = HTMLAttributes<HTMLElement>

const buttonClass =
  'inline-flex h-8 items-center justify-between rounded-lg bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm shadow-zinc-200/60 outline-none hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:shadow-black/20 dark:hover:bg-white/[0.1] dark:focus-visible:outline-zinc-500'
const panelClass =
  'rounded-xl bg-white/96 p-2 text-sm text-zinc-700 shadow-[0_20px_56px_rgba(24,24,27,0.15)] backdrop-blur dark:bg-zinc-950/96 dark:text-zinc-300 dark:shadow-black/35'
const linkClass =
  'block rounded-lg px-2 py-1 text-sm text-zinc-700 outline-none hover:bg-zinc-100/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:text-zinc-300 dark:hover:bg-white/[0.07] dark:focus-visible:outline-zinc-500'

export function NavMenuDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  return <NavMenuBase data={data} onEvent={onEvent} mixed={false} />
}

export function NavMenuTopLinksDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  return <NavMenuBase data={data} onEvent={onEvent} mixed />
}

function NavMenuBase({
  data,
  onEvent,
  mixed,
}: {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  mixed: boolean
}) {
  const disclosure = useDisclosurePattern(data, onEvent)
  const expandedKeys = disclosure.state.expandedKeys
  const containerRef = useRef<HTMLDivElement>(null)
  const entries = mixed ? navMenuTopLinksContent : navMenuContent.map((group) => ({ kind: 'group' as const, ...group }))
  const { closeOthers, onButtonKey, onLinkKey } = useNavMenuKeyboard({ containerRef, expandedKeys, onEvent })

  return (
    <nav ref={containerRef} aria-label="Mythical University">
      <ul className="flex flex-wrap items-start gap-2">
        {entries.map((entry) => entry.kind === 'link'
          ? <TopLink key={entry.key} entry={entry} />
          : <TopGroup key={entry.key} entry={entry} expanded={expandedKeys.includes(entry.key)} trigger={disclosure.items.find((item) => item.key === entry.key)?.triggerProps ?? {}} panel={disclosure.items.find((item) => item.key === entry.key)?.panelProps ?? {}} onToggle={() => {
            closeOthers(entry.key)
            onEvent({ type: 'expand', key: entry.key, expanded: !expandedKeys.includes(entry.key) })
          }} onButtonKey={onButtonKey(entry.key)} onLinkKey={onLinkKey(entry.key)} />)}
      </ul>
    </nav>
  )
}

function TopLink({ entry }: { entry: { key: string; label: string; href: string } }) {
  return (
    <li>
      <a href={entry.href} data-nav-key={entry.key} className={`${linkClass} h-8 inline-flex items-center`}>
        {entry.label}
      </a>
    </li>
  )
}

function TopGroup({
  entry,
  expanded,
  trigger,
  panel,
  onToggle,
  onButtonKey,
  onLinkKey,
}: {
  entry: { key: string; label: string; links: readonly { href: string; label: string }[] }
  expanded: boolean
  trigger: Props
  panel: Props
  onToggle: () => void
  onButtonKey: (event: KeyboardEvent<HTMLButtonElement>) => void
  onLinkKey: (event: KeyboardEvent<HTMLAnchorElement>) => void
}) {
  return (
    <li className="relative">
      <button type="button" {...trigger} data-nav-button={entry.key} data-nav-key={entry.key} onClick={onToggle} onKeyDown={onButtonKey} className={buttonClass}>
        <span>{entry.label}</span>
        <Icon name="chevron-right" className={`ml-2 text-xs text-zinc-500 dark:text-zinc-400 ${expanded ? 'rotate-90' : ''}`} />
      </button>
      {expanded ? (
        <ul {...panel} data-nav-panel={entry.key} className={`${panelClass} absolute left-0 top-9 z-10 grid min-w-[12rem] gap-0.5`}>
          {entry.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className={linkClass} onKeyDown={onLinkKey}>{link.label}</a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  )
}

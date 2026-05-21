import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useRef } from 'react'
import { useDisclosurePattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { navMenuContent, navMenuTopLinksContent } from './disclosureData'
import { Icon } from '../../shared/Icon'
import { useNavMenuKeyboard } from './useNavMenuKeyboard'

type Props = HTMLAttributes<HTMLElement>

const buttonClass = cx(ds.button, ds.expandable, 'justify-between')
const panelClass =
  'rounded-md border border-zinc-200 bg-white p-2 text-sm text-zinc-700 dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-300'
const linkClass = cx(ds.option, 'block py-1 text-sm')

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

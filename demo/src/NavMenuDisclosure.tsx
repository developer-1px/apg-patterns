import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useRef } from 'react'
import { createPatternRuntime, disclosureDefinition, type PatternData, type PatternEvent } from '../../src'
import { navMenuContent, navMenuTopLinksContent } from './disclosureData'
import { Icon } from './Icon'

type Props = HTMLAttributes<HTMLElement>

const buttonClass =
  'inline-flex h-8 items-center justify-between rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'
const panelClass =
  'rounded bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300'
const linkClass =
  'block rounded px-2 py-1 text-sm text-zinc-700 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800'

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
  const { rootKeys, expandedKeys, triggerOf, panelOf } = useTriggerRuntime(data, onEvent)
  const containerRef = useRef<HTMLDivElement>(null)
  const entries = mixed ? navMenuTopLinksContent : navMenuContent.map((group) => ({ kind: 'group' as const, ...group }))

  const focusButton = (key: string) => containerRef.current?.querySelector<HTMLElement>(`[data-nav-button="${key}"]`)?.focus()
  const focusFirstLink = (key: string) => containerRef.current?.querySelector<HTMLElement>(`[data-nav-panel="${key}"] a`)?.focus()
  const focusLastLink = (key: string) => {
    const links = containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`)
    if (links?.length) links[links.length - 1].focus()
  }
  const focusSiblingLink = (key: string, current: HTMLElement, dir: 1 | -1) => {
    const links = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`) ?? [])
    const index = links.indexOf(current)
    if (index < 0) return
    links[(index + dir + links.length) % links.length]?.focus()
  }
  const closeOthers = (key: string) => expandedKeys.filter((expandedKey) => expandedKey !== key).forEach((expandedKey) => onEvent({ type: 'expand', key: expandedKey, expanded: false }))

  const onButtonKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const expanded = expandedKeys.includes(key)
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      closeOthers(key)
      onEvent({ type: 'expand', key, expanded: !expanded })
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (expanded) onEvent({ type: 'expand', key, expanded: false })
      focusButton(key)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!expanded) {
        closeOthers(key)
        onEvent({ type: 'expand', key, expanded: true })
        setTimeout(() => focusFirstLink(key), 0)
      } else {
        focusFirstLink(key)
      }
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (expanded) focusLastLink(key)
      return
    }
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault()
      const focusables = getAllFocusableTopLevel(containerRef.current)
      const index = focusables.findIndex((el) => el.dataset.navKey === key || el.dataset.navButton === key)
      if (index < 0) return
      if (expanded) onEvent({ type: 'expand', key, expanded: false })
      focusables[(index + (event.key === 'ArrowRight' ? 1 : -1) + focusables.length) % focusables.length]?.focus()
    }
  }

  const onLinkKey = (key: string) => (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEvent({ type: 'expand', key, expanded: false })
      focusButton(key)
      return
    }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      focusSiblingLink(key, event.currentTarget, event.key === 'ArrowDown' ? 1 : -1)
    }
  }

  return (
    <nav ref={containerRef} aria-label="Mythical University">
      <ul className="flex flex-wrap items-start gap-2">
        {entries.map((entry) => entry.kind === 'link'
          ? <TopLink key={entry.key} entry={entry} />
          : <TopGroup key={entry.key} entry={entry} expanded={expandedKeys.includes(entry.key)} trigger={triggerOf(entry.key)} panel={panelOf(entry.key) ?? {}} onToggle={() => {
            closeOthers(entry.key)
            onEvent({ type: 'expand', key: entry.key, expanded: !expandedKeys.includes(entry.key) })
          }} onButtonKey={onButtonKey(entry.key)} onLinkKey={onLinkKey(entry.key)} />)}
      </ul>
    </nav>
  )
}

function useTriggerRuntime(data: PatternData, onEvent: (event: PatternEvent) => void) {
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (key) => `disclosure-${String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })
  const triggerOf = (key: string) => {
    const { onKeyDown: _ignore, ...rest } = runtime.getItemProps('trigger', key) as Props
    return rest
  }
  const panelOf = (triggerKey: string) => {
    const panelKey = data.relations?.controlsByKey?.[triggerKey]?.[0]
    return panelKey ? runtime.getItemProps('panel', panelKey) as Props : null
  }
  return { rootKeys: data.relations?.rootKeys ?? [], expandedKeys: data.state?.expandedKeys ?? [], triggerOf, panelOf }
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

function getAllFocusableTopLevel(root: HTMLElement | null): HTMLElement[] {
  return root ? Array.from(root.querySelectorAll<HTMLElement>('[data-nav-key]')) : []
}

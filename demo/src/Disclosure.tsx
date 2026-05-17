import type { HTMLAttributes, KeyboardEvent } from 'react'
import { useRef } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import {
  createDisclosureRuntime,
  createPatternRuntime,
  disclosureDefinition,
  type PatternData,
  type PatternEvent,
} from '../../src'
import {
  disclosurePanelText,
  faqDisclosureContent,
  imageDisclosureContent,
  navMenuContent,
  navMenuTopLinksContent,
  type DisclosureVariantKey,
} from './disclosureData'

type Props = HTMLAttributes<HTMLElement>

const buttonClass =
  'inline-flex h-8 items-center justify-between rounded bg-zinc-100 px-3 text-sm text-zinc-800 outline-none hover:bg-zinc-200 focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 dark:focus:outline-zinc-500'
const panelClass =
  'rounded bg-zinc-50 p-3 text-sm text-zinc-700 dark:bg-zinc-900/70 dark:text-zinc-300'
const linkClass =
  'block rounded px-2 py-1 text-sm text-zinc-700 outline-none hover:bg-zinc-100 focus:outline focus:outline-2 focus:outline-zinc-400 dark:text-zinc-300 dark:hover:bg-zinc-800'

export interface DisclosureProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
  variant?: DisclosureVariantKey
}

export function Disclosure({ data, onEvent, variant = 'simple' }: DisclosureProps) {
  if (variant === 'image') return <ImageDisclosure data={data} onEvent={onEvent} />
  if (variant === 'faq') return <FaqDisclosure data={data} onEvent={onEvent} />
  if (variant === 'navMenu') return <NavMenuDisclosure data={data} onEvent={onEvent} />
  if (variant === 'navMenuTopLinks') return <NavMenuTopLinksDisclosure data={data} onEvent={onEvent} />
  return <SimpleDisclosure data={data} onEvent={onEvent} />
}

// ── simple (default) ────────────────────────────────────────────────────────
function SimpleDisclosure({ data, onEvent }: { data: PatternData; onEvent: (e: PatternEvent) => void }) {
  const runtime = createDisclosureRuntime({ data, onEvent })
  const { onKeyDown: _ignore, ...triggerProps } = runtime.getTriggerProps() as Props
  const panelProps = runtime.getPanelProps() as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-md gap-2">
      <button
        type="button"
        {...triggerProps}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) =>
          onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
        }
        className={buttonClass}
      >
        <span>{runtime.triggerKey ? data.items[runtime.triggerKey]?.label : 'Disclosure'}</span>
        <span aria-hidden="true" className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">
          {runtime.expanded ? '▾' : '▸'}
        </span>
      </button>
      {runtime.expanded ? <div {...panelProps} className={panelClass}>{disclosurePanelText}</div> : null}
    </div>
  )
}

// ── helper: per-trigger props via shared pattern runtime ────────────────────
function useTriggerRuntime(data: PatternData, onEvent: (e: PatternEvent) => void) {
  const runtime = createPatternRuntime({
    definition: disclosureDefinition,
    data,
    options: {},
    onEvent,
    keyToElementId: (k) => `disclosure-${String(k).toLowerCase().replace(/[^a-z0-9_-]+/g, '-')}`,
  })
  const rootKeys = data.relations?.rootKeys ?? []
  const expandedKeys = data.state?.expandedKeys ?? []
  const triggerOf = (key: string) => {
    const { onKeyDown: _ignore, ...rest } = runtime.getItemProps('trigger', key) as Props
    return rest
  }
  const panelOf = (triggerKey: string) => {
    const panelKey = data.relations?.controlsByKey?.[triggerKey]?.[0]
    if (!panelKey) return null
    return runtime.getItemProps('panel', panelKey) as Props
  }
  return { runtime, rootKeys, expandedKeys, triggerOf, panelOf }
}

// ── variant: Image Description ──────────────────────────────────────────────
function ImageDisclosure({ data, onEvent }: { data: PatternData; onEvent: (e: PatternEvent) => void }) {
  const runtime = createDisclosureRuntime({ data, onEvent })
  const { onKeyDown: _ignore, ...triggerProps } = runtime.getTriggerProps() as Props
  const panelProps = runtime.getPanelProps() as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-md gap-3">
      <img
        src={imageDisclosureContent.imageUrl}
        alt={imageDisclosureContent.imageAlt}
        className="h-40 w-full rounded object-cover"
      />
      <button
        type="button"
        {...triggerProps}
        onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) =>
          onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })
        }
        className={buttonClass}
      >
        <span>{runtime.expanded ? 'Hide description' : 'Show description'}</span>
        <span aria-hidden="true" className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">
          {runtime.expanded ? '▾' : '▸'}
        </span>
      </button>
      {runtime.expanded ? (
        <div {...panelProps} className={panelClass}>{imageDisclosureContent.description}</div>
      ) : null}
    </div>
  )
}

// ── variant: FAQ ────────────────────────────────────────────────────────────
function FaqDisclosure({ data, onEvent }: { data: PatternData; onEvent: (e: PatternEvent) => void }) {
  const { rootKeys, expandedKeys, triggerOf, panelOf } = useTriggerRuntime(data, onEvent)
  const onTriggerKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      const expanded = expandedKeys.includes(key)
      onEvent({ type: 'expand', key, expanded: !expanded })
    }
  }
  return (
    <div className="grid max-w-xl gap-2">
      {rootKeys.map((key) => {
        const row = faqDisclosureContent.find((r) => r.key === key)
        if (!row) return null
        const expanded = expandedKeys.includes(key)
        const panelProps = panelOf(key) ?? {}
        return (
          <div key={key} className="grid gap-1">
            <button
              type="button"
              {...triggerOf(key)}
              onKeyDown={onTriggerKey(key)}
              onClick={() => onEvent({ type: 'expand', key, expanded: !expanded })}
              className={buttonClass}
            >
              <span className="text-left">{row.question}</span>
              <span aria-hidden="true" className="ml-3 text-xs text-zinc-500 dark:text-zinc-400">
                {expanded ? '▾' : '▸'}
              </span>
            </button>
            {expanded ? <div {...panelProps} className={panelClass}>{row.answer}</div> : null}
          </div>
        )
      })}
    </div>
  )
}

// ── variant: Navigation Menu (all top-level are disclosure buttons) ─────────
function NavMenuDisclosure({ data, onEvent }: { data: PatternData; onEvent: (e: PatternEvent) => void }) {
  return <NavMenuBase data={data} onEvent={onEvent} mixed={false} />
}
function NavMenuTopLinksDisclosure({ data, onEvent }: { data: PatternData; onEvent: (e: PatternEvent) => void }) {
  return <NavMenuBase data={data} onEvent={onEvent} mixed={true} />
}

function NavMenuBase({
  data,
  onEvent,
  mixed,
}: {
  data: PatternData
  onEvent: (e: PatternEvent) => void
  mixed: boolean
}) {
  const { rootKeys, expandedKeys, triggerOf, panelOf } = useTriggerRuntime(data, onEvent)
  const containerRef = useRef<HTMLDivElement>(null)
  const entries = mixed ? navMenuTopLinksContent : navMenuContent.map((g) => ({ kind: 'group' as const, ...g }))

  const closeAll = () =>
    expandedKeys.forEach((k) => onEvent({ type: 'expand', key: k, expanded: false }))

  const focusButton = (key: string) => {
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-nav-button="${key}"]`)
    el?.focus()
  }
  const focusFirstLink = (key: string) => {
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-nav-panel="${key}"] a`)
    el?.focus()
  }
  const focusLastLink = (key: string) => {
    const links = containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`)
    if (links && links.length) links[links.length - 1].focus()
  }
  const focusSiblingLink = (key: string, current: HTMLElement, dir: 1 | -1) => {
    const links = Array.from(containerRef.current?.querySelectorAll<HTMLElement>(`[data-nav-panel="${key}"] a`) ?? [])
    const idx = links.indexOf(current)
    if (idx < 0) return
    const next = links[(idx + dir + links.length) % links.length]
    next?.focus()
  }

  const onButtonKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const expanded = expandedKeys.includes(key)
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      // close other expanded, then toggle this
      expandedKeys.filter((k) => k !== key).forEach((k) => onEvent({ type: 'expand', key: k, expanded: false }))
      onEvent({ type: 'expand', key, expanded: !expanded })
      return
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      if (expanded) {
        onEvent({ type: 'expand', key, expanded: false })
        focusButton(key)
      }
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      if (!expanded) {
        // open and focus first link
        expandedKeys.filter((k) => k !== key).forEach((k) => onEvent({ type: 'expand', key: k, expanded: false }))
        onEvent({ type: 'expand', key, expanded: true })
        // defer focus until after render
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
      const all = getAllFocusableTopLevel(containerRef.current)
      const idx = all.findIndex((el) => el.dataset.navKey === key || el.dataset.navButton === key)
      if (idx < 0) return
      const dir = event.key === 'ArrowRight' ? 1 : -1
      const next = all[(idx + dir + all.length) % all.length]
      // close current submenu when moving away
      if (expanded) onEvent({ type: 'expand', key, expanded: false })
      next?.focus()
    }
  }

  const onLinkKey = (key: string) => (event: KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEvent({ type: 'expand', key, expanded: false })
      focusButton(key)
      return
    }
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      focusSiblingLink(key, event.currentTarget, 1)
      return
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      focusSiblingLink(key, event.currentTarget, -1)
    }
  }

  return (
    <nav ref={containerRef} aria-label="Mythical University">
      <ul className="flex flex-wrap items-start gap-2">
        {entries.map((entry) => {
          if (mixed && entry.kind === 'link') {
            return (
              <li key={entry.key}>
                <a
                  href={entry.href}
                  data-nav-key={entry.key}
                  className={`${linkClass} h-8 inline-flex items-center`}
                >
                  {entry.label}
                </a>
              </li>
            )
          }
          // group
          const key = entry.key
          const label = entry.label
          const expanded = expandedKeys.includes(key)
          const trigger = triggerOf(key)
          const panel = panelOf(key) ?? {}
          const links = mixed
            ? (entry as { links: readonly { href: string; label: string }[] }).links
            : (entry as { links: readonly { href: string; label: string }[] }).links
          return (
            <li key={key} className="relative">
              <button
                type="button"
                {...trigger}
                data-nav-button={key}
                data-nav-key={key}
                onClick={() => {
                  expandedKeys.filter((k) => k !== key).forEach((k) =>
                    onEvent({ type: 'expand', key: k, expanded: false }),
                  )
                  onEvent({ type: 'expand', key, expanded: !expanded })
                }}
                onKeyDown={onButtonKey(key)}
                className={buttonClass}
              >
                <span>{label}</span>
                <span aria-hidden="true" className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                  {expanded ? '▾' : '▸'}
                </span>
              </button>
              {expanded ? (
                <ul
                  {...panel}
                  data-nav-panel={key}
                  className={`${panelClass} absolute left-0 top-9 z-10 grid min-w-[12rem] gap-0.5`}
                >
                  {links.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={linkClass} onKeyDown={onLinkKey(key)}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

function getAllFocusableTopLevel(root: HTMLElement | null): HTMLElement[] {
  if (!root) return []
  return Array.from(root.querySelectorAll<HTMLElement>('[data-nav-key]'))
}

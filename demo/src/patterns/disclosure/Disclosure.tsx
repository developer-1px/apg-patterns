import type { HTMLAttributes, KeyboardEvent } from 'react'
import type { KeyInput } from '@interactive-os/keyboard'
import { createDisclosureRuntime, createPatternRuntime, disclosureDefinition, type PatternData, type PatternEvent } from '../../../../src'
import { disclosurePanelText, faqDisclosureContent, imageDisclosureContent, type DisclosureVariantKey } from './disclosureData'
import { Icon } from '../../shared/Icon'
import { NavMenuDisclosure, NavMenuTopLinksDisclosure } from './NavMenuDisclosure'

type Props = HTMLAttributes<HTMLElement>

const buttonClass =
  'inline-flex h-8 items-center justify-between rounded-xl bg-zinc-100/80 px-3 text-sm font-medium text-zinc-800 shadow-sm outline-none transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-200 dark:hover:bg-white/[0.08] dark:focus-visible:outline-zinc-500'
const panelClass =
  'rounded-xl bg-zinc-100/70 p-3 text-sm leading-relaxed text-zinc-700 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:text-zinc-300 dark:shadow-black/10'

export interface DisclosureProps {
  data: PatternData
  onEvent: (event: PatternEvent) => void
}

export function Disclosure({ data, onEvent }: DisclosureProps) {
  const variant = (data.state?.variant as DisclosureVariantKey | undefined) ?? 'simple'
  if (variant === 'image') return <ImageDisclosure data={data} onEvent={onEvent} />
  if (variant === 'faq') return <FaqDisclosure data={data} onEvent={onEvent} />
  if (variant === 'navMenu') return <NavMenuDisclosure data={data} onEvent={onEvent} />
  if (variant === 'navMenuTopLinks') return <NavMenuTopLinksDisclosure data={data} onEvent={onEvent} />
  return <SimpleDisclosure data={data} onEvent={onEvent} />
}

function SimpleDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const runtime = createDisclosureRuntime({ data, onEvent })
  const { onKeyDown: _ignore, ...triggerProps } = runtime.getTriggerProps() as Props
  const panelProps = runtime.getPanelProps() as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-md gap-2">
      <button type="button" {...triggerProps} onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })} className={buttonClass}>
        <span>{runtime.triggerKey ? data.items[runtime.triggerKey]?.label : 'Disclosure'}</span>
        <Chevron expanded={runtime.expanded} />
      </button>
      {runtime.expanded ? <div {...panelProps} className={panelClass}>{disclosurePanelText}</div> : null}
    </div>
  )
}

function ImageDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const runtime = createDisclosureRuntime({ data, onEvent })
  const { onKeyDown: _ignore, ...triggerProps } = runtime.getTriggerProps() as Props
  const panelProps = runtime.getPanelProps() as Props
  const onKeyDown = runtime.getRootKeyboardHandler()

  return (
    <div className="grid max-w-md gap-3">
      <img src={imageDisclosureContent.imageUrl} alt={imageDisclosureContent.imageAlt} className="h-40 w-full rounded-xl object-cover shadow-[0_12px_32px_rgba(24,24,27,0.08)]" />
      <button type="button" {...triggerProps} onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => onKeyDown(event as unknown as KeyInput & { preventDefault?: () => void })} className={buttonClass}>
        <span>{runtime.expanded ? 'Hide description' : 'Show description'}</span>
        <Chevron expanded={runtime.expanded} />
      </button>
      {runtime.expanded ? <div {...panelProps} className={panelClass}>{imageDisclosureContent.description}</div> : null}
    </div>
  )
}

function FaqDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const { rootKeys, expandedKeys, triggerOf, panelOf } = useTriggerRuntime(data, onEvent)
  const onTriggerKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return
    event.preventDefault()
    onEvent({ type: 'expand', key, expanded: !expandedKeys.includes(key) })
  }

  return (
    <div className="grid max-w-xl gap-2">
      {rootKeys.map((key) => {
        const row = faqDisclosureContent.find((entry) => entry.key === key)
        if (!row) return null
        const expanded = expandedKeys.includes(key)
        return (
          <div key={key} className="grid gap-1">
            <button type="button" {...triggerOf(key)} onKeyDown={onTriggerKey(key)} onClick={() => onEvent({ type: 'expand', key, expanded: !expanded })} className={buttonClass}>
              <span className="text-left">{row.question}</span>
              <Chevron expanded={expanded} />
            </button>
            {expanded ? <div {...(panelOf(key) ?? {})} className={panelClass}>{row.answer}</div> : null}
          </div>
        )
      })}
    </div>
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

function Chevron({ expanded }: { expanded: boolean }) {
  return <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 dark:text-zinc-400 ${expanded ? 'rotate-90' : ''}`} />
}

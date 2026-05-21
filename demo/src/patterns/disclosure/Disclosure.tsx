import type { KeyboardEvent } from 'react'
import { useDisclosurePattern, type PatternData, type PatternEvent } from '../../../../src/react'
import { cx, ds } from '../../shared/designSystem'
import { disclosurePanelText, faqDisclosureContent, imageDisclosureContent, type DisclosureVariantKey } from './disclosureData'
import { Icon } from '../../shared/Icon'
import { NavMenuDisclosure, NavMenuTopLinksDisclosure } from './NavMenuDisclosure'

const buttonClass = cx(ds.button, ds.expandable, 'justify-between')
const panelClass =
  'rounded-xl bg-zinc-100/70 p-3 text-sm leading-relaxed text-zinc-700 shadow-inner shadow-zinc-200/50 dark:bg-white/[0.045] dark:text-zinc-300 dark:shadow-black/10'

interface DisclosureProps {
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
  const disclosure = useDisclosurePattern(data, onEvent)

  return (
    <div className="grid max-w-md gap-2">
      <button type="button" {...disclosure.triggerProps} className={buttonClass}>
        <span>{disclosure.triggerKey ? data.items[disclosure.triggerKey]?.label : 'Disclosure'}</span>
        <Chevron expanded={disclosure.expanded} />
      </button>
      {disclosure.expanded ? <div {...disclosure.panelProps} className={panelClass}>{disclosurePanelText}</div> : null}
    </div>
  )
}

function ImageDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const disclosure = useDisclosurePattern(data, onEvent)

  return (
    <div className="grid max-w-md gap-3">
      <img src={imageDisclosureContent.imageUrl} alt={imageDisclosureContent.imageAlt} className="h-40 w-full rounded-xl object-cover shadow-[0_12px_32px_rgba(24,24,27,0.08)]" />
      <button type="button" {...disclosure.triggerProps} className={buttonClass}>
        <span>{disclosure.expanded ? 'Hide description' : 'Show description'}</span>
        <Chevron expanded={disclosure.expanded} />
      </button>
      {disclosure.expanded ? <div {...disclosure.panelProps} className={panelClass}>{imageDisclosureContent.description}</div> : null}
    </div>
  )
}

function FaqDisclosure({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  const disclosure = useDisclosurePattern(data, onEvent)
  const onTriggerKey = (key: string) => (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== 'Enter' && event.key !== ' ' && event.key !== 'Spacebar') return
    event.preventDefault()
    onEvent({ type: 'expand', key, expanded: !disclosure.state.expandedKeys.includes(key) })
  }

  return (
    <div className="grid max-w-xl gap-2">
      {disclosure.items.map((item) => {
        const row = faqDisclosureContent.find((entry) => entry.key === item.key)
        if (!row) return null
        return (
          <div key={item.key} className="grid gap-1">
            <button type="button" {...item.triggerProps} onKeyDown={onTriggerKey(item.key)} onClick={() => onEvent({ type: 'expand', key: item.key, expanded: !item.expanded })} className={buttonClass}>
              <span className="text-left">{row.question}</span>
              <Chevron expanded={item.expanded} />
            </button>
            {item.expanded ? <div {...(item.panelProps ?? {})} className={panelClass}>{row.answer}</div> : null}
          </div>
        )
      })}
    </div>
  )
}

function Chevron({ expanded }: { expanded: boolean }) {
  return <Icon name="chevron-right" className={`ml-3 text-xs text-zinc-500 dark:text-zinc-400 ${expanded ? 'rotate-90' : ''}`} />
}

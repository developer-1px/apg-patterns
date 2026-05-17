import { type ReactNode } from 'react'
import { reduceDisclosureData, type PatternData } from '../../../src'
import { useVariantPatternDataHost } from '../demoHostState'
import { Disclosure } from '../Disclosure'
import {
  initialDisclosureData,
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from '../disclosureData'
import { renderDisclosureInspect } from '../inspect'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'

function VariantControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 text-xs text-zinc-600 dark:text-zinc-400">
      <span>{label}</span>
      {children}
    </div>
  )
}

export const entry: PatternEntry = {
  key: 'disclosure',
  label: 'Disclosure',
  order: 6,
  useDemoPattern: (onEvent) => {
    const variants: Record<DisclosureVariantKey, PatternData> = {
      simple: initialDisclosureData,
      image: initialImageDisclosureData,
      faq: initialFaqDisclosureData,
      navMenu: initialNavMenuDisclosureData,
      navMenuTopLinks: initialNavMenuTopLinksDisclosureData,
    }
    const items: readonly { key: DisclosureVariantKey; label: string }[] = [
      { key: 'simple', label: 'simple' },
      { key: 'image', label: 'image description' },
      { key: 'faq', label: 'FAQ' },
      { key: 'navMenu', label: 'navigation menu' },
      { key: 'navMenuTopLinks', label: 'navigation menu (top-level links)' },
    ]
    const host = useVariantPatternDataHost<DisclosureVariantKey>(
      'simple',
      initialDisclosureData,
      (variant) => variants[variant],
      (_variant, data, event) => reduceDisclosureData(data, event),
    )
    return {
      key: 'disclosure',
      label: 'Disclosure',
      keyboardShortcuts: ['Enter', 'Space'],
      sourceNames: ['Disclosure.tsx', 'disclosureData.ts', 'disclosure/runtime.ts', 'disclosure/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDisclosureInspect(host.data),
      variants: (
        <VariantControl label="variant">
          <VariantListbox value={host.variant} items={items} label="disclosure variants" idPrefix="disclosure-variant" onChange={host.selectVariant} />
        </VariantControl>
      ),
      preview: <Disclosure data={host.data} onEvent={(event) => {
        onEvent(event)
        host.dispatchEvent(event)
      }} />,
      reset: host.reset,
    }
  },
}

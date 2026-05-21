import { disclosureDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { variantItemsFrom } from '../../shared/demoPatternTypes'
import { Disclosure } from './Disclosure'
import {
  initialDisclosureData,
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'
import { renderDataInspect } from '../../shared/inspect/genericInspect'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const variants: Record<DisclosureVariantKey, { label: string; data: PatternData }> = {
  simple: { label: 'simple', data: initialDisclosureData },
  image: { label: 'image description', data: initialImageDisclosureData },
  faq: { label: 'FAQ', data: initialFaqDisclosureData },
  navMenu: { label: 'navigation menu', data: initialNavMenuDisclosureData },
  navMenuTopLinks: { label: 'navigation menu (top-level links)', data: initialNavMenuTopLinksDisclosureData },
}

export const disclosureVariantItems = variantItemsFrom(variants)

const disclosureDemoDefinition = {
  key: 'disclosure',
  label: 'Disclosure',
  keyboardShortcuts: ['Enter', 'Space'],
  sources: {
    main: 'Disclosure.tsx',
    entry: 'disclosure/entry.tsx',
    data: ['NavMenuDisclosure.tsx', 'disclosureData.ts'],
    hooks: ['disclosure/useDisclosurePattern.ts'],
    definition: 'disclosure/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'disclosure variants',
    idPrefix: 'disclosure-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Disclosure',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: disclosureDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<DisclosureVariantKey>(
      'simple',
      initialDisclosureData,
      (variant) => variants[variant].data,
      (_variant, data, event) => reducePatternData(disclosureDefinition, data, event),
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data },
          model: { variantItems: disclosureVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: (event: PatternEvent) => {
            onEvent(event)
            host.dispatchEvent(event)
          },
        },
        components: { Disclosure },
      },
    }
  },
})

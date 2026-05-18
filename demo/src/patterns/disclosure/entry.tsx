import { reduceDisclosureData, type PatternData, type PatternEvent } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Disclosure } from './Disclosure'
import {
  initialDisclosureData,
  initialFaqDisclosureData,
  initialImageDisclosureData,
  initialNavMenuDisclosureData,
  initialNavMenuTopLinksDisclosureData,
  type DisclosureVariantKey,
} from './disclosureData'
import { renderDataInspect } from '../../shared/inspect/index'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const variants: Record<DisclosureVariantKey, PatternData> = {
  simple: initialDisclosureData,
  image: initialImageDisclosureData,
  faq: initialFaqDisclosureData,
  navMenu: initialNavMenuDisclosureData,
  navMenuTopLinks: initialNavMenuTopLinksDisclosureData,
}

export const disclosureVariantItems: readonly { key: DisclosureVariantKey; label: string }[] = [
  { key: 'simple', label: 'simple' },
  { key: 'image', label: 'image description' },
  { key: 'faq', label: 'FAQ' },
  { key: 'navMenu', label: 'navigation menu' },
  { key: 'navMenuTopLinks', label: 'navigation menu (top-level links)' },
]

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
      (variant) => variants[variant],
      (_variant, data, event) => reduceDisclosureData(data, event),
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

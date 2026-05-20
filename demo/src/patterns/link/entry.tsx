import { Link } from './Link'
import { linkVariantItems, linkVariants, type LinkVariantKey } from './linkData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const linkDemoDefinition = {
  key: 'link',
  label: 'Link',
  keyboardShortcuts: ['Enter'],
  sources: {
    main: 'Link.tsx',
    entry: 'link/entry.tsx',
    data: ['linkData.ts'],
    hooks: ['link/useLinkPattern.ts'],
    definition: 'link/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'link variants',
    idPrefix: 'link-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Link',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<LinkVariantKey>({
  definition: linkDemoDefinition,
  initialVariant: 'anchor',
  initialData: linkVariants.anchor.data,
  dataByVariant: (variant) => linkVariants[variant].data,
  reduce: (_variant, data) => data,
  variantItems: linkVariantItems,
  componentName: 'Link',
  component: Link,
})

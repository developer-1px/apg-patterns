import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Link } from './Link'
import { linkVariantItems, linkVariants, type LinkVariantKey } from './linkData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

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
    extra: ['link/linkProps.ts'],
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
      onEvent: '$actions.emitEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: linkDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<LinkVariantKey>(
      'anchor',
      linkVariants.anchor.data,
      (variant) => linkVariants[variant].data,
      (_variant, data) => data,
    )
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: {
            variant: host.variant,
            data: host.data,
          },
          model: {
            variantItems: linkVariantItems,
          },
        },
        actions: {
          selectVariant: host.selectVariant,
          emitEvent: onEvent,
        },
        components: {
          Link,
        },
      },
    }
  },
})

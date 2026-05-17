import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Link } from './Link'
import { linkVariants, type LinkVariantKey } from './linkData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/data'

const items: readonly { key: LinkVariantKey; label: string }[] = [
  { key: 'anchor', label: 'Anchor <a href>' },
  { key: 'spanRole', label: 'Span role="link"' },
]

export const entry: PatternEntry = {
  key: 'link',
  label: 'Link',
  order: 19,
  useDemoPattern: (onEvent) => {
    const host = useVariantPatternDataHost<LinkVariantKey>(
      'anchor',
      linkVariants.anchor.data,
      (variant) => linkVariants[variant].data,
      (_variant, data) => data,
    )
    return {
      key: 'link',
      label: 'Link',
      keyboardShortcuts: ['Enter'],
      sourceNames: ['Link.tsx', 'linkData.ts', 'link/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox value={host.variant} items={items} label="link variants" idPrefix="link-variant" onChange={host.selectVariant} />,
      preview: <Link data={host.data} onEvent={onEvent} />,
      reset: () => host.selectVariant('anchor'),
    }
  },
}

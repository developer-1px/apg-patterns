import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { Link } from './Link'
import { linkVariants, type LinkVariantKey } from './linkData'
import { VariantListbox } from '../../shared/VariantListbox'
import { type PatternEntry, KERNEL_SOURCES } from '../../shared/demoPatternTypes'
import { renderDataInspect } from '../../shared/inspect/genericInspect'

const items: readonly { key: LinkVariantKey; label: string }[] = [
  { key: 'anchor', label: 'Anchor <a href>' },
  { key: 'spanRole', label: 'Span role="link"' },
]

export const entry: PatternEntry = {
  key: 'link',
  label: 'Link',
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
      sourceNames: ['Link.tsx', 'linkData.ts', 'link/definition.ts', ...KERNEL_SOURCES],
      inspect: renderDataInspect(host.data),
      variants: <VariantListbox orientation="horizontal" value={host.variant} items={items} label="link variants" idPrefix="link-variant" onChange={host.selectVariant} />,
      preview: <Link data={host.data} onEvent={onEvent} />,
    }
  },
}

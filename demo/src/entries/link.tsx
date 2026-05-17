import { useState } from 'react'
import { Link } from '../Link'
import { linkVariants, type LinkVariantKey } from '../linkData'
import { VariantListbox } from '../VariantListbox'
import { type PatternEntry } from '../demoPatternTypes'
import { renderDataInspect } from './_inspect'

const items: readonly { key: LinkVariantKey; label: string }[] = [
  { key: 'anchor', label: 'Anchor <a href>' },
  { key: 'spanRole', label: 'Span role="link"' },
]

export const entry: PatternEntry = {
  key: 'link',
  label: 'Link',
  order: 19,
  useDemoPattern: (onEvent) => {
    const [variant, setVariant] = useState<LinkVariantKey>('anchor')
    const data = linkVariants[variant].data
    return {
      key: 'link',
      label: 'Link',
      keyboardShortcuts: ['Enter'],
      sourceNames: ['Link.tsx', 'linkData.ts', 'link/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
      inspect: renderDataInspect(data),
      variants: <VariantListbox value={variant} items={items} label="link variants" idPrefix="link-variant" onChange={setVariant} />,
      preview: <Link data={data} onEvent={onEvent} />,
      reset: () => setVariant('anchor'),
    }
  },
}

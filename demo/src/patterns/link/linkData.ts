import { PatternDataSchema, type PatternData } from '../../../../src/react'
import { variantItemsFrom } from '../../shared/demoPatternTypes'

export type LinkVariantKey = 'anchor' | 'spanRole'

interface LinkVariant {
  label: string
  data: PatternData
}

const anchorInitial = PatternDataSchema.parse({
  items: {
    home: { label: 'WAI-ARIA Authoring Practices', href: 'https://www.w3.org/WAI/ARIA/apg/' },
  },
  relations: { rootKeys: ['home'] },
  state: { activeKey: 'home' },
})

const spanRoleInitial = PatternDataSchema.parse({
  items: {
    home: { label: 'Open APG Link pattern', href: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/', variant: 'spanRole' },
  },
  relations: { rootKeys: ['home'] },
  state: { activeKey: 'home' },
})

export const linkVariants: Record<LinkVariantKey, LinkVariant> = {
  anchor: {
    label: 'Anchor <a href>',
    data: anchorInitial,
  },
  spanRole: {
    label: 'Span role="link"',
    data: spanRoleInitial,
  },
}

export const linkVariantItems = variantItemsFrom(linkVariants)

import { PatternDataSchema, type PatternData } from '../../src'

export type LinkVariantKey = 'anchor' | 'spanRole'

export interface LinkVariant {
  key: LinkVariantKey
  label: string
  data: PatternData
  href: string
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
    home: { label: 'Open APG Link pattern', href: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/' },
  },
  relations: { rootKeys: ['home'] },
  state: { activeKey: 'home' },
})

export const linkVariants: Record<LinkVariantKey, LinkVariant> = {
  anchor: {
    key: 'anchor',
    label: 'Anchor <a href>',
    data: anchorInitial,
    href: 'https://www.w3.org/WAI/ARIA/apg/',
  },
  spanRole: {
    key: 'spanRole',
    label: 'Span role="link"',
    data: spanRoleInitial,
    href: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/',
  },
}

export const initialAnchorLinkData = anchorInitial
export const initialSpanLinkData = spanRoleInitial

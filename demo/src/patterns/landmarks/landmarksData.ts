import type { PatternData, PatternItem } from '../../../../src'

export type LandmarkVariantKey =
  | 'html5'
  | 'all'
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'general'
  | 'main'
  | 'navigation'
  | 'region'
  | 'resources'
  | 'search'

export type LandmarkRegionRole =
  | 'banner'
  | 'complementary'
  | 'contentinfo'
  | 'form'
  | 'main'
  | 'navigation'
  | 'region'
  | 'search'

export interface LandmarkRegion {
  readonly key: string
  readonly role: LandmarkRegionRole
  readonly label: string
  readonly content: string
}

export type LandmarkDataItem = PatternItem & {
  kind: LandmarkRegionRole
  content: string
}

export interface LandmarkVariant {
  readonly key: LandmarkVariantKey
  readonly label: string
  readonly regions: readonly LandmarkRegion[]
}

const fullPage: readonly LandmarkRegion[] = [
  { key: 'banner', role: 'banner', label: 'Site header', content: 'Header' },
  { key: 'nav-primary', role: 'navigation', label: 'Primary', content: 'Home  Patterns  About' },
  { key: 'search', role: 'search', label: 'Site', content: 'Search' },
  { key: 'main', role: 'main', label: 'Main', content: 'Main content' },
  { key: 'aside', role: 'complementary', label: 'Related', content: 'Related links' },
  { key: 'footer', role: 'contentinfo', label: 'Footer', content: 'Copyright' },
]

export const landmarkVariants: Record<LandmarkVariantKey, LandmarkVariant> = {
  html5: {
    key: 'html5',
    label: 'HTML5',
    regions: fullPage,
  },
  all: {
    key: 'all',
    label: 'All landmarks',
    regions: [
      ...fullPage,
      { key: 'form', role: 'form', label: 'Newsletter', content: 'Email' },
      { key: 'region', role: 'region', label: 'Status', content: 'Saved' },
    ],
  },
  banner: {
    key: 'banner',
    label: 'Banner',
    regions: [{ key: 'banner', role: 'banner', label: 'Site header', content: 'Header' }],
  },
  complementary: {
    key: 'complementary',
    label: 'Complementary',
    regions: [{ key: 'aside', role: 'complementary', label: 'Related', content: 'Related links' }],
  },
  contentinfo: {
    key: 'contentinfo',
    label: 'Contentinfo',
    regions: [{ key: 'footer', role: 'contentinfo', label: 'Footer', content: 'Copyright' }],
  },
  form: {
    key: 'form',
    label: 'Form',
    regions: [{ key: 'form', role: 'form', label: 'Contact', content: 'Name  Email  Message' }],
  },
  general: {
    key: 'general',
    label: 'General principles',
    regions: fullPage,
  },
  main: {
    key: 'main',
    label: 'Main',
    regions: [{ key: 'main', role: 'main', label: 'Main', content: 'Main content' }],
  },
  navigation: {
    key: 'navigation',
    label: 'Navigation',
    regions: [
      { key: 'nav-primary', role: 'navigation', label: 'Primary', content: 'Home  Patterns  About' },
      { key: 'nav-footer', role: 'navigation', label: 'Footer', content: 'Privacy  Terms' },
    ],
  },
  region: {
    key: 'region',
    label: 'Region',
    regions: [{ key: 'region', role: 'region', label: 'Status', content: 'Saved' }],
  },
  resources: {
    key: 'resources',
    label: 'Resources',
    regions: [
      { key: 'main', role: 'main', label: 'Main', content: 'Resources' },
      { key: 'aside', role: 'complementary', label: 'Related resources', content: 'Examples  Specs' },
    ],
  },
  search: {
    key: 'search',
    label: 'Search',
    regions: [{ key: 'search', role: 'search', label: 'Site', content: 'Search' }],
  },
}

export const landmarkVariantItems: readonly { key: LandmarkVariantKey; label: string }[] = Object.values(
  landmarkVariants,
).map(({ key, label }) => ({ key, label }))

export const initialLandmarkVariant: LandmarkVariantKey = 'html5'

export function buildLandmarkData(variant: LandmarkVariant): PatternData<LandmarkDataItem> {
  return {
    items: Object.fromEntries(
      variant.regions.map((region) => [
        region.key,
        { label: region.label, kind: region.role, content: region.content },
      ]),
    ),
    relations: { rootKeys: variant.regions.map((region) => region.key) },
    refs: { label: variant.label },
    state: { variant: variant.key },
  }
}

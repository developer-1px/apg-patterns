import type { PatternData } from '../../../../src/react'

type BreadcrumbItem = { key: string; label: string; href: string }

export const breadcrumbItems: ReadonlyArray<BreadcrumbItem> = [
  { key: 'home', label: 'WAI', href: 'https://www.w3.org/WAI/' },
  { key: 'aria', label: 'ARIA', href: 'https://www.w3.org/WAI/standards-guidelines/aria/' },
  { key: 'apg', label: 'APG', href: 'https://www.w3.org/WAI/ARIA/apg/' },
  { key: 'patterns', label: 'Patterns', href: 'https://www.w3.org/WAI/ARIA/apg/patterns/' },
  { key: 'breadcrumb', label: 'Breadcrumb', href: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/' },
]

const breadcrumbLabel = 'Breadcrumb'

export const initialBreadcrumbData: PatternData = {
  items: Object.fromEntries(
    breadcrumbItems.map((item) => [item.key, { label: item.label, href: item.href }]),
  ),
  relations: {
    rootKeys: breadcrumbItems.map((item) => item.key),
  },
  state: {
    currentByKey: { [breadcrumbItems[breadcrumbItems.length - 1]!.key]: 'page' },
  },
  refs: {
    label: breadcrumbLabel,
  },
}

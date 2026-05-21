import type { PatternData } from '../../../../src/react'

export type DisclosureVariantKey = 'simple' | 'image' | 'faq' | 'navMenu' | 'navMenuTopLinks'

function buildSingleDisclosureData(triggerLabel: string, panelLabel: string, variant: 'simple' | 'image'): PatternData {
  return {
    items: {
      trigger: { label: triggerLabel },
      panel: { label: panelLabel },
    },
    relations: {
      rootKeys: ['trigger'],
      controlsByKey: { trigger: ['panel'] },
      ownerByKey: { panel: 'trigger' },
    },
    state: {
      activeKey: 'trigger',
      expandedKeys: [],
      variant,
    },
  }
}

export const initialDisclosureData = buildSingleDisclosureData('Shipping details', 'Shipping details panel', 'simple')

export const disclosurePanelText =
  'Orders before 2pm ship today. Tracking arrives by email.'

export const initialImageDisclosureData = buildSingleDisclosureData('Show description', 'Image description', 'image')

export const imageDisclosureContent = {
  imageUrl:
    'https://picsum.photos/id/237/900/520',
  imageAlt: 'Dog portrait',
  description:
    'Close portrait on a dark background.',
}

type FaqRow = { key: string; question: string; answer: string }
const faqRows: readonly FaqRow[] = [
  { key: 'faq1', question: 'What is the cost of a basic membership?', answer: 'Basic membership is free.' },
  { key: 'faq2', question: 'Can I become a member without a credit card?', answer: 'Yes. Basic is free; paid tiers support bank transfer and PayPal.' },
  { key: 'faq3', question: 'How do I cancel my membership?', answer: 'Open Account Settings -> Membership -> Cancel.' },
  { key: 'faq4', question: 'Where do I send suggestions or feedback?', answer: 'Send suggestions from Account Settings.' },
]

export const faqDisclosureContent = faqRows
export const initialFaqDisclosureData: PatternData = (() => {
  const items: Record<string, { label: string }> = {}
  const controlsByKey: Record<string, string[]> = {}
  const ownerByKey: Record<string, string> = {}
  const rootKeys: string[] = []
  for (const row of faqRows) {
    const panelKey = `${row.key}-panel`
    items[row.key] = { label: row.question }
    items[panelKey] = { label: `${row.question} answer` }
    rootKeys.push(row.key)
    controlsByKey[row.key] = [panelKey]
    ownerByKey[panelKey] = row.key
  }
  return {
    items,
    relations: { rootKeys, controlsByKey, ownerByKey },
    state: { activeKey: rootKeys[0], expandedKeys: [], variant: 'faq' },
  }
})()

type NavLink = { href: string; label: string }
type NavGroup = { key: string; label: string; links: readonly NavLink[] }
type NavMixed =
  | { kind: 'link'; key: string; label: string; href: string }
  | { kind: 'group'; key: string; label: string; links: readonly NavLink[] }

const navGroups: readonly NavGroup[] = [
  {
    key: 'about',
    label: 'About',
    links: [
      { href: '#overview', label: 'Overview' },
      { href: '#history', label: 'History' },
      { href: '#mission', label: 'Mission' },
    ],
  },
  {
    key: 'admissions',
    label: 'Admissions',
    links: [
      { href: '#apply', label: 'Apply' },
      { href: '#tuition', label: 'Tuition' },
      { href: '#sessions', label: 'Sessions' },
    ],
  },
  {
    key: 'academics',
    label: 'Academics',
    links: [
      { href: '#programs', label: 'Programs' },
      { href: '#schools', label: 'Schools' },
      { href: '#calendar', label: 'Calendar' },
    ],
  },
]

export const navMenuContent: readonly NavMixed[] = navGroups.map((group) => ({ kind: 'group', ...group }))

function buildNavDisclosureData(entries: readonly NavMixed[], variant: 'navMenu' | 'navMenuTopLinks'): PatternData {
  const items: Record<string, { label: string }> = {}
  const controlsByKey: Record<string, string[]> = {}
  const ownerByKey: Record<string, string> = {}
  const rootKeys: string[] = []
  for (const entry of entries) {
    if (entry.kind === 'link') {
      items[entry.key] = { label: entry.label }
      continue
    }
    const panelKey = `${entry.key}-panel`
    items[entry.key] = { label: entry.label }
    items[panelKey] = { label: `${entry.label} submenu` }
    rootKeys.push(entry.key)
    controlsByKey[entry.key] = [panelKey]
    ownerByKey[panelKey] = entry.key
  }
  return {
    items,
    relations: { rootKeys, controlsByKey, ownerByKey },
    state: { activeKey: rootKeys[0], expandedKeys: [], variant },
  }
}

export const initialNavMenuDisclosureData = buildNavDisclosureData(navMenuContent, 'navMenu')

export const navMenuTopLinksContent: readonly NavMixed[] = [
  { kind: 'link', key: 'home', label: 'Home', href: '#home' },
  ...navMenuContent,
  { kind: 'link', key: 'contact', label: 'Contact', href: '#contact' },
]
export const initialNavMenuTopLinksDisclosureData = buildNavDisclosureData(navMenuTopLinksContent, 'navMenuTopLinks')

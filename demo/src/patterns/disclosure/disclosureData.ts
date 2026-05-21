import type { PatternData } from '../../../../src/react'

export type DisclosureVariantKey = 'simple' | 'image' | 'faq' | 'navMenu' | 'navMenuTopLinks'

export const initialDisclosureData: PatternData = {
  items: {
    trigger: { label: 'Shipping details' },
    panel: { label: 'Shipping details panel' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['panel'] },
    ownerByKey: { panel: 'trigger' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
    variant: 'simple',
  },
}

export const disclosurePanelText =
  'Orders before 2pm ship today. Tracking arrives by email.'

export const initialImageDisclosureData: PatternData = {
  items: {
    trigger: { label: 'Show description' },
    panel: { label: 'Image description' },
  },
  relations: {
    rootKeys: ['trigger'],
    controlsByKey: { trigger: ['panel'] },
    ownerByKey: { panel: 'trigger' },
  },
  state: {
    activeKey: 'trigger',
    expandedKeys: [],
    variant: 'image',
  },
}

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

type NavGroup = { key: string; label: string; links: readonly { href: string; label: string }[] }
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

export const navMenuContent = navGroups
export const initialNavMenuDisclosureData: PatternData = (() => {
  const items: Record<string, { label: string }> = {}
  const controlsByKey: Record<string, string[]> = {}
  const ownerByKey: Record<string, string> = {}
  const rootKeys: string[] = []
  for (const group of navGroups) {
    const panelKey = `${group.key}-panel`
    items[group.key] = { label: group.label }
    items[panelKey] = { label: `${group.label} submenu` }
    rootKeys.push(group.key)
    controlsByKey[group.key] = [panelKey]
    ownerByKey[panelKey] = group.key
  }
  return {
    items,
    relations: { rootKeys, controlsByKey, ownerByKey },
    state: { activeKey: rootKeys[0], expandedKeys: [], variant: 'navMenu' },
  }
})()

type NavMixed =
  | { kind: 'link'; key: string; label: string; href: string }
  | { kind: 'group'; key: string; label: string; links: readonly { href: string; label: string }[] }

const navTopLinks: readonly NavMixed[] = [
  { kind: 'link', key: 'home', label: 'Home', href: '#home' },
  { kind: 'group', key: navGroups[0]!.key, label: navGroups[0]!.label, links: navGroups[0]!.links },
  { kind: 'group', key: navGroups[1]!.key, label: navGroups[1]!.label, links: navGroups[1]!.links },
  { kind: 'group', key: navGroups[2]!.key, label: navGroups[2]!.label, links: navGroups[2]!.links },
  { kind: 'link', key: 'contact', label: 'Contact', href: '#contact' },
]

export const navMenuTopLinksContent = navTopLinks
export const initialNavMenuTopLinksDisclosureData: PatternData = (() => {
  const items: Record<string, { label: string }> = {}
  const controlsByKey: Record<string, string[]> = {}
  const ownerByKey: Record<string, string> = {}
  const rootKeys: string[] = []
  for (const entry of navTopLinks) {
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
    state: { activeKey: rootKeys[0], expandedKeys: [], variant: 'navMenuTopLinks' },
  }
})()

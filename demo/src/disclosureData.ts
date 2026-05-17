import type { PatternData } from '../../src'

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
  'Orders placed before 2pm ship the same business day. Tracking numbers are sent by email once your package leaves our warehouse.'

// ── APG variant: Disclosure of Image Description ────────────────────────────
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
    'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/images/welsh-springer-spaniel.jpg',
  imageAlt: 'Welsh Springer Spaniel',
  description:
    'A Welsh Springer Spaniel is a medium-sized dog with a soft, wavy red-and-white coat, long feathered ears, and a friendly, attentive expression.',
}

// ── APG variant: Disclosure of Answers to FAQs ──────────────────────────────
type FaqRow = { key: string; question: string; answer: string }
const faqRows: readonly FaqRow[] = [
  { key: 'faq1', question: 'What is the cost of a basic membership?', answer: 'Basic membership is free for everyone and includes access to community discussions.' },
  { key: 'faq2', question: 'Can I become a member without a credit card?', answer: 'Yes. Bank transfer and PayPal are supported for paid tiers; basic tier requires no payment method.' },
  { key: 'faq3', question: 'How do I cancel my membership?', answer: 'Open Account Settings → Membership → Cancel. Cancellation takes effect at the end of the current billing period.' },
  { key: 'faq4', question: 'Where do I send suggestions or feedback?', answer: 'Email feedback@example.com or open an issue on our GitHub repository.' },
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

// ── APG variant: Disclosure Navigation Menu ─────────────────────────────────
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

// ── APG variant: Disclosure Navigation Menu with Top-Level Links ────────────
// 'home' and 'contact' are plain links (no submenu); rest are disclosure buttons.
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
      // Plain links are not part of disclosure rootKeys, but include in items for inspect labels.
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

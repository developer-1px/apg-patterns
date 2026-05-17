import { PatternDataSchema, type PatternData, type PatternOptions } from '../../../../src'

type TabSpec = { key: string; label: string; panelLabel: string; content: string }

type TabsViewOptions = PatternOptions & {
  activationMode: 'automatic' | 'manual'
  closeable?: boolean
  scrollable?: boolean
}

const buildTabsData = (tabs: readonly TabSpec[], activeKey: string, label = 'Sections', options: TabsViewOptions): PatternData => {
  const items: Record<string, { label: string; content?: string }> = {}
  for (const tab of tabs) {
    items[tab.key] = { label: tab.label }
    items[`${tab.key}Panel`] = { label: tab.panelLabel, content: tab.content }
  }
  return PatternDataSchema.parse({
    items,
    relations: {
      rootKeys: tabs.map((tab) => tab.key),
      controlsByKey: Object.fromEntries(tabs.map((tab) => [tab.key, [`${tab.key}Panel`]])),
      ownerByKey: Object.fromEntries(tabs.map((tab) => [`${tab.key}Panel`, tab.key])),
    },
    state: {
      activeKey,
      selectedKeys: [activeKey],
      options,
    },
    refs: { label },
  })
}

const docsTabs: readonly TabSpec[] = [
  { key: 'overview', label: 'Overview', panelLabel: 'Overview panel', content: 'High-level summary of the pattern, including authoring practices and ARIA structure.' },
  { key: 'code', label: 'Code', panelLabel: 'Code panel', content: 'Reference implementation snippets and integration tips.' },
  { key: 'audit', label: 'Audit', panelLabel: 'Audit panel', content: 'Accessibility audit results and known issues.' },
]

const planetsTabs: readonly TabSpec[] = [
  { key: 'mercury', label: 'Mercury', panelLabel: 'Mercury panel', content: 'Mercury is the smallest and innermost planet in the Solar System.' },
  { key: 'venus', label: 'Venus', panelLabel: 'Venus panel', content: 'Venus is the second planet from the Sun and the hottest planet.' },
  { key: 'earth', label: 'Earth', panelLabel: 'Earth panel', content: 'Earth is the third planet from the Sun and the only known inhabited planet.' },
  { key: 'mars', label: 'Mars', panelLabel: 'Mars panel', content: 'Mars is the fourth planet, often called the Red Planet.' },
]

const longTabs: readonly TabSpec[] = [
  { key: 'danish', label: 'Danish', panelLabel: 'Danish panel', content: 'A long passage of placeholder text long enough to require scrolling within the tab panel. '.repeat(20) },
  { key: 'cinnamon', label: 'Cinnamon Roll', panelLabel: 'Cinnamon Roll panel', content: 'Cinnamon roll panel content. '.repeat(40) },
  { key: 'donut', label: 'Donut', panelLabel: 'Donut panel', content: 'Donut panel content. '.repeat(40) },
]

const closeableTabs: readonly TabSpec[] = [
  { key: 'inbox', label: 'Inbox', panelLabel: 'Inbox panel', content: 'Press Delete while a tab is focused to close it.' },
  { key: 'drafts', label: 'Drafts', panelLabel: 'Drafts panel', content: 'Drafts panel content.' },
  { key: 'sent', label: 'Sent', panelLabel: 'Sent panel', content: 'Sent panel content.' },
  { key: 'trash', label: 'Trash', panelLabel: 'Trash panel', content: 'Trash panel content.' },
]

export type TabsVariantKey = 'automatic' | 'manual' | 'vertical' | 'scrollable' | 'closeable'

export interface TabsVariantSpec {
  label: string
  data: PatternData
  options: TabsViewOptions
  hint?: string
}

export const tabsVariants: Record<TabsVariantKey, TabsVariantSpec> = {
  automatic: {
    label: 'Automatic activation',
    options: { activationMode: 'automatic', orientation: 'horizontal' },
    data: buildTabsData(docsTabs, 'overview', 'Documentation', { activationMode: 'automatic', orientation: 'horizontal' }),
    hint: 'Arrow keys activate immediately on focus.',
  },
  manual: {
    label: 'Manual activation',
    options: { activationMode: 'manual', orientation: 'horizontal' },
    data: buildTabsData(docsTabs, 'overview', 'Documentation', { activationMode: 'manual', orientation: 'horizontal' }),
    hint: 'Arrow keys move focus only. Press Enter or Space to activate.',
  },
  vertical: {
    label: 'Vertical (automatic)',
    options: { activationMode: 'automatic', orientation: 'vertical' },
    data: buildTabsData(planetsTabs, 'earth', 'Planets', { activationMode: 'automatic', orientation: 'vertical' }),
    hint: 'Up/Down arrows navigate between tabs.',
  },
  scrollable: {
    label: 'Scrollable panels',
    options: { activationMode: 'automatic', orientation: 'horizontal', scrollable: true },
    data: buildTabsData(longTabs, 'danish', 'Pastries', { activationMode: 'automatic', orientation: 'horizontal', scrollable: true }),
    hint: 'Tabpanel is keyboard-focusable and scrollable (tabIndex=0).',
  },
  closeable: {
    label: 'Closeable tabs',
    options: { activationMode: 'manual', orientation: 'horizontal', closeable: true },
    data: buildTabsData(closeableTabs, 'inbox', 'Mailboxes', { activationMode: 'manual', orientation: 'horizontal', closeable: true }),
    hint: 'Press Delete to close the focused tab.',
  },
}

export const tabsVariantItems = Object.entries(tabsVariants).map(([key, value]) => ({ key: key as TabsVariantKey, label: value.label }))

export const initialTabsVariant: TabsVariantKey = 'automatic'
export const initialTabsData = tabsVariants.automatic.data

export function closeTabInData(data: PatternData, tabKey: string): PatternData {
  const rootKeys = data.relations?.rootKeys ?? []
  if (rootKeys.length <= 1) return data
  const index = rootKeys.indexOf(tabKey)
  if (index === -1) return data
  const nextRootKeys = rootKeys.filter((key) => key !== tabKey)
  const panelKey = data.relations?.controlsByKey?.[tabKey]?.[0]
  const nextItems = { ...data.items }
  delete nextItems[tabKey]
  if (panelKey) delete nextItems[panelKey]

  const nextControlsByKey = { ...(data.relations?.controlsByKey ?? {}) }
  delete nextControlsByKey[tabKey]
  const nextOwnerByKey = { ...(data.relations?.ownerByKey ?? {}) }
  if (panelKey) delete nextOwnerByKey[panelKey]

  const nextActive = nextRootKeys[Math.min(index, nextRootKeys.length - 1)]
  return {
    ...data,
    items: nextItems,
    relations: {
      ...data.relations,
      rootKeys: nextRootKeys,
      controlsByKey: nextControlsByKey,
      ownerByKey: nextOwnerByKey,
    },
    state: {
      ...data.state,
      activeKey: nextActive,
      selectedKeys: [nextActive],
    },
  }
}

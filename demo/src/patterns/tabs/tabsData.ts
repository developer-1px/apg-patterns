import { PatternDataSchema, type PatternData, type PatternOptions } from '../../../../src/react'

type TabSpec = { key: string; label: string; panelLabel: string; content: string }

type TabsViewOptions = PatternOptions & {
  activationMode: 'automatic' | 'manual'
  closeable?: boolean
  scrollable?: boolean
}

const buildTabsData = (tabs: readonly TabSpec[], activeKey: string, label = 'Sections'): PatternData => {
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
    },
    refs: { label },
  })
}

const docsTabs: readonly TabSpec[] = [
  { key: 'overview', label: 'Overview', panelLabel: 'Overview panel', content: 'Pattern status, owner notes, and the current implementation scope.' },
  { key: 'code', label: 'Code', panelLabel: 'Code panel', content: 'Tracked source files and integration checkpoints for this pattern.' },
  { key: 'audit', label: 'Audit', panelLabel: 'Audit panel', content: 'Recent accessibility findings, open risks, and verification status.' },
]

const planetsTabs: readonly TabSpec[] = [
  { key: 'mercury', label: 'Mercury', panelLabel: 'Mercury panel', content: 'Mercury is the smallest and innermost planet in the Solar System.' },
  { key: 'venus', label: 'Venus', panelLabel: 'Venus panel', content: 'Venus is the second planet from the Sun and the hottest planet.' },
  { key: 'earth', label: 'Earth', panelLabel: 'Earth panel', content: 'Earth is the third planet from the Sun and the only known inhabited planet.' },
  { key: 'mars', label: 'Mars', panelLabel: 'Mars panel', content: 'Mars is the fourth planet, often called the Red Planet.' },
]

const longTabs: readonly TabSpec[] = [
  {
    key: 'danish',
    label: 'Danish',
    panelLabel: 'Danish panel',
    content: 'Laminated dough needs a cold bench, even pressure, and a rest between folds. The panel intentionally includes enough operational notes to require scrolling while still reading like real product content. Review butter temperature, fold count, proofing time, bake color, cooling rack capacity, and packaging handoff before the morning run. '.repeat(4),
  },
  {
    key: 'cinnamon',
    label: 'Cinnamon Roll',
    panelLabel: 'Cinnamon Roll panel',
    content: 'Cinnamon roll batches move through mixing, bulk rest, rolling, filling, proofing, baking, glazing, and holding. Keep the filling edge clean so the roll seals correctly, and stage trays by bake time so the front counter receives a steady flow instead of one large handoff. '.repeat(5),
  },
  {
    key: 'donut',
    label: 'Donut',
    panelLabel: 'Donut panel',
    content: 'Donut prep depends on oil temperature, rack spacing, glaze viscosity, and finish timing. Log the first batch color, adjust proofing if the crumb tightens, and keep filled varieties separated until labels are applied. '.repeat(6),
  },
]

const closeableTabs: readonly TabSpec[] = [
  { key: 'inbox', label: 'Inbox', panelLabel: 'Inbox panel', content: 'New requests awaiting triage.' },
  { key: 'drafts', label: 'Drafts', panelLabel: 'Drafts panel', content: 'Unsent updates that need review.' },
  { key: 'sent', label: 'Sent', panelLabel: 'Sent panel', content: 'Recently delivered conversations.' },
  { key: 'trash', label: 'Trash', panelLabel: 'Trash panel', content: 'Removed items retained for recovery.' },
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
    data: buildTabsData(docsTabs, 'overview', 'Documentation'),
    hint: 'Arrow keys activate immediately on focus.',
  },
  manual: {
    label: 'Manual activation',
    options: { activationMode: 'manual', orientation: 'horizontal' },
    data: buildTabsData(docsTabs, 'overview', 'Documentation'),
    hint: 'Arrow keys move focus only. Press Enter or Space to activate.',
  },
  vertical: {
    label: 'Vertical (automatic)',
    options: { activationMode: 'automatic', orientation: 'vertical' },
    data: buildTabsData(planetsTabs, 'earth', 'Planets'),
    hint: 'Up/Down arrows navigate between tabs.',
  },
  scrollable: {
    label: 'Scrollable panels',
    options: { activationMode: 'automatic', orientation: 'horizontal', scrollable: true },
    data: buildTabsData(longTabs, 'danish', 'Pastries'),
    hint: 'Tabpanel is keyboard-focusable and scrollable (tabIndex=0).',
  },
  closeable: {
    label: 'Closeable tabs',
    options: { activationMode: 'manual', orientation: 'horizontal', closeable: true },
    data: buildTabsData(closeableTabs, 'inbox', 'Mailboxes'),
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

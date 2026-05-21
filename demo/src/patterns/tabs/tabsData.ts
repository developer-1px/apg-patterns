import { PatternDataSchema, reducePatternData, tabsDefinition, type PatternData, type PatternEvent, type PatternOptions } from '../../../../src/react'

type TabSpec = { key: string; label: string; panelLabel: string; content?: string }

type TabsViewOptions = PatternOptions & {
  activationMode: 'automatic' | 'manual'
  closeable?: boolean
  scrollable?: boolean
}

const buildTabsData = (tabs: readonly TabSpec[], activeKey: string, label = 'Sections'): PatternData => {
  const items: Record<string, { label: string; content?: string }> = {}
  for (const tab of tabs) {
    items[tab.key] = { label: tab.label }
    items[`${tab.key}Panel`] = tab.content ? { label: tab.panelLabel, content: tab.content } : { label: tab.panelLabel }
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
  { key: 'overview', label: 'Overview', panelLabel: 'Overview panel' },
  { key: 'code', label: 'Code', panelLabel: 'Code panel' },
  { key: 'audit', label: 'Audit', panelLabel: 'Audit panel' },
]

const planetsTabs: readonly TabSpec[] = [
  { key: 'mercury', label: 'Mercury', panelLabel: 'Mercury panel' },
  { key: 'venus', label: 'Venus', panelLabel: 'Venus panel' },
  { key: 'earth', label: 'Earth', panelLabel: 'Earth panel' },
  { key: 'mars', label: 'Mars', panelLabel: 'Mars panel' },
]

const scrollablePanelContent = 'Scrollable panel content. '.repeat(24)

const longTabs: readonly TabSpec[] = [
  {
    key: 'danish',
    label: 'Danish',
    panelLabel: 'Danish panel',
    content: scrollablePanelContent,
  },
  {
    key: 'cinnamon',
    label: 'Cinnamon Roll',
    panelLabel: 'Cinnamon Roll panel',
    content: scrollablePanelContent,
  },
  {
    key: 'donut',
    label: 'Donut',
    panelLabel: 'Donut panel',
    content: scrollablePanelContent,
  },
]

const closeableTabs: readonly TabSpec[] = [
  { key: 'inbox', label: 'Inbox', panelLabel: 'Inbox panel' },
  { key: 'drafts', label: 'Drafts', panelLabel: 'Drafts panel' },
  { key: 'sent', label: 'Sent', panelLabel: 'Sent panel' },
  { key: 'trash', label: 'Trash', panelLabel: 'Trash panel' },
]

export type TabsVariantKey = 'automatic' | 'manual' | 'vertical' | 'scrollable' | 'closeable'

interface TabsVariantSpec {
  label: string
  data: PatternData
  options: TabsViewOptions
}

export const tabsVariants: Record<TabsVariantKey, TabsVariantSpec> = {
  automatic: {
    label: 'Automatic activation',
    options: { activationMode: 'automatic', orientation: 'horizontal' },
    data: buildTabsData(docsTabs, 'overview', 'Documentation'),
  },
  manual: {
    label: 'Manual activation',
    options: { activationMode: 'manual', orientation: 'horizontal' },
    data: buildTabsData(docsTabs, 'overview', 'Documentation'),
  },
  vertical: {
    label: 'Vertical (automatic)',
    options: { activationMode: 'automatic', orientation: 'vertical' },
    data: buildTabsData(planetsTabs, 'earth', 'Planets'),
  },
  scrollable: {
    label: 'Scrollable panels',
    options: { activationMode: 'automatic', orientation: 'horizontal', scrollable: true },
    data: buildTabsData(longTabs, 'danish', 'Pastries'),
  },
  closeable: {
    label: 'Closeable tabs',
    options: { activationMode: 'manual', orientation: 'horizontal', closeable: true },
    data: buildTabsData(closeableTabs, 'inbox', 'Mailboxes'),
  },
}

export const tabsVariantItems = Object.entries(tabsVariants).map(([key, value]) => ({ key: key as TabsVariantKey, label: value.label }))

export const initialTabsVariant: TabsVariantKey = 'automatic'

export function reduceTabsDemoData(data: PatternData, event: PatternEvent, options: TabsViewOptions): PatternData {
  const next = reducePatternData(tabsDefinition, data, event)
  const activeKey = next.state?.activeKey
  if (event.type === 'navigate' && options.activationMode === 'automatic' && activeKey) {
    return reducePatternData(tabsDefinition, next, { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey })
  }
  return next
}

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

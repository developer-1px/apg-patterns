import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, reduceTabsDemoData, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { defineVariantDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const tabsDemoDefinition = {
  key: 'tabs',
  label: 'Tabs',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
  sources: {
    main: 'Tabs.tsx',
    entry: 'tabs/entry.tsx',
    data: ['tabsData.ts'],
    hooks: ['tabs/useTabsPattern.ts'],
    definition: 'tabs/definition.ts',
  },
  controls: {
    kind: 'listbox',
    orientation: 'horizontal',
    value: '$state.variant',
    items: '$model.variantItems',
    label: 'tabs variants',
    idPrefix: 'tabs-variant',
    onChange: '$actions.selectVariant',
  },
  view: {
    kind: 'component',
    component: 'Tabs',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
      options: '$state.options',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineVariantDemoPattern<TabsVariantKey>({
  definition: tabsDemoDefinition,
  initialVariant: initialTabsVariant,
  initialData: tabsVariants[initialTabsVariant].data,
  dataByVariant: (variant) => tabsVariants[variant].data,
  reduce: (variant, data, event) => event.type === 'close'
    ? closeTabInData(data, event.key)
    : reduceTabsDemoData(data, event, tabsVariants[variant].options),
  variantItems: tabsVariantItems,
  componentName: 'Tabs',
  component: Tabs,
  getStateValues: (variant) => ({ options: tabsVariants[variant].options }),
})

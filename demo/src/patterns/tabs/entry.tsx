import { reduceTabsData, type PatternData, type PatternEvent } from '../../../../src'
import { useVariantPatternDataHost } from '../../shared/demoHostState'
import { renderDataInspect } from '../../shared/inspect/index'
import { Tabs } from './Tabs'
import { closeTabInData, initialTabsVariant, tabsVariantItems, tabsVariants, type TabsVariantKey } from './tabsData'
import { defineDemoPattern, type DemoPatternDefinition } from '../../shared/demo-definition'

const tabsDemoDefinition = {
  key: 'tabs',
  label: 'Tabs',
  keyboardShortcuts: ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', 'Space', 'Delete'],
  sources: {
    main: 'Tabs.tsx',
    entry: 'tabs/entry.tsx',
    data: ['tabsData.ts'],
    hooks: ['tabs/useTabsPattern.ts'],
    runtime: ['tabs/runtime.ts', 'tabs/keyboard.ts', 'tabs/navigation.ts'],
    definition: 'tabs/definition.ts',
    extra: ['tabs/effects.ts', 'tabs/parts.ts', 'tabs/tabsReducer.ts', 'tabs/inspect.ts'],
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
    component: 'TabsPreview',
    props: {
      data: '$state.data',
      onEvent: '$actions.dispatchEvent',
    },
  },
} as const satisfies DemoPatternDefinition

export const entry = defineDemoPattern({
  definition: tabsDemoDefinition,
  useRuntime: (onEvent) => {
    const host = useVariantPatternDataHost<TabsVariantKey>(
      initialTabsVariant,
      tabsVariants[initialTabsVariant].data,
      (variant) => tabsVariants[variant].data,
      (_variant, data, event) => event.type === 'close'
        ? closeTabInData(data, event.key)
        : reduceTabsData(data, event),
    )
    const handleEvent = (event: PatternEvent) => {
      onEvent(event)
      host.dispatchEvent(event)
    }
    return {
      inspect: renderDataInspect(host.data),
      context: {
        values: {
          state: { variant: host.variant, data: host.data },
          model: { variantItems: tabsVariantItems },
        },
        actions: {
          selectVariant: host.selectVariant,
          dispatchEvent: handleEvent,
        },
        components: { TabsPreview },
      },
    }
  },
})

function TabsPreview({ data, onEvent }: { data: PatternData; onEvent: (event: PatternEvent) => void }) {
  return (
    <div className="grid gap-3">
      <Tabs data={data} onEvent={onEvent} />
    </div>
  )
}

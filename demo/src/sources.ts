import reactSource from '../../src/react.ts?raw'
import runtimeSource from '../../src/patterns/treeview/runtime.ts?raw'
import schemaSource from '../../src/schema.ts?raw'
import definitionSource from '../../src/patterns/treeview/definition.ts?raw'
import tabsDefinitionSource from '../../src/patterns/tabs/definition.ts?raw'
import tabsRuntimeSource from '../../src/patterns/tabs/runtime.ts?raw'
import sliderDefinitionSource from '../../src/patterns/slider/definition.ts?raw'
import demoSource from './App.tsx?raw'
import sliderSource from './Slider.tsx?raw'
import sourceTabsSource from './SourceTabs.tsx?raw'
import tabsSource from './Tabs.tsx?raw'
import treeSource from './Tree.tsx?raw'
import focusHookSource from './useTreeDomFocus.ts?raw'

export const sources = {
  'Tree React': treeSource,
  'Source Tabs': sourceTabsSource,
  'Tabs React': tabsSource,
  'Slider React': sliderSource,
  'focus hook': focusHookSource,
  'demo React': demoSource,
  'React adapter': reactSource,
  tabsRuntime: tabsRuntimeSource,
  tabsDefinition: tabsDefinitionSource,
  sliderDefinition: sliderDefinitionSource,
  runtime: runtimeSource,
  definition: definitionSource,
  schema: schemaSource,
}

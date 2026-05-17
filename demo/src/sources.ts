import reactSource from '../../src/react.ts?raw'
import runtimeSource from '../../src/treeviewRuntime.ts?raw'
import schemaSource from '../../src/schema.ts?raw'
import definitionSource from '../../src/treeviewDefinition.ts?raw'
import tabsDefinitionSource from '../../src/tabsDefinition.ts?raw'
import tabsRuntimeSource from '../../src/tabsRuntime.ts?raw'
import demoSource from './App.tsx?raw'
import sourceTabsSource from './SourceTabs.tsx?raw'
import treeSource from './Tree.tsx?raw'
import focusHookSource from './useTreeDomFocus.ts?raw'

export const sources = {
  'Tree React': treeSource,
  'Source Tabs': sourceTabsSource,
  'focus hook': focusHookSource,
  'demo React': demoSource,
  'React adapter': reactSource,
  tabsRuntime: tabsRuntimeSource,
  tabsDefinition: tabsDefinitionSource,
  runtime: runtimeSource,
  definition: definitionSource,
  schema: schemaSource,
}

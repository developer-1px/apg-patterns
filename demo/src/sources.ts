import gridDefinitionSource from '../../src/patterns/grid/definition.ts?raw'
import listboxDefinitionSource from '../../src/patterns/listbox/definition.ts?raw'
import sliderDefinitionSource from '../../src/patterns/slider/definition.ts?raw'
import tabsDefinitionSource from '../../src/patterns/tabs/definition.ts?raw'
import tabsRuntimeSource from '../../src/patterns/tabs/runtime.ts?raw'
import treeviewDefinitionSource from '../../src/patterns/treeview/definition.ts?raw'
import treeviewRuntimeSource from '../../src/patterns/treeview/runtime.ts?raw'
import patternKernelSource from '../../src/patternKernel.ts?raw'
import patternReducerSource from '../../src/patternReducer.ts?raw'
import patternRuntimeSource from '../../src/patternRuntime.ts?raw'
import reactSource from '../../src/react.ts?raw'
import schemaSource from '../../src/schema.ts?raw'
import gridSource from './Grid.tsx?raw'
import gridDataSource from './gridData.ts?raw'
import listboxSource from './Listbox.tsx?raw'
import listboxDataSource from './listboxData.ts?raw'
import sliderSource from './Slider.tsx?raw'
import sliderDataSource from './sliderData.ts?raw'
import tabsSource from './Tabs.tsx?raw'
import tabsDataSource from './tabsData.ts?raw'
import treeSource from './Tree.tsx?raw'
import demoDataSource from './demoData.ts?raw'
import focusHookSource from './useTreeDomFocus.ts?raw'
import type { PatternKey } from './patterns'

export const sources = {
  'Tree.tsx': treeSource,
  'useTreeDomFocus.ts': focusHookSource,
  'demoData.ts': demoDataSource,
  'Listbox.tsx': listboxSource,
  'listboxData.ts': listboxDataSource,
  'Grid.tsx': gridSource,
  'gridData.ts': gridDataSource,
  'Tabs.tsx': tabsSource,
  'tabsData.ts': tabsDataSource,
  'Slider.tsx': sliderSource,
  'sliderData.ts': sliderDataSource,
  'react.ts': reactSource,
  'treeview/runtime.ts': treeviewRuntimeSource,
  'treeview/definition.ts': treeviewDefinitionSource,
  'tabs/runtime.ts': tabsRuntimeSource,
  'tabs/definition.ts': tabsDefinitionSource,
  'listbox/definition.ts': listboxDefinitionSource,
  'grid/definition.ts': gridDefinitionSource,
  'slider/definition.ts': sliderDefinitionSource,
  'patternRuntime.ts': patternRuntimeSource,
  'patternReducer.ts': patternReducerSource,
  'patternKernel.ts': patternKernelSource,
  'schema.ts': schemaSource,
} as const

export type SourceName = keyof typeof sources

const sourceOrderByPattern = {
  treeview: ['Tree.tsx', 'useTreeDomFocus.ts', 'react.ts', 'treeview/runtime.ts', 'treeview/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts', 'demoData.ts'],
  listbox: ['Listbox.tsx', 'listboxData.ts', 'listbox/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
  grid: ['Grid.tsx', 'gridData.ts', 'grid/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
  tabs: ['Tabs.tsx', 'tabsData.ts', 'react.ts', 'tabs/runtime.ts', 'tabs/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
  slider: ['Slider.tsx', 'sliderData.ts', 'slider/definition.ts', 'patternRuntime.ts', 'patternReducer.ts', 'patternKernel.ts', 'schema.ts'],
} satisfies Record<PatternKey, readonly SourceName[]>

export function getSourceNames(patternKey: PatternKey): readonly SourceName[] {
  return sourceOrderByPattern[patternKey]
}

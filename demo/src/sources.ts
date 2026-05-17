import gridDefinitionSource from '../../src/patterns/grid/definition.ts?raw'
import listboxDefinitionSource from '../../src/patterns/listbox/definition.ts?raw'
import sliderDefinitionSource from '../../src/patterns/slider/definition.ts?raw'
import tabsDefinitionSource from '../../src/patterns/tabs/definition.ts?raw'
import tabsRuntimeSource from '../../src/patterns/tabs/runtime.ts?raw'
import treeviewDefinitionSource from '../../src/patterns/treeview/definition.ts?raw'
import treeviewRuntimeSource from '../../src/patterns/treeview/runtime.ts?raw'
import disclosureDefinitionSource from '../../src/patterns/disclosure/definition.ts?raw'
import disclosureRuntimeSource from '../../src/patterns/disclosure/runtime.ts?raw'
import checkboxDefinitionSource from '../../src/patterns/checkbox/definition.ts?raw'
import radioDefinitionSource from '../../src/patterns/radio/definition.ts?raw'
import menuDefinitionSource from '../../src/patterns/menu/definition.ts?raw'
import comboboxDefinitionSource from '../../src/patterns/combobox/definition.ts?raw'
import patternKernelSource from '../../src/patternKernel.ts?raw'
import patternReducerSource from '../../src/patternReducer.ts?raw'
import patternRuntimeSource from '../../src/patternRuntime.ts?raw'
import reactSource from '../../src/react.ts?raw'
import schemaSource from '../../src/schema.ts?raw'
import gridSource from './Grid.tsx?raw'
import gridDataSource from './gridData.ts?raw'
import listboxSource from './Listbox.tsx?raw'
import rearrangeableListboxSource from './RearrangeableListbox.tsx?raw'
import listboxDataSource from './listboxData.ts?raw'
import sliderSource from './Slider.tsx?raw'
import sliderDataSource from './sliderData.ts?raw'
import tabsSource from './Tabs.tsx?raw'
import tabsDataSource from './tabsData.ts?raw'
import treeSource from './Tree.tsx?raw'
import treeVariantsSource from './treeVariants.ts?raw'
import treeVariantMenuSource from './TreeVariantMenu.tsx?raw'
import disclosureSource from './Disclosure.tsx?raw'
import disclosureDataSource from './disclosureData.ts?raw'
import checkboxSource from './Checkbox.tsx?raw'
import checkboxDataSource from './checkboxData.ts?raw'
import radioSource from './RadioGroup.tsx?raw'
import radioDataSource from './radioData.ts?raw'
import menuSource from './Menu.tsx?raw'
import menuDataSource from './menuData.ts?raw'
import comboboxSource from './Combobox.tsx?raw'
import comboboxDataSource from './comboboxData.ts?raw'
import demoDataSource from './demoData.ts?raw'
import focusHookSource from './useTreeDomFocus.ts?raw'

export const sources = {
  'Tree.tsx': treeSource,
  'TreeVariantMenu.tsx': treeVariantMenuSource,
  'treeVariants.ts': treeVariantsSource,
  'useTreeDomFocus.ts': focusHookSource,
  'demoData.ts': demoDataSource,
  'Listbox.tsx': listboxSource,
  'RearrangeableListbox.tsx': rearrangeableListboxSource,
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
  'Disclosure.tsx': disclosureSource,
  'disclosureData.ts': disclosureDataSource,
  'disclosure/definition.ts': disclosureDefinitionSource,
  'disclosure/runtime.ts': disclosureRuntimeSource,
  'Checkbox.tsx': checkboxSource,
  'checkboxData.ts': checkboxDataSource,
  'checkbox/definition.ts': checkboxDefinitionSource,
  'RadioGroup.tsx': radioSource,
  'radioData.ts': radioDataSource,
  'radio/definition.ts': radioDefinitionSource,
  'Menu.tsx': menuSource,
  'menuData.ts': menuDataSource,
  'menu/definition.ts': menuDefinitionSource,
  'Combobox.tsx': comboboxSource,
  'comboboxData.ts': comboboxDataSource,
  'combobox/definition.ts': comboboxDefinitionSource,
  'patternRuntime.ts': patternRuntimeSource,
  'patternReducer.ts': patternReducerSource,
  'patternKernel.ts': patternKernelSource,
  'schema.ts': schemaSource,
} as const

export type SourceName = keyof typeof sources

import type { PatternEvent } from '../../src'
import { useCollectionDemoPatterns } from './collectionDemoPatterns'
import { type DemoPattern, type PatternKey } from './demoPatternTypes'
import { usePopupDemoPatterns } from './popupDemoPatterns'
import { useWidgetDemoPatterns } from './widgetDemoPatterns'

export type { DemoPattern, PatternKey } from './demoPatternTypes'

export const patternItems: readonly { key: PatternKey; label: string }[] = [
  { key: 'treeview', label: 'Treeview' },
  { key: 'listbox', label: 'Listbox' },
  { key: 'grid', label: 'Grid' },
  { key: 'tabs', label: 'Tabs' },
  { key: 'slider', label: 'Slider' },
  { key: 'disclosure', label: 'Disclosure' },
  { key: 'checkbox', label: 'Checkbox' },
  { key: 'radio', label: 'Radio Group' },
  { key: 'menuAndMenubar', label: 'Menu and Menubar' },
  { key: 'combobox', label: 'Combobox' },
]

export function useDemoPatterns(onEvent: (event: PatternEvent) => void): readonly DemoPattern[] {
  return [
    ...useCollectionDemoPatterns(onEvent),
    ...useWidgetDemoPatterns(onEvent),
    ...usePopupDemoPatterns(onEvent),
  ]
}

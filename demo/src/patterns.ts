export type PatternKey = 'treeview' | 'listbox' | 'grid' | 'tabs' | 'slider' | 'disclosure'

export const patternItems: readonly { key: PatternKey; label: string }[] = [
  { key: 'treeview', label: 'Treeview' },
  { key: 'listbox', label: 'Listbox' },
  { key: 'grid', label: 'Grid' },
  { key: 'tabs', label: 'Tabs' },
  { key: 'slider', label: 'Slider' },
  { key: 'disclosure', label: 'Disclosure' },
]

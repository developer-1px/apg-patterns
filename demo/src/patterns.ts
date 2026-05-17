export type PatternKey = 'treeview' | 'listbox' | 'grid'

export const patternItems: readonly { key: PatternKey; label: string }[] = [
  { key: 'treeview', label: 'Treeview' },
  { key: 'listbox', label: 'Listbox' },
  { key: 'grid', label: 'Grid' },
]

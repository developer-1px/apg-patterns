import type { ReactNode } from 'react'
import type { PatternEvent } from '../../src'
import type { SourceName } from './sources'

export const selectClass = 'h-7 rounded bg-zinc-50 px-2 text-xs text-zinc-700 outline-none focus:bg-white focus:outline focus:outline-2 focus:outline-zinc-400 dark:bg-zinc-900 dark:text-zinc-300 dark:focus:bg-zinc-950'

export type PatternKey = 'treeview' | 'listbox' | 'grid' | 'tabs' | 'slider' | 'disclosure' | 'checkbox' | 'radio' | 'menuAndMenubar' | 'combobox'

export interface DemoPattern {
  key: PatternKey
  label: string
  sourceNames: readonly SourceName[]
  keyboardShortcuts: readonly string[]
  inspect: string
  preview: ReactNode
  reset: () => void
  variants?: ReactNode
  inspectControls?: ReactNode
}

export type EmitPatternEvent = (event: PatternEvent) => void

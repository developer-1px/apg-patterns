import type { ReactNode } from 'react'
import type { PatternEvent } from '../../../src'
import type { SourceName } from './sources'

export const selectClass = 'h-8 rounded-lg bg-white/70 px-2.5 text-xs font-medium text-zinc-700 shadow-sm outline-none transition focus:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400 dark:bg-white/[0.06] dark:text-zinc-300 dark:focus:bg-white/[0.08] dark:focus-visible:outline-zinc-500'

export type PatternKey = string

export interface DemoPattern {
  key: PatternKey
  label: string
  sourceNames: readonly SourceName[]
  keyboardShortcuts: readonly string[]
  inspect: string
  preview: ReactNode
  variants?: ReactNode
  inspectControls?: ReactNode
}

export type EmitPatternEvent = (event: PatternEvent) => void

/** Kernel source keys included in every pattern's sourceNames list. */
export const KERNEL_SOURCES = [
  'kernel/patternRuntime.ts',
  'kernel/patternReducer.ts',
  'kernel/patternKernel.ts',
  'schema/index.ts',
] as const satisfies readonly SourceName[]

export interface PatternEntry {
  key: PatternKey
  label: string
  useDemoPattern: (onEvent: EmitPatternEvent) => DemoPattern
}

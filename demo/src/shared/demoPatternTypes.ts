import type { ReactNode } from 'react'
import type { PatternEvent } from '../../../src'
import { ds } from './designSystem'
import type { SourceName } from './sources'

export const selectClass = ds.field

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

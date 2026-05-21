import { z } from 'zod'
import { defaultPatternKey, defaultSourceName, patternItems, type PatternKey } from '../shared/demoPatterns'
import type { PatternEvent } from '../../../src/react'

export const rightModes = ['source', 'inspect', 'log'] as const
export const rightModeLabels: Record<(typeof rightModes)[number], string> = {
  source: 'code',
  inspect: 'state',
  log: 'events',
}

const AppStateSchema = z.object({
  patternKey: z.string(),
  events: z.array(z.custom<PatternEvent>()),
  sourceName: z.string(),
  rightMode: z.enum(rightModes),
  rightPanelOpen: z.boolean(),
}).strict()

export type AppState = z.infer<typeof AppStateSchema>

export type AppAction =
  | { type: 'selectPattern'; patternKey: PatternKey }
  | { type: 'recordEvent'; event: PatternEvent }
  | { type: 'clearEvents' }
  | { type: 'selectSource'; sourceName: string }
  | { type: 'selectRightMode'; rightMode: AppState['rightMode'] }
  | { type: 'toggleRightPanel' }
  | { type: 'restoreState'; state: AppState }

export const defaultAppState = AppStateSchema.parse({
  patternKey: defaultPatternKey,
  events: [],
  sourceName: defaultSourceName,
  rightMode: 'source',
  rightPanelOpen: true,
})

export const reduceAppState = (state: AppState, action: AppAction): AppState => {
  if (action.type === 'selectPattern') return AppStateSchema.parse({ ...state, patternKey: action.patternKey, events: [], sourceName: '' })
  if (action.type === 'recordEvent') return AppStateSchema.parse({ ...state, events: [action.event, ...state.events].slice(0, 12) })
  if (action.type === 'clearEvents') return AppStateSchema.parse({ ...state, events: [] })
  if (action.type === 'selectSource') return AppStateSchema.parse({ ...state, sourceName: action.sourceName })
  if (action.type === 'selectRightMode') return AppStateSchema.parse({ ...state, rightMode: action.rightMode, rightPanelOpen: true })
  if (action.type === 'restoreState') return AppStateSchema.parse(action.state)
  return AppStateSchema.parse({ ...state, rightPanelOpen: !state.rightPanelOpen })
}

export function readInitialAppState(fallback: AppState): AppState {
  if (typeof window === 'undefined') return fallback
  const params = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const patternKey = coercePatternKey(params.get('pattern')) ?? fallback.patternKey
  const rightMode = coerceRightMode(params.get('panel')) ?? fallback.rightMode
  const sourceName = params.get('source') || fallback.sourceName
  const rightPanelOpen = params.get('panel') === 'off' ? false : fallback.rightPanelOpen
  const state = AppStateSchema.parse({ ...fallback, patternKey, sourceName, rightMode, rightPanelOpen })
  const canonical = new URLSearchParams()
  canonical.set('pattern', state.patternKey)
  canonical.set('panel', state.rightPanelOpen ? rightModeLabels[state.rightMode] : 'off')
  canonical.set('source', state.sourceName)
  const variant = params.get('variant')
  if (variant && params.get('pattern') === state.patternKey) canonical.set('variant', variant)
  const canonicalHash = `#${canonical.toString()}`
  if (window.location.hash !== canonicalHash) window.history.replaceState(null, '', canonicalHash)
  return state
}

export function writeAppHash({
  patternKey,
  sourceName,
  rightMode,
  rightPanelOpen,
}: Pick<AppState, 'patternKey' | 'sourceName' | 'rightMode' | 'rightPanelOpen'>) {
  if (typeof window === 'undefined') return
  const currentParams = new URLSearchParams(window.location.hash.replace(/^#/, ''))
  const params = new URLSearchParams()
  params.set('pattern', patternKey)
  params.set('panel', rightPanelOpen ? rightModeLabels[rightMode] : 'off')
  params.set('source', sourceName)
  if (currentParams.get('pattern') === patternKey) {
    const variant = currentParams.get('variant')
    if (variant) params.set('variant', variant)
  }
  const nextHash = `#${params.toString()}`
  if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash)
}

function coercePatternKey(value: string | null): PatternKey | null {
  if (!value) return null
  return patternItems.some((item) => item.key === value) ? value : null
}

export function coerceRightMode(value: string | null): AppState['rightMode'] | null {
  if (!value || value === 'off') return null
  return rightModes.find((mode) => rightModeLabels[mode] === value) ?? null
}

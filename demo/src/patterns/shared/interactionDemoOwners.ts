import type {
  InteractionActionMap,
  InteractionKeyInput,
  InteractionOwner,
  InteractionOwnerId,
  InteractionTemporaryControlOptions,
  HandleInteractionKeyboardEventOptions,
  InteractionKeyboardEventRoute,
  InteractionPlatform,
} from '../../../../packages/interaction/src/runtime'
import {
  detectInteractionPlatform,
  handleInteractionKeyboardEvent,
  shellOwner,
  temporaryControl,
} from '../../../../packages/interaction/src/runtime'
import { listboxDefinition, reducePatternData, type PatternData, type PatternEvent } from '../../../../src/react'
import { reduceToolbarData } from '../toolbar/toolbarData'

const listboxKeys = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '])
const toolbarNavigationKeys = new Set(['ArrowRight', 'ArrowLeft', 'Home', 'End'])
const toolbarDelegatedListboxKeys = new Set(['ArrowDown', 'ArrowUp'])
const toolbarCommandKeys = new Set(['Enter', ' '])
type DemoToolbarKeyIntent = 'navigation' | 'delegate-listbox' | 'command' | 'restore-listbox'

export function commandPaletteShellOwner(ownerId: InteractionOwnerId): InteractionOwner {
  return shellOwner({
    id: ownerId,
    keys: [{ key: 'k', mod: 'primary', action: 'command-palette.open' }],
  })
}

export function handleDemoInteractionKeyboardEvent(
  options: HandleInteractionKeyboardEventOptions,
): InteractionKeyboardEventRoute {
  return handleInteractionKeyboardEvent({
    ...options,
    platform: options.platform ?? platformFromModifier(options.event),
    resolvePlatform: options.resolvePlatform ?? detectInteractionPlatform,
  })
}

export function commandPaletteTemporaryControl<TActions extends InteractionActionMap = InteractionActionMap>(
  options: InteractionTemporaryControlOptions<TActions>,
): InteractionOwner {
  return withCommandPaletteShortcut(temporaryControl(options))
}

function withCommandPaletteShortcut(owner: InteractionOwner): InteractionOwner {
  return {
    ...owner,
    allowsShellKey(input) {
      return owner.allowsShellKey?.(input) === true || isCommandPaletteShortcut(input)
    },
  }
}

export function isCommandPaletteShortcut(input: InteractionKeyInput): boolean {
  return (input.metaKey === true || input.ctrlKey === true) && input.key.toLowerCase() === 'k'
}

export function ownsDemoListboxKey(input: InteractionKeyInput): boolean {
  return listboxKeys.has(input.key)
}

export function reduceDemoListboxKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = demoListboxKeyEvent(data, input)
  return event ? reducePatternData(listboxDefinition, data, event) : data
}

export function ownsDemoToolbarKey(input: InteractionKeyInput): boolean {
  return getDemoToolbarKeyIntent(input) !== null
}

export function getDemoToolbarKeyIntent(input: InteractionKeyInput): DemoToolbarKeyIntent | null {
  if (toolbarNavigationKeys.has(input.key)) return 'navigation'
  if (toolbarDelegatedListboxKeys.has(input.key)) return 'delegate-listbox'
  if (toolbarCommandKeys.has(input.key)) return 'command'
  if (input.key === 'Escape') return 'restore-listbox'
  return null
}

export function reduceDemoToolbarKey(data: PatternData, input: InteractionKeyInput): PatternData {
  const event = demoToolbarKeyEvent(input)
  return event ? reduceToolbarData(data, event) : data
}

function demoListboxKeyEvent(data: PatternData, input: InteractionKeyInput): PatternEvent | null {
  const activeKey = data.state?.activeKey
  if (input.key === 'ArrowDown') return { type: 'navigate', direction: 'next', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowUp') return { type: 'navigate', direction: 'previous', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: 'first', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: 'last', meta: { reason: 'keyboard' } }
  if ((input.key === 'Enter' || input.key === ' ') && activeKey) {
    return { type: 'select', keys: [activeKey], anchorKey: activeKey, extentKey: activeKey, meta: { reason: 'keyboard' } }
  }
  return null
}

function demoToolbarKeyEvent(input: InteractionKeyInput): PatternEvent | null {
  if (input.key === 'ArrowRight') return { type: 'navigate', direction: 'next', meta: { reason: 'keyboard' } }
  if (input.key === 'ArrowLeft') return { type: 'navigate', direction: 'previous', meta: { reason: 'keyboard' } }
  if (input.key === 'Home') return { type: 'navigate', direction: 'first', meta: { reason: 'keyboard' } }
  if (input.key === 'End') return { type: 'navigate', direction: 'last', meta: { reason: 'keyboard' } }
  return null
}

function platformFromModifier(event: HandleInteractionKeyboardEventOptions['event']): InteractionPlatform | undefined {
  if (event.metaKey === true) return 'mac'
  if (event.ctrlKey === true) return 'windows'
  return undefined
}

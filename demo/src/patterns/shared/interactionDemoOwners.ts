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

export function withCommandPaletteShortcut(owner: InteractionOwner): InteractionOwner {
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

function platformFromModifier(event: HandleInteractionKeyboardEventOptions['event']): InteractionPlatform | undefined {
  if (event.metaKey === true) return 'mac'
  if (event.ctrlKey === true) return 'windows'
  return undefined
}

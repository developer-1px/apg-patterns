import type {
  InteractionActionMap,
  InteractionKeyInput,
  InteractionOwner,
  InteractionOwnerId,
  InteractionTemporaryControlOptions,
} from '../../../../packages/interaction/src/runtime'
import { shellOwner, temporaryControl } from '../../../../packages/interaction/src/runtime'

export function commandPaletteShellOwner(ownerId: InteractionOwnerId): InteractionOwner {
  return shellOwner({
    id: ownerId,
    keys: [{ key: 'k', mod: 'Meta', action: 'command-palette.open' }],
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
  return input.metaKey === true && input.key.toLowerCase() === 'k'
}

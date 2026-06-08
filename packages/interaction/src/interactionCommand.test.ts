import { describe, expect, it } from 'vitest'

import {
  compileInteractionCommandDefinitions,
  defineInteractionCommandDefinitions,
  getInteractionCommandBindingSummary,
} from './runtime'

describe('interaction command definitions', () => {
  it('keeps command definitions declarative and JSON round-trippable', () => {
    const definitions = defineInteractionCommandDefinitions([
      {
        action: { type: 'palette.open' },
        bindings: [{
          kind: 'keyboard',
          shortcut: { key: 'k', modifier: 'primary' },
        }],
        id: 'system:commandPalette',
        section: 'System',
        title: 'Command Palette',
      },
      {
        action: { type: 'shape.duplicate' },
        bindings: [{
          kind: 'pointer',
          pointer: { modifier: 'Alt', type: 'drag' },
        }],
        id: 'command:duplicate',
        section: 'Commands',
        title: 'Duplicate',
      },
    ])

    expect(JSON.parse(JSON.stringify(definitions))).toEqual(definitions)
  })

  it('compiles command bindings to display labels without owning execution', () => {
    const mappings = compileInteractionCommandDefinitions([
      {
        action: { type: 'palette.open' },
        bindings: [{
          enabled: true,
          kind: 'keyboard',
          shortcut: { key: 'k', modifier: 'primary' },
        }],
        id: 'system:commandPalette',
        section: 'System',
        title: 'Command Palette',
      },
      {
        action: { type: 'shape.duplicate' },
        bindings: [
          {
            enabled: false,
            kind: 'keyboard',
            shortcut: { key: 'd', modifier: 'primary' },
          },
          {
            enabled: true,
            kind: 'pointer',
            pointer: { modifier: 'Alt', type: 'drag' },
          },
        ],
        id: 'command:duplicate',
        section: 'Commands',
        title: 'Duplicate',
      },
    ], { platform: 'mac' })

    expect(mappings[0]?.bindings[0]?.label).toBe('Cmd+K')
    expect(getInteractionCommandBindingSummary({
      bindings: mappings[1]?.bindings ?? [],
      isBindingEnabled: (binding) => binding.enabled,
    })).toBe('Alt+Drag')
  })
})

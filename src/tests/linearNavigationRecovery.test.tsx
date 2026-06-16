import { describe, expect, it } from 'vitest'
import { moveApgLinear } from '../internal/collectionNavigation'
import { reducePatternData, type PatternData, type PatternDefinition } from '../index'

const definition = {
  apgPattern: 'linear-recovery',
  rootRole: 'listbox',
  containedRoles: ['option'],
  parts: {
    root: { role: 'listbox' },
    option: { role: 'option' },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {
      next: { kind: 'linear', action: 'next' },
      previous: { kind: 'linear', action: 'previous' },
      first: { kind: 'linear', action: 'first' },
      last: { kind: 'linear', action: 'last' },
    },
  },
  keyboard: [],
} satisfies PatternDefinition

const data = {
  items: {
    archived: { label: 'Archived' },
    open: { label: 'Open' },
    closed: { label: 'Closed' },
  },
  relations: { rootKeys: ['open', 'closed'] },
  state: { activeKey: 'archived' },
} satisfies PatternData

describe('linear navigation recovery', () => {
  it('recovers from an active key outside visible order', () => {
    expect(reducePatternData(definition, data, { type: 'navigate', direction: 'next' }).state?.activeKey).toBe('open')
    expect(reducePatternData(definition, data, { type: 'navigate', direction: 'previous' }).state?.activeKey).toBe('closed')
    expect(reducePatternData(definition, data, { type: 'navigate', direction: 'first' }).state?.activeKey).toBe('open')
    expect(reducePatternData(definition, data, { type: 'navigate', direction: 'last' }).state?.activeKey).toBe('closed')
  })

  it('uses availability filters while recovering', () => {
    const isAvailable = (item: string) => item === 'enabled'

    expect(moveApgLinear(['disabled', 'enabled'], 'missing', 'next', { isAvailable })).toBe('enabled')
    expect(moveApgLinear(['enabled', 'disabled'], 'missing', 'previous', { isAvailable })).toBe('enabled')
    expect(moveApgLinear(['disabled'], 'missing', 'next', { isAvailable })).toBeNull()
  })
})

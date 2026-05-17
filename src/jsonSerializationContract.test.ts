import { describe, expect, it, vi } from 'vitest'
import {
  PatternDataSchema,
  PatternDefinitionSchema,
  PatternEventSchema,
  PatternOptionsSchema,
  createPatternRuntime,
} from './index'

const validDefinition = {
  apgPattern: 'serializable',
  rootRole: 'listbox',
  parts: {
    listbox: { role: 'listbox' },
  },
  navigation: {
    visibleOrder: { kind: 'flat' },
    targets: {},
  },
  keyboard: [],
}

const validData = {
  items: { a: { label: 'A' } },
  relations: { rootKeys: ['a'] },
}

describe('JSON serialization contract', () => {
  it('accepts JSON extension values in data, options, events, and definitions', () => {
    expect(PatternDataSchema.parse({
      items: {
        a: {
          label: 'A',
          itemValue: { id: 'a', nested: [1, true, null] },
          metadata: { tags: ['x'] },
        },
      },
      state: {
        activeKey: 'a',
        custom: { count: 1, enabled: true },
      },
    })).toMatchObject({ items: { a: { label: 'A' } } })

    expect(PatternOptionsSchema.parse({ loop: true, pageSize: 10, labels: ['A'] })).toEqual({
      loop: true,
      pageSize: 10,
      labels: ['A'],
    })

    expect(PatternEventSchema.parse({ type: 'extension', name: 'x', payload: { nested: { ok: true } } })).toEqual({
      type: 'extension',
      name: 'x',
      payload: { nested: { ok: true } },
    })

    expect(PatternDefinitionSchema.parse({
      ...validDefinition,
      apgVersion: '1.2',
      navigation: {
        visibleOrder: { kind: 'flat', args: { includeDisabled: false } },
        targets: {
          next: { kind: 'linear', action: 'next' },
        },
      },
    })).toMatchObject({ apgPattern: 'serializable' })
  })

  it('rejects non-JSON values from all declarative extension holes', () => {
    expect(() =>
      PatternDataSchema.parse({
        items: { a: { itemValue: () => 'x' } },
      }),
    ).toThrow()

    expect(() =>
      PatternDataSchema.parse({
        items: { a: {} },
        state: { activeKey: 'a', custom: new Date('2026-05-17T00:00:00.000Z') },
      }),
    ).toThrow()

    expect(() => PatternOptionsSchema.parse({ resolver: () => 'x' })).toThrow()
    expect(() => PatternOptionsSchema.parse({ now: new Date('2026-05-17T00:00:00.000Z') })).toThrow()
    expect(() => PatternOptionsSchema.parse({ notFinite: Number.NaN })).toThrow()

    expect(() =>
      PatternEventSchema.parse({ type: 'extension', name: 'x', payload: { callback: () => 'x' } }),
    ).toThrow()

    expect(() =>
      PatternDefinitionSchema.parse({
        ...validDefinition,
        deriveLabel: () => 'x',
      }),
    ).toThrow()

    expect(() =>
      PatternDefinitionSchema.parse({
        ...validDefinition,
        navigation: {
          visibleOrder: { kind: 'flat', compute: () => ['a'] },
          targets: {},
        },
      }),
    ).toThrow()
  })

  it('validates runtime definitions at the boundary', () => {
    expect(() =>
      createPatternRuntime({
        definition: {
          ...validDefinition,
          runtimeOnly: () => undefined,
        } as never,
        data: validData,
        options: {},
        onEvent: vi.fn(),
      }),
    ).toThrow()
  })
})

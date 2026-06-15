import { describe, expect, it } from 'vitest'
import { reducePatternData, type PatternData, type PatternEvent } from '../index'
import { registerKernelBuiltins } from '../kernel/kernelBuiltins'
import { radioGroupDefinition } from '../patterns/radio/definition'

registerKernelBuiltins()

const baseData = {
  items: {
    a: { label: 'A' },
    b: { label: 'B' },
    c: { label: 'C' },
  },
  relations: { rootKeys: ['a', 'b', 'c'] },
  state: { activeKey: 'a', selectedKeys: ['a'], disabledKeys: [] },
} satisfies PatternData

function withState(state: NonNullable<PatternData['state']>): PatternData {
  return { ...baseData, state: { ...baseData.state, ...state } }
}

function navigate(data: PatternData, direction: Extract<PatternEvent, { type: 'navigate' }>['direction']): string | null | undefined {
  return reducePatternData(radioGroupDefinition, data, { type: 'navigate', direction }).state?.activeKey
}

describe('radio disabled navigation', () => {
  it('skips disabled radios for next and previous navigation', () => {
    expect(navigate(withState({ activeKey: 'a', disabledKeys: ['b'] }), 'next')).toBe('c')
    expect(navigate(withState({ activeKey: 'c', disabledKeys: ['b'] }), 'previous')).toBe('a')
  })

  it('skips disabled radios for first and last navigation', () => {
    expect(navigate(withState({ activeKey: 'c', disabledKeys: ['a'] }), 'first')).toBe('b')
    expect(navigate(withState({ activeKey: 'a', disabledKeys: ['c'] }), 'last')).toBe('b')
  })

  it('keeps active key unchanged when every radio is disabled', () => {
    const data = withState({ activeKey: 'b', disabledKeys: ['a', 'b', 'c'] })

    expect(navigate(data, 'next')).toBe('b')
    expect(navigate(data, 'first')).toBe('b')
  })
})

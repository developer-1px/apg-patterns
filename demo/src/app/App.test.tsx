import { describe, expect, it } from 'vitest'
import { coerceRightMode, formatEvent, loadSourcePreview } from './App'
import type { PatternEvent } from '../../../src'

describe('formatEvent', () => {
  it('keeps emitted events scannable in the demo log', () => {
    const event: PatternEvent = { type: 'expand', key: 'billing', expanded: true, meta: { reason: 'pointer' } }

    expect(formatEvent(event)).toBe('expand key=billing expanded=true via pointer')
  })

  it('formats array fields without falling back to raw JSON', () => {
    const event: PatternEvent = { type: 'select', keys: ['runtime', 'schema'], anchorKey: 'runtime', extentKey: 'schema' }

    expect(formatEvent(event)).toBe('select keys=[runtime,schema] anchorKey=runtime extentKey=schema')
  })
})

describe('coerceRightMode', () => {
  it('keeps legacy aria panel links working as state links', () => {
    expect(coerceRightMode('aria')).toBe('inspect')
    expect(coerceRightMode('state')).toBe('inspect')
  })

  it('treats off and unknown panels as no right panel', () => {
    expect(coerceRightMode('off')).toBeNull()
    expect(coerceRightMode('missing')).toBeNull()
  })
})

describe('loadSourcePreview', () => {
  it('returns a readable missing-source marker instead of throwing', async () => {
    await expect(loadSourcePreview('__missing__.tsx')).resolves.toBe('missing source: __missing__.tsx')
  })
})

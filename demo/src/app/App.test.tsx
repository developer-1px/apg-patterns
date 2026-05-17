import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { coerceRightMode, formatEvent, loadSourcePreview } from './App'
import { patternEntries } from '../shared/demoPatterns'
import { sourceLoaders } from '../shared/sources'
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

describe('demo source wiring', () => {
  it('connects every pattern source tab to a collected source file', () => {
    const missingSources: string[] = []

    render(<DemoSourceProbe onMissingSource={(sourceName) => missingSources.push(sourceName)} />)

    expect(missingSources).toEqual([])
  })

  it('exposes each collected pattern hook source from its demo source tabs', () => {
    const missingHookSources: string[] = []

    render(<DemoSourceProbe onMissingHookSource={(sourceName) => missingHookSources.push(sourceName)} />)

    expect(missingHookSources).toEqual([])
  })
})

function DemoSourceProbe({
  onMissingSource,
  onMissingHookSource = () => undefined,
}: {
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource?: (sourceName: string) => void
}) {
  return (
    <>
      {patternEntries.map((entry) => (
        <DemoSourceProbeItem key={entry.key} entry={entry} onMissingSource={onMissingSource} onMissingHookSource={onMissingHookSource} />
      ))}
    </>
  )
}

function DemoSourceProbeItem({
  entry,
  onMissingSource,
  onMissingHookSource,
}: {
  entry: (typeof patternEntries)[number]
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource: (sourceName: string) => void
}) {
  const demo = entry.useDemoPattern(() => undefined)
  for (const sourceName of demo.sourceNames) {
    if (!sourceLoaders[sourceName]) onMissingSource?.(`${entry.key}: ${sourceName}`)
  }
  for (const sourceName of expectedHookSources(entry.key)) {
    if (!demo.sourceNames.includes(sourceName)) onMissingHookSource(`${entry.key}: ${sourceName}`)
  }
  return null
}

function expectedHookSources(patternKey: string) {
  return Object.keys(sourceLoaders).filter((sourceName) => (
    sourceName.startsWith(`${patternKey}/`)
    && /\/use[A-Z].*Pattern\.ts$/.test(sourceName)
  ))
}

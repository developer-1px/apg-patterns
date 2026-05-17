import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { coerceRightMode, formatEvent, isCopyableSource, loadSourcePreview } from './App'
import { App } from './App'
import { patternEntries } from '../shared/demoPatterns'
import { sourceLoaders, sourceNameCollisions } from '../shared/sources'
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

describe('source copy', () => {
  it('only treats loaded source text as copyable', () => {
    expect(isCopyableSource('loading')).toBe(false)
    expect(isCopyableSource('missing source: Missing.tsx')).toBe(false)
    expect(isCopyableSource('export function Demo() {}')).toBe(true)
  })

  it('copies the loaded source text instead of transient loader text', async () => {
    const writes: string[] = []
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async (value: string) => { writes.push(value) } },
    })
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    const copyButton = screen.getByRole('button', { name: 'copy' })
    expect(copyButton).toHaveProperty('disabled', true)
    fireEvent.click(copyButton)
    expect(writes).toEqual([])

    await waitFor(() => expect(copyButton).toHaveProperty('disabled', false))
    fireEvent.click(copyButton)

    await waitFor(() => expect(writes).toHaveLength(1))
    expect(writes[0]).toContain('export function Accordion')
    expect(writes[0]).not.toBe('loading')
  })

  it('only shows copied after clipboard write succeeds', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: async () => { throw new Error('denied') } },
    })
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    const copyButton = screen.getByRole('button', { name: 'copy' })
    await waitFor(() => expect(copyButton).toHaveProperty('disabled', false))
    fireEvent.click(copyButton)

    await waitFor(() => expect(copyButton.textContent).toBe('copy'))
    expect(screen.queryByRole('button', { name: 'copied' })).toBeNull()
  })

  it('does not show copied for a stale source after switching source tabs', async () => {
    let resolveCopy: (() => void) | undefined
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText: () => new Promise<void>((resolve) => { resolveCopy = resolve }) },
    })
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    const copyButton = screen.getByRole('button', { name: 'copy' })
    await waitFor(() => expect(copyButton).toHaveProperty('disabled', false))
    fireEvent.click(copyButton)
    fireEvent.click(screen.getByRole('tab', { name: 'accordionData.ts' }))
    resolveCopy?.()

    await waitFor(() => expect(currentHashParam('source')).toBe('accordionData.ts'))
    expect(screen.queryByRole('button', { name: 'copied' })).toBeNull()
  })
})

describe('App route state', () => {
  it('normalizes legacy aria panel deep links to the state panel', async () => {
    replaceHash('#pattern=accordion&panel=aria&source=Accordion.tsx')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Accordion' })).toBeTruthy()
    await waitFor(() => expect(currentHashParam('panel')).toBe('state'))
    expect(screen.getByRole('tab', { name: 'state', selected: true })).toBeTruthy()
  })

  it('keeps panel=off deep links closed while preserving pattern and source state', async () => {
    replaceHash('#pattern=accordion&panel=off&source=Accordion.tsx')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Accordion' })).toBeTruthy()
    await waitFor(() => expect(window.location.hash).toContain('panel=off'))
    expect(currentHashParam('pattern')).toBe('accordion')
    expect(currentHashParam('source')).toBe('Accordion.tsx')
    expect(screen.queryByRole('tablist', { name: 'source files' })).toBeNull()
  })

  it('replaces invalid source deep links with the active pattern default source', async () => {
    replaceHash('#pattern=checkbox&panel=code&source=Missing.tsx')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Checkbox' })).toBeTruthy()
    await waitFor(() => expect(currentHashParam('source')).toBe('Checkbox.tsx'))
    expect(screen.getByTitle('Checkbox.tsx')).toBeTruthy()
    expect(screen.queryByText('missing source: Missing.tsx')).toBeNull()
  })

  it('recovers invalid deep links to a valid pattern, panel, and source route', async () => {
    replaceHash('#pattern=missing&panel=missing&source=Missing.tsx')

    render(<App />)

    expect(screen.getByRole('heading', { name: 'Treeview' })).toBeTruthy()
    await waitFor(() => expect(window.location.hash).toBe('#pattern=treeview&panel=code&source=Tree.tsx'))
    expect(screen.getByRole('tab', { name: 'code', selected: true })).toBeTruthy()
    expect(screen.getByTitle('Tree.tsx')).toBeTruthy()
    expect(screen.queryByText('missing source: Missing.tsx')).toBeNull()
  })

  it('restores demo state when the hash changes after initial render', async () => {
    replaceHash('#pattern=tabs&panel=code&source=Tabs.tsx')
    render(<App />)

    replaceHash('#pattern=accordion&panel=events&source=Accordion.tsx')
    window.dispatchEvent(new window.HashChangeEvent('hashchange'))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Accordion' })).toBeTruthy())
    expect(screen.getByRole('tab', { name: 'events', selected: true })).toBeTruthy()
    expect(screen.getByText('0 events')).toBeTruthy()
  })
})

describe('event log', () => {
  it('records pattern events and clears them explicitly', async () => {
    replaceHash('#pattern=accordion&panel=events&source=Accordion.tsx')

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Personal Information/ }))

    await waitFor(() => expect(screen.getByText('1 events')).toBeTruthy())
    expect(screen.getByText(/expand key=personal expanded=true via pointer/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'clear' }))

    expect(screen.getByText('0 events')).toBeTruthy()
    expect(screen.getByText('none')).toBeTruthy()
  })

  it('clears stale events when switching to another pattern', async () => {
    replaceHash('#pattern=accordion&panel=events&source=Accordion.tsx')

    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: /Personal Information/ }))
    await waitFor(() => expect(screen.getByText('1 events')).toBeTruthy())

    fireEvent.click(screen.getByRole('option', { name: 'Checkbox' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Checkbox' })).toBeTruthy())
    expect(screen.getByText('0 events')).toBeTruthy()
    expect(screen.getByText('none')).toBeTruthy()
  })
})

describe('demo pattern registry', () => {
  it('keeps pattern keys and labels unique for stable menus and deep links', () => {
    const keys = patternEntries.map((entry) => entry.key)
    const labels = patternEntries.map((entry) => entry.label)

    expect(duplicates(keys)).toEqual([])
    expect(duplicates(labels)).toEqual([])
    expect(keys).toEqual([...keys].sort((a, b) => a.localeCompare(b)))
  })

  it('uses valid, non-empty demo metadata for every registered pattern', () => {
    const invalidEntries: string[] = []

    render(<DemoSourceProbe onInvalidEntry={(issue) => invalidEntries.push(issue)} />)

    expect(invalidEntries).toEqual([])
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

  it('does not expose source tabs backed by colliding collected filenames', () => {
    const collidingSourceNames = new Set(sourceNameCollisions.map((collision) => collision.name))
    const exposedCollisions: string[] = []

    render(<DemoSourceProbe onCollidingSource={(sourceName) => exposedCollisions.push(sourceName)} collidingSourceNames={collidingSourceNames} />)

    expect(exposedCollisions).toEqual([])
  })
})

function DemoSourceProbe({
  onMissingSource,
  onMissingHookSource = () => undefined,
  onInvalidEntry = () => undefined,
  onCollidingSource = () => undefined,
  collidingSourceNames = new Set(),
}: {
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource?: (sourceName: string) => void
  onInvalidEntry?: (issue: string) => void
  onCollidingSource?: (sourceName: string) => void
  collidingSourceNames?: ReadonlySet<string>
}) {
  return (
    <>
      {patternEntries.map((entry) => (
        <DemoSourceProbeItem
          key={entry.key}
          entry={entry}
          onMissingSource={onMissingSource}
          onMissingHookSource={onMissingHookSource}
          onInvalidEntry={onInvalidEntry}
          onCollidingSource={onCollidingSource}
          collidingSourceNames={collidingSourceNames}
        />
      ))}
    </>
  )
}

function DemoSourceProbeItem({
  entry,
  onMissingSource,
  onMissingHookSource,
  onInvalidEntry,
  onCollidingSource,
  collidingSourceNames,
}: {
  entry: (typeof patternEntries)[number]
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource: (sourceName: string) => void
  onInvalidEntry: (issue: string) => void
  onCollidingSource: (sourceName: string) => void
  collidingSourceNames: ReadonlySet<string>
}) {
  const demo = entry.useDemoPattern(() => undefined)
  if (demo.key !== entry.key) onInvalidEntry(`${entry.key}: demo key ${demo.key}`)
  if (demo.label !== entry.label) onInvalidEntry(`${entry.key}: demo label ${demo.label}`)
  if (demo.sourceNames.length === 0) onInvalidEntry(`${entry.key}: no source tabs`)
  if (duplicates([...demo.sourceNames]).length > 0) onInvalidEntry(`${entry.key}: duplicate source tabs`)
  if (demo.keyboardShortcuts.some((shortcut) => shortcut.trim().length === 0)) onInvalidEntry(`${entry.key}: empty keyboard shortcut`)
  for (const sourceName of demo.sourceNames) {
    if (!sourceLoaders[sourceName]) onMissingSource?.(`${entry.key}: ${sourceName}`)
    if (collidingSourceNames.has(sourceName)) onCollidingSource(`${entry.key}: ${sourceName}`)
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

function duplicates(values: readonly string[]) {
  const seen = new Set<string>()
  const duplicateValues = new Set<string>()
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value)
    seen.add(value)
  }
  return [...duplicateValues]
}

function replaceHash(hash: string) {
  window.history.replaceState(null, '', hash)
}

function currentHashParam(name: string) {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name)
}

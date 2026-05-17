import { describe, expect, it } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act } from 'react'
import { coerceRightMode, formatEvent, isCopyableSource, loadSourcePreview } from './App'
import { App } from './App'
import { defaultPatternKey, defaultSourceName, patternEntries, validatePatternEntries } from '../shared/demoPatterns'
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

    await act(async () => {
      replaceHash('#pattern=accordion&panel=events&source=Accordion.tsx')
      window.dispatchEvent(new window.HashChangeEvent('hashchange'))
    })

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Accordion' })).toBeTruthy())
    expect(screen.getByRole('tab', { name: 'events', selected: true })).toBeTruthy()
    expect(screen.getByText('0 events')).toBeTruthy()
  })
})

describe('event log', () => {
  it('preserves the active preview state while inspecting code, state, and events', async () => {
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    const personalButton = screen.getByRole('button', { name: /Personal Information/ })
    fireEvent.click(personalButton)
    expect(personalButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'accordionData.ts' }))
    await waitFor(() => expect(currentHashParam('source')).toBe('accordionData.ts'))
    expect(personalButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'state' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('state'))
    expect(personalButton.getAttribute('aria-expanded')).toBe('true')

    fireEvent.click(screen.getByRole('tab', { name: 'events' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('events'))
    expect(personalButton.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByText('1 events')).toBeTruthy()
  })

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

  it('resets stale source state when switching patterns', async () => {
    replaceHash('#pattern=accordion&panel=code&source=accordionData.ts')

    render(<App />)

    await waitFor(() => expect(currentHashParam('source')).toBe('accordionData.ts'))
    fireEvent.click(screen.getByRole('option', { name: 'Checkbox' }))

    await waitFor(() => expect(currentHashParam('pattern')).toBe('checkbox'))
    expect(currentHashParam('source')).toBe('Checkbox.tsx')
    expect(screen.getByTitle('Checkbox.tsx')).toBeTruthy()
    expect(screen.queryByText('missing source: accordionData.ts')).toBeNull()
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

  it('does not expose internal collection metadata from pattern entries', () => {
    expect(patternEntries.some((entry) => 'sourcePath' in entry)).toBe(false)
  })

  it('keeps the default pattern registered for deep-link recovery', () => {
    expect(patternEntries.some((entry) => entry.key === defaultPatternKey)).toBe(true)
  })

  it('keeps the default source registered on the default pattern', () => {
    const invalidEntries: string[] = []

    render(<DemoSourceProbe onInvalidEntry={(issue) => invalidEntries.push(issue)} />)

    expect(invalidEntries.filter((issue) => issue.includes('default source'))).toEqual([])
  })

  it('fails fast when no pattern entries are registered', () => {
    expect(() => validatePatternEntries([])).toThrow('[demoPatterns] no pattern entries were registered')
  })

  it('fails fast on empty pattern keys and labels', () => {
    expect(() => validatePatternEntries([
      { key: '', label: 'Missing Key' },
      { key: 'missingLabel', label: ' ' },
    ])).toThrow('[demoPatterns] invalid pattern entries: empty key, empty label')
  })

  it('fails fast when pattern keys are not stable hash tokens', () => {
    expect(() => validatePatternEntries([
      { key: 'menu-and-menubar', label: 'Menu and Menubar' },
    ])).toThrow('[demoPatterns] invalid pattern entries: invalid key menu-and-menubar')
  })

  it('fails fast when a pattern entry key does not match its folder', () => {
    expect(() => validatePatternEntries([
      { key: 'wrongAccordion', label: 'Accordion', sourcePath: '../patterns/accordion/entry.tsx' },
    ])).toThrow('[demoPatterns] pattern folder/key mismatch: wrongAccordion: expected key accordion for ../patterns/accordion/entry.tsx')
  })

  it('allows explicit folder/key aliases for combined APG patterns', () => {
    expect(() => validatePatternEntries([
      { key: 'menuAndMenubar', label: 'Menu and Menubar', sourcePath: '../patterns/menu/entry.tsx' },
    ])).not.toThrow()
  })

  it('fails fast when the configured default pattern is not registered', () => {
    expect(() => validatePatternEntries([
      { key: 'accordion', label: 'Accordion' },
    ], { defaultPatternKey: 'treeview' })).toThrow('[demoPatterns] default pattern is not registered: treeview')
  })

  it('fails fast on duplicate pattern keys', () => {
    expect(() => validatePatternEntries([
      { key: 'accordion', label: 'Accordion' },
      { key: 'accordion', label: 'Duplicate Accordion' },
    ])).toThrow('[demoPatterns] duplicate pattern keys: accordion')
  })

  it('fails fast on duplicate pattern labels', () => {
    expect(() => validatePatternEntries([
      { key: 'accordion', label: 'Accordion' },
      { key: 'accordionCopy', label: 'Accordion' },
    ])).toThrow('[demoPatterns] duplicate pattern labels: Accordion')
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

  it('does not serve ambiguous source names from the source registry', () => {
    const servedCollisions = sourceNameCollisions
      .map((collision) => collision.name)
      .filter((name) => sourceLoaders[name])

    expect(servedCollisions).toEqual([])
  })

  it('loads every exposed source tab as non-empty source text', async () => {
    const exposedSourceNames = new Set<string>()
    const failedSources: string[] = []

    render(<DemoSourceProbe onSourceName={(sourceName) => exposedSourceNames.add(sourceName)} />)

    await Promise.all([...exposedSourceNames].map(async (sourceName) => {
      try {
        const source = await sourceLoaders[sourceName]?.()
        if (!source || source.trim().length === 0) failedSources.push(sourceName)
      } catch {
        failedSources.push(sourceName)
      }
    }))

    expect(failedSources).toEqual([])
  })
})

function DemoSourceProbe({
  onMissingSource,
  onMissingHookSource = () => undefined,
  onInvalidEntry = () => undefined,
  onCollidingSource = () => undefined,
  onSourceName = () => undefined,
  collidingSourceNames = new Set(),
}: {
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource?: (sourceName: string) => void
  onInvalidEntry?: (issue: string) => void
  onCollidingSource?: (sourceName: string) => void
  onSourceName?: (sourceName: string) => void
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
          onSourceName={onSourceName}
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
  onSourceName,
  collidingSourceNames,
}: {
  entry: (typeof patternEntries)[number]
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource: (sourceName: string) => void
  onInvalidEntry: (issue: string) => void
  onCollidingSource: (sourceName: string) => void
  onSourceName: (sourceName: string) => void
  collidingSourceNames: ReadonlySet<string>
}) {
  const demo = entry.useDemoPattern(() => undefined)
  if (demo.key !== entry.key) onInvalidEntry(`${entry.key}: demo key ${demo.key}`)
  if (demo.label !== entry.label) onInvalidEntry(`${entry.key}: demo label ${demo.label}`)
  if (demo.sourceNames.length === 0) onInvalidEntry(`${entry.key}: no source tabs`)
  if (entry.key === defaultPatternKey && !demo.sourceNames.includes(defaultSourceName)) onInvalidEntry(`${entry.key}: missing default source ${defaultSourceName}`)
  if (duplicates([...demo.sourceNames]).length > 0) onInvalidEntry(`${entry.key}: duplicate source tabs`)
  if (demo.keyboardShortcuts.some((shortcut) => shortcut.trim().length === 0)) onInvalidEntry(`${entry.key}: empty keyboard shortcut`)
  for (const sourceName of demo.sourceNames) {
    onSourceName(sourceName)
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

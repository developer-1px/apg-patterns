import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { act, useState } from 'react'
import { coerceRightMode, formatEvent, isCopyableSource, isSourceLoadFailure, loadSourcePreview } from './App'
import { App } from './App'
import { SourceTabs, useSourceTabs } from './SourceTabs'
import { collectPatternEntries, defaultPatternKey, defaultSourceName, patternEntries, useDemoPattern, validatePatternEntries } from '../shared/demoPatterns'
import { sourceLoaders, sourceNameCollisions } from '../shared/sources'
import type { PatternEvent } from '../../../src'

afterEach(() => {
  cleanup()
})

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

  it('returns a readable failed-source marker when a registered loader throws', async () => {
    await expect(loadSourcePreview('Broken.tsx', {
      'Broken.tsx': async () => {
        throw new Error('broken loader')
      },
    })).resolves.toBe('failed source: Broken.tsx')
  })
})

describe('source copy', () => {
  it('only treats loaded source text as copyable', () => {
    expect(isCopyableSource('loading')).toBe(false)
    expect(isCopyableSource('missing source: Missing.tsx')).toBe(false)
    expect(isCopyableSource('failed source: Broken.tsx')).toBe(false)
    expect(isCopyableSource('export function Demo() {}')).toBe(true)
  })

  it('classifies source load failures by prefix', () => {
    expect(isSourceLoadFailure('missing source: Missing.tsx')).toBe(true)
    expect(isSourceLoadFailure('failed source: Broken.tsx')).toBe(true)
    expect(isSourceLoadFailure('export function Demo() {}')).toBe(false)
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

    await waitFor(() => expect(copyButton.getAttribute('aria-label')).toBe('copy'))
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
    expect(screen.queryByRole('tablist', { name: 'right panel' })).toBeNull()
    expect(screen.queryByRole('tabpanel')).toBeNull()
  })

  it('restores the previous source panel state when the right panel is reopened', async () => {
    replaceHash('#pattern=accordion&panel=code&source=accordionData.ts')

    render(<App />)

    await waitFor(() => expect(currentHashParam('source')).toBe('accordionData.ts'))
    expect(screen.getByTitle('accordionData.ts')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'code' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('off'))
    expect(screen.queryByRole('tablist', { name: 'source files' })).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'code' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('code'))
    expect(currentHashParam('source')).toBe('accordionData.ts')
    expect(screen.getByTitle('accordionData.ts')).toBeTruthy()
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

  it('mounts every registered pattern from its deep link with a real source tab', async () => {
    const routes = collectPatternRoutes()

    for (const route of routes) {
      replaceHash(routeHash(route))
      const { unmount } = render(<App />)

      expect(screen.getByRole('heading', { name: route.label })).toBeTruthy()
      await waitFor(() => expect(currentHashParam('pattern')).toBe(route.key))
      expect(currentHashParam('source')).toBe(route.sourceName)
      expect(screen.getByTitle(route.sourceName)).toBeTruthy()
      expect(screen.queryByText(`missing source: ${route.sourceName}`)).toBeNull()
      expect(document.querySelector(`[data-demo-preview="${route.key}"]`)?.getAttribute('aria-keyshortcuts')).toBe(route.keyboardShortcuts.join(' ') || null)
      await expectActiveSourceText(route.sourceName)

      unmount()
    }
  }, 15000)

  it('opens every pattern entry source from its deep link', async () => {
    const routes = collectPatternEntrySourceRoutes()

    for (const route of routes) {
      replaceHash(routeHash(route))
      const { unmount } = render(<App />)

      expect(screen.getByRole('heading', { name: route.label })).toBeTruthy()
      await waitFor(() => expect(currentHashParam('pattern')).toBe(route.key))
      expect(window.location.hash).toContain(`source=${encodeURIComponent(route.sourceName)}`)
      expect(currentHashParam('source')).toBe(route.sourceName)
      expect(screen.getByTitle(route.sourceName)).toBeTruthy()
      await expectActiveSourceText(route.sourceName)

      unmount()
    }
  }, 15000)

  it('keeps generated source tab ids and panel links unique for each pattern', async () => {
    const routes = collectPatternRoutes()

    for (const route of routes) {
      replaceHash(routeHash(route))
      const { unmount } = render(<App />)

      await waitFor(() => expect(currentHashParam('pattern')).toBe(route.key))
      const sourceTabs = screen.getAllByRole('tab').filter((tab) => tab.closest('[aria-label="source files"]'))
      const tabIds = sourceTabs.map((tab) => tab.id)
      const controlledPanelIds = sourceTabs.map((tab) => tab.getAttribute('aria-controls') ?? '')
      const selectedSourceTab = sourceTabs.find((tab) => tab.getAttribute('aria-selected') === 'true')
      const sourcePanel = getSourcePanel()

      expect(duplicates(tabIds)).toEqual([])
      expect(duplicates(controlledPanelIds)).toEqual([])
      expect(controlledPanelIds.every((id) => id.startsWith('tab-source-panel-'))).toBe(true)
      expect(selectedSourceTab?.getAttribute('aria-controls')).toBe(sourcePanel.id)
      expect(sourcePanel.getAttribute('aria-labelledby')).toBe(selectedSourceTab?.id)

      unmount()
    }
  }, 15000)

  it('links the selected right panel tab to the rendered right panel content', async () => {
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    await waitFor(() => expect(currentHashParam('panel')).toBe('code'))
    const selectedRightPanelTab = screen.getAllByRole('tab')
      .filter((tab) => tab.closest('[aria-label="right panel"]'))
      .find((tab) => tab.getAttribute('aria-selected') === 'true')
    const panelId = selectedRightPanelTab?.getAttribute('aria-controls')
    const rightPanel = panelId ? document.getElementById(panelId) : null

    expect(selectedRightPanelTab?.textContent).toBe('code')
    expect(rightPanel).toBeTruthy()
    expect(rightPanel?.getAttribute('aria-labelledby')).toBe(selectedRightPanelTab?.id)
    expect(rightPanel?.textContent).toContain('Accordion.tsx')
  })
})

describe('SourceTabs', () => {
  it('keeps distinct source names distinct even when slug-style ids would collide', () => {
    render(<SourceTabsCollisionProbe />)

    const tabs = screen.getAllByRole('tab')
    const tabIds = tabs.map((tab) => tab.id)
    const panelIds = tabs.map((tab) => tab.getAttribute('aria-controls') ?? '')

    expect(duplicates(tabIds)).toEqual([])
    expect(duplicates(panelIds)).toEqual([])
  })

  it('ArrowRight moves DOM focus to the selected tab', () => {
    render(<SourceTabsFocusProbe />)

    const first = screen.getByRole('tab', { name: 'One.tsx' })
    const second = screen.getByRole('tab', { name: 'Two.tsx' })

    first.focus()
    fireEvent.keyDown(screen.getByRole('tablist', { name: 'source files' }), { key: 'ArrowRight', code: 'ArrowRight' })

    expect(second.getAttribute('aria-selected')).toBe('true')
    expect(document.activeElement).toBe(second)
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

  it('does not record source or inspection navigation as pattern events', async () => {
    replaceHash('#pattern=accordion&panel=code&source=Accordion.tsx')

    render(<App />)

    fireEvent.click(screen.getByRole('tab', { name: 'accordionData.ts' }))
    await waitFor(() => expect(currentHashParam('source')).toBe('accordionData.ts'))

    fireEvent.click(screen.getByRole('tab', { name: 'state' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('state'))

    fireEvent.click(screen.getByRole('tab', { name: 'events' }))
    await waitFor(() => expect(currentHashParam('panel')).toBe('events'))

    expect(screen.getByText('0 events')).toBeTruthy()
    expect(screen.getByText('none')).toBeTruthy()
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

  it('keeps the event log bounded to the newest 12 entries', async () => {
    replaceHash('#pattern=accordion&panel=events&source=Accordion.tsx')

    render(<App />)

    const personalButton = screen.getByRole('button', { name: /Personal Information/ })
    for (let index = 0; index < 13; index += 1) fireEvent.click(personalButton)

    await waitFor(() => expect(screen.getByText('12 events')).toBeTruthy())

    const eventLogText = getVisibleLogPanel().textContent ?? ''
    const eventRows = eventLogText.split('\n').filter(Boolean)

    expect(eventRows).toHaveLength(12)
    expect(eventRows[0]).toContain('expanded=true')
    expect(eventRows.at(-1)).toContain('expanded=false')
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
  it('fails fast when a collected pattern module does not export entry', () => {
    expect(() => collectPatternEntries({
      '../patterns/accordion/entry.tsx': {
        entry: { key: 'accordion', label: 'Accordion', useDemoPattern: () => { throw new Error('unused') } },
      },
      '../patterns/missing/entry.tsx': {},
    })).toThrow('[demoPatterns] pattern modules missing exported entry: ../patterns/missing/entry.tsx')
  })

  it('keeps collected pattern modules sorted by key for stable menus', () => {
    const entries = collectPatternEntries({
      '../patterns/treeview/entry.tsx': {
        entry: { key: 'treeview', label: 'Treeview', useDemoPattern: () => { throw new Error('unused') } },
      },
      '../patterns/accordion/entry.tsx': {
        entry: { key: 'accordion', label: 'Accordion', useDemoPattern: () => { throw new Error('unused') } },
      },
    })

    expect(entries.map((entry) => entry.key)).toEqual(['accordion', 'treeview'])
  })

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

  it('fails fast instead of falling back when internal code requests an unknown pattern', () => {
    expect(() => useDemoPattern('__missing__', () => undefined)).toThrow('[demoPatterns] unknown pattern key: __missing__')
  })
})

describe('demo source wiring', () => {
  it('loads the default source as real source text', async () => {
    const source = await sourceLoaders[defaultSourceName]?.()

    expect(source).toContain('export function Tree')
  })

  it('opens each pattern on a real demo component source by default', async () => {
    const defaultSources: string[] = []
    const invalidDefaultSources: string[] = []

    render(<DemoSourceProbe onDefaultSource={(issue) => defaultSources.push(issue)} />)

    await Promise.all(defaultSources.map(async (defaultSource) => {
      const [patternKey, sourceName] = defaultSource.split(': ')
      const componentName = sourceName?.replace(/\.tsx$/, '')
      const source = sourceName ? await sourceLoaders[sourceName]?.() : undefined

      if (!sourceName?.endsWith('.tsx') || !source?.includes(`export function ${componentName}`)) {
        invalidDefaultSources.push(`${patternKey}: ${sourceName ?? 'none'}`)
      }
    }))

    expect(invalidDefaultSources).toEqual([])
  })

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

  it('exposes each pattern entry source so demo wiring can be inspected', () => {
    const missingEntrySources: string[] = []

    render(<DemoSourceProbe onMissingEntrySource={(sourceName) => missingEntrySources.push(sourceName)} />)

    expect(missingEntrySources).toEqual([])
  })

  it('exposes each pattern definition source so APG wiring can be inspected', () => {
    const missingDefinitionSources: string[] = []

    render(<DemoSourceProbe onMissingDefinitionSource={(sourceName) => missingDefinitionSources.push(sourceName)} />)

    expect(missingDefinitionSources).toEqual([])
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

  it('does not report the same source file as a collision with itself', () => {
    const duplicateCollisionPaths = sourceNameCollisions.flatMap((collision) => (
      duplicates([...collision.paths]).map((path) => `${collision.name}: ${path}`)
    ))

    expect(duplicateCollisionPaths).toEqual([])
  })

  it('keeps source registry diagnostics deterministic', () => {
    const collisionNames = sourceNameCollisions.map((collision) => collision.name)

    expect(collisionNames).toEqual([...collisionNames].sort((a, b) => a.localeCompare(b)))
    for (const collision of sourceNameCollisions) {
      expect(collision.paths).toEqual([...collision.paths].sort((a, b) => a.localeCompare(b)))
    }

    const sourceNames = Object.keys(sourceLoaders)

    expect(sourceNames).toEqual([...sourceNames].sort((a, b) => a.localeCompare(b)))
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
  onMissingEntrySource = () => undefined,
  onMissingDefinitionSource = () => undefined,
  onInvalidEntry = () => undefined,
  onCollidingSource = () => undefined,
  onSourceName = () => undefined,
  onDefaultSource = () => undefined,
  collidingSourceNames = new Set(),
}: {
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource?: (sourceName: string) => void
  onMissingEntrySource?: (sourceName: string) => void
  onMissingDefinitionSource?: (sourceName: string) => void
  onInvalidEntry?: (issue: string) => void
  onCollidingSource?: (sourceName: string) => void
  onSourceName?: (sourceName: string) => void
  onDefaultSource?: (sourceName: string) => void
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
          onMissingEntrySource={onMissingEntrySource}
          onMissingDefinitionSource={onMissingDefinitionSource}
          onInvalidEntry={onInvalidEntry}
          onCollidingSource={onCollidingSource}
          onSourceName={onSourceName}
          onDefaultSource={onDefaultSource}
          collidingSourceNames={collidingSourceNames}
        />
      ))}
    </>
  )
}

function SourceTabsCollisionProbe() {
  const tabs = ['foo/bar.ts', 'foo-2fbar.ts'] as const
  const sourceTabs = useSourceTabs({
    label: 'source files',
    tabs,
    value: tabs[0],
    onChange: () => undefined,
  })

  return <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
}

function SourceTabsFocusProbe() {
  const tabs = ['One.tsx', 'Two.tsx'] as const
  const [value, setValue] = useState<(typeof tabs)[number]>(tabs[0])
  const sourceTabs = useSourceTabs({
    label: 'source files',
    tabs,
    value,
    onChange: setValue,
  })

  return <SourceTabs tabs={sourceTabs.tabs} getTablistProps={sourceTabs.getTablistProps} getTabProps={sourceTabs.getTabProps} />
}

function DemoSourceProbeItem({
  entry,
  onMissingSource,
  onMissingHookSource,
  onMissingEntrySource,
  onMissingDefinitionSource,
  onInvalidEntry,
  onCollidingSource,
  onSourceName,
  onDefaultSource,
  collidingSourceNames,
}: {
  entry: (typeof patternEntries)[number]
  onMissingSource?: (sourceName: string) => void
  onMissingHookSource: (sourceName: string) => void
  onMissingEntrySource: (sourceName: string) => void
  onMissingDefinitionSource: (sourceName: string) => void
  onInvalidEntry: (issue: string) => void
  onCollidingSource: (sourceName: string) => void
  onSourceName: (sourceName: string) => void
  onDefaultSource: (sourceName: string) => void
  collidingSourceNames: ReadonlySet<string>
}) {
  const demo = entry.useDemoPattern(() => undefined)
  if (demo.key !== entry.key) onInvalidEntry(`${entry.key}: demo key ${demo.key}`)
  if (demo.label !== entry.label) onInvalidEntry(`${entry.key}: demo label ${demo.label}`)
  if (demo.sourceNames.length === 0) onInvalidEntry(`${entry.key}: no source tabs`)
  onDefaultSource(`${entry.key}: ${demo.sourceNames[0] ?? 'none'}`)
  if (entry.key === defaultPatternKey && !demo.sourceNames.includes(defaultSourceName)) onInvalidEntry(`${entry.key}: missing default source ${defaultSourceName}`)
  if (duplicates([...demo.sourceNames]).length > 0) onInvalidEntry(`${entry.key}: duplicate source tabs`)
  if (demo.inspect.trim().length === 0) onInvalidEntry(`${entry.key}: empty inspect output`)
  if (demo.keyboardShortcuts.some((shortcut) => shortcut.trim().length === 0)) onInvalidEntry(`${entry.key}: empty keyboard shortcut`)
  if (duplicates([...demo.keyboardShortcuts]).length > 0) onInvalidEntry(`${entry.key}: duplicate keyboard shortcuts`)
  for (const shortcut of demo.keyboardShortcuts) {
    if (!isValidShortcut(shortcut)) onInvalidEntry(`${entry.key}: invalid keyboard shortcut ${shortcut}`)
  }
  for (const sourceName of demo.sourceNames) {
    onSourceName(sourceName)
    if (!sourceLoaders[sourceName]) onMissingSource?.(`${entry.key}: ${sourceName}`)
    if (collidingSourceNames.has(sourceName)) onCollidingSource(`${entry.key}: ${sourceName}`)
  }
  for (const sourceName of expectedHookSources(entry.key)) {
    if (!demo.sourceNames.includes(sourceName)) onMissingHookSource(`${entry.key}: ${sourceName}`)
  }
  const entrySource = expectedEntrySource(entry.key)
  if (!demo.sourceNames.includes(entrySource)) onMissingEntrySource(`${entry.key}: ${entrySource}`)
  const definitionSource = expectedDefinitionSource(entry.key)
  if (!demo.sourceNames.includes(definitionSource)) onMissingDefinitionSource(`${entry.key}: ${definitionSource}`)
  return null
}

function collectPatternRoutes() {
  const routes: { key: string; label: string; sourceName: string; keyboardShortcuts: readonly string[] }[] = []

  render(<PatternRouteProbe onRoute={(route) => routes.push(route)} />).unmount()

  return routes
}

function collectPatternEntrySourceRoutes() {
  return patternEntries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    sourceName: expectedEntrySource(entry.key),
  }))
}

function PatternRouteProbe({
  onRoute,
}: {
  onRoute: (route: { key: string; label: string; sourceName: string; keyboardShortcuts: readonly string[] }) => void
}) {
  return (
    <>
      {patternEntries.map((entry) => (
        <PatternRouteProbeItem key={entry.key} entry={entry} onRoute={onRoute} />
      ))}
    </>
  )
}

function PatternRouteProbeItem({
  entry,
  onRoute,
}: {
  entry: (typeof patternEntries)[number]
  onRoute: (route: { key: string; label: string; sourceName: string; keyboardShortcuts: readonly string[] }) => void
}) {
  const demo = entry.useDemoPattern(() => undefined)
  onRoute({ key: entry.key, label: entry.label, sourceName: demo.sourceNames[0], keyboardShortcuts: demo.keyboardShortcuts })
  return null
}

function expectedHookSources(patternKey: string) {
  return Object.keys(sourceLoaders).filter((sourceName) => (
    sourceName.startsWith(`${patternKey}/`)
    && /\/use[A-Z].*Pattern\.ts$/.test(sourceName)
  ))
}

function expectedEntrySource(patternKey: string) {
  return `${patternKey === 'menuAndMenubar' ? 'menu' : patternKey}/entry.tsx`
}

function expectedDefinitionSource(patternKey: string) {
  return `${patternKey === 'menuAndMenubar' ? 'menu' : patternKey}/definition.ts`
}

const validShortcutModifiers = new Set(['Alt', 'Ctrl', 'Meta', 'Shift'])
const validShortcutKeys = new Set([
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'Delete',
  'End',
  'Enter',
  'Escape',
  'F2',
  'Home',
  'PageDown',
  'PageUp',
  'Space',
  'Tab',
])

function isValidShortcut(shortcut: string) {
  const parts = shortcut.split('+')
  const key = parts.at(-1)
  const modifiers = parts.slice(0, -1)

  if (!key) return false

  return validShortcutKeys.has(key)
    && modifiers.length === new Set(modifiers).size
    && modifiers.every((modifier) => validShortcutModifiers.has(modifier))
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

function routeHash({ key, sourceName }: { key: string; sourceName: string }) {
  const params = new URLSearchParams()
  params.set('pattern', key)
  params.set('panel', 'code')
  params.set('source', sourceName)
  return `#${params.toString()}`
}

async function expectActiveSourceText(sourceName: string) {
  const expectedSource = await sourceLoaders[sourceName]?.()
  if (!expectedSource) throw new Error(`missing source loader for ${sourceName}`)

  await waitFor(() => {
    expect(getSourcePanel().textContent).toBe(expectedSource)
  })
}

function getSourcePanel() {
  const selectedSourceTab = screen.getAllByRole('tab')
    .filter((tab) => tab.closest('[aria-label="source files"]'))
    .find((tab) => tab.getAttribute('aria-selected') === 'true')
  const panelId = selectedSourceTab?.getAttribute('aria-controls')
  const sourcePanel = panelId ? document.getElementById(panelId) : null
  if (!sourcePanel) throw new Error('missing source panel')
  return sourcePanel
}

function getVisibleLogPanel() {
  const logPanel = Array.from(document.querySelectorAll('pre'))
    .find((panel) => panel.textContent?.includes('expand key='))
  if (!logPanel) throw new Error('missing log panel')
  return logPanel
}

function currentHashParam(name: string) {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name)
}

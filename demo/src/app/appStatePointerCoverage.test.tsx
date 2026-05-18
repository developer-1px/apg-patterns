import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { defaultAppState, readInitialAppState, reduceAppState, writeAppHash } from './appState'
import { readVariantRoute, writeVariantRoute } from '../shared/variantRoute'

afterEach(() => {
  vi.unstubAllGlobals()
})

function AppStateHost() {
  const [result, setResult] = useState('')

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          window.history.replaceState(null, '', '#pattern=accordion&panel=state&source=Accordion.tsx&variant=faq')
          const state = readInitialAppState(defaultAppState)
          setResult([state.patternKey, state.rightMode, state.sourceName, window.location.hash.includes('variant=faq')].join('|'))
        }}
      >
        Read canonical hash
      </button>
      <button
        type="button"
        onClick={() => {
          window.history.replaceState(null, '', '#pattern=accordion&variant=faq')
          writeAppHash({ ...defaultAppState, patternKey: 'accordion', sourceName: 'Accordion.tsx', rightMode: 'inspect', rightPanelOpen: false })
          setResult(window.location.hash)
        }}
      >
        Write closed hash
      </button>
      <button
        type="button"
        onClick={() => {
          window.history.replaceState(null, '', '#pattern=accordion&panel=code')
          const state = readInitialAppState(defaultAppState)
          setResult([state.patternKey, state.rightMode, state.sourceName, window.location.hash].join('|'))
        }}
      >
        Read fallback hash
      </button>
      <button
        type="button"
        onClick={() => {
          window.history.replaceState(null, '', '#pattern=accordion&panel=code&source=Accordion.tsx')
          writeAppHash({ ...defaultAppState, patternKey: 'accordion', sourceName: 'Accordion.tsx', rightMode: 'source', rightPanelOpen: true })
          setResult(window.location.hash)
        }}
      >
        Write same hash
      </button>
      <button
        type="button"
        onClick={() => {
          vi.stubGlobal('window', undefined)
          const state = readInitialAppState(defaultAppState)
          writeAppHash(defaultAppState)
          vi.unstubAllGlobals()
          setResult(state.patternKey)
        }}
      >
        Windowless app state
      </button>
      <button
        type="button"
        onClick={() => {
          window.history.replaceState(null, '', '#pattern=treeview&variant=files')
          const before = readVariantRoute('accordion') ?? 'null'
          writeVariantRoute('accordion', 'faq')
          const afterMismatch = window.location.hash
          window.history.replaceState(null, '', '#pattern=accordion')
          writeVariantRoute('accordion', 'faq')
          const afterWrite = readVariantRoute('accordion') ?? 'null'
          setResult([before, afterMismatch, afterWrite].join('|'))
        }}
      >
        Variant route edges
      </button>
      <button
        type="button"
        onClick={() => {
          vi.stubGlobal('window', undefined)
          writeVariantRoute('accordion', 'faq')
          const route = String(readVariantRoute('accordion'))
          vi.unstubAllGlobals()
          setResult(route)
        }}
      >
        Windowless variant route
      </button>
      <button
        type="button"
        onClick={() => {
          const restored = reduceAppState(defaultAppState, { type: 'restoreState', state: { ...defaultAppState, rightPanelOpen: false } })
          const toggled = reduceAppState(restored, { type: 'toggleRightPanel' })
          setResult(String(toggled.rightPanelOpen))
        }}
      >
        Restore and toggle
      </button>
      <output data-testid="app-state-result">{result}</output>
    </div>
  )
}

describe('app state coverage from pointer input', () => {
  it('covers hash and reducer branches from clicks', () => {
    render(<AppStateHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Read canonical hash' }))
    expect(screen.getByText('accordion|inspect|Accordion.tsx|true')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Write closed hash' }))
    expect(screen.getByText(/panel=off/)).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Read fallback hash' }))
    expect(screen.getByTestId('app-state-result').textContent).toContain('accordion|source|')

    fireEvent.click(screen.getByRole('button', { name: 'Write same hash' }))
    expect(screen.getByText('#pattern=accordion&panel=code&source=Accordion.tsx')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Variant route edges' }))
    expect(screen.getByText('null|#pattern=treeview&variant=files|faq')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Restore and toggle' }))
    expect(screen.getByText('true')).toBeTruthy()
  })

  it('covers windowless guards from clicks', () => {
    render(<AppStateHost />)

    fireEvent.click(screen.getByRole('button', { name: 'Windowless app state' }))
    expect(screen.getByText(defaultAppState.patternKey)).toBeTruthy()

    vi.unstubAllGlobals()
    fireEvent.click(screen.getByRole('button', { name: 'Windowless variant route' }))
    expect(screen.getByText('null')).toBeTruthy()
  })
})

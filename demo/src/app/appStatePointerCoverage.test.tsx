import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { defaultAppState, readInitialAppState, reduceAppState, writeAppHash } from './appState'

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
          const restored = reduceAppState(defaultAppState, { type: 'restoreState', state: { ...defaultAppState, rightPanelOpen: false } })
          const toggled = reduceAppState(restored, { type: 'toggleRightPanel' })
          setResult(String(toggled.rightPanelOpen))
        }}
      >
        Restore and toggle
      </button>
      <output>{result}</output>
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

    fireEvent.click(screen.getByRole('button', { name: 'Restore and toggle' }))
    expect(screen.getByText('true')).toBeTruthy()
  })
})

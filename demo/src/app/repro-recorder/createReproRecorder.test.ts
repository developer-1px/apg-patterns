import { afterEach, describe, expect, it } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { createReproRecorder } from './createReproRecorder'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('createReproRecorder', () => {
  it('records input, ARIA tree diffs, pattern events, and current file context', async () => {
    document.body.innerHTML = `
      <div data-demo-preview="accordion">
        <button id="personal" aria-expanded="false">Personal Information</button>
      </div>
    `
    const button = document.getElementById('personal') as HTMLButtonElement
    const recorder = createReproRecorder()

    recorder.start()
    button.focus()
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    await nextFrame()

    button.setAttribute('aria-expanded', 'true')
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    window.dispatchEvent(new CustomEvent('apg-pattern-event', {
      detail: {
        event: { type: 'expand', key: 'personal', expanded: true, meta: { reason: 'pointer' } },
        patternKey: 'accordion',
        sourceName: 'Accordion.tsx',
        rightMode: 'source',
      },
    }))
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true }))
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Meta', metaKey: true, shiftKey: true, bubbles: true }))
    await nextFrame()

    const recording = recorder.stop()

    expect(recording.text).toContain('- button "Personal Information" [expanded=false')
    expect(recording.text).toContain('+ - button "Personal Information" [expanded')
    expect(recording.text).toContain('expand: personal.expanded=true (accordion / Accordion.tsx / code)')
    expect(recording.text).not.toContain('Shift+Shift')
    expect(recording.text).not.toContain('Mod+Shift+Meta')
  })

  it('records focus, route, console, active descendant, controlled popup, and prevented input details', async () => {
    document.body.innerHTML = `
      <div data-demo-preview="combobox" data-component="Combobox">
        <div data-inspector-line="Combobox.tsx:42">
          <input
            id="city"
            aria-label="City"
            aria-controls="city-list"
            aria-activedescendant="sf"
            aria-expanded="false"
          />
        </div>
      </div>
      <ul id="city-list" role="listbox" aria-label="Cities">
        <li id="sf" role="option" aria-selected="true">San Francisco</li>
        <li id="ny" role="option">New York</li>
      </ul>
    `
    const input = document.getElementById('city') as HTMLInputElement
    const recorder = createReproRecorder()

    recorder.start()
    input.focus()
    await nextFrame()

    input.addEventListener('keydown', (event) => event.preventDefault(), { once: true })
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' })
    input.setAttribute('aria-expanded', 'true')
    document.getElementById('ny')?.setAttribute('aria-selected', 'true')
    fireEvent.click(document.getElementById('ny') as HTMLElement)
    console.warn('recorded warning', { detail: 'visible' })
    history.pushState(null, '', '#recording')
    window.dispatchEvent(new PopStateEvent('popstate'))
    await nextFrame()

    const recording = recorder.stop()

    expect(recording.text).toContain('keydown ArrowDown')
    expect(recording.text).toContain('prevented')
    expect(recording.text).toContain('Combobox (Combobox.tsx:42)')
    expect(recording.text).toContain('activedescendant=sf "San Francisco"')
    expect(recording.text).toContain('role="listbox"')
    expect(recording.text).toContain('warn: recorded warning')
    expect(recording.text).toContain('route pushState:')
  })
})

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

import { afterEach, describe, expect, it, vi } from 'vitest'
import { fireEvent } from '@testing-library/react'
import { createReproRecorder } from './createReproRecorder'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
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

    fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' })
    fireEvent.click(button)
    recorder.start()
    recorder.start()
    button.focus()
    button.focus()
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    await nextFrame()

    button.setAttribute('aria-expanded', 'true')
    fireEvent.click(button)
    window.dispatchEvent(new CustomEvent('apg-pattern-event', {
      detail: {
        event: { type: 'expand', key: 'personal', expanded: true, meta: { reason: 'pointer' } },
        patternKey: 'accordion',
        sourceName: 'Accordion.tsx',
        rightMode: 'source',
      },
    }))
    for (const event of [
      { type: 'focus', key: 'personal' },
      { type: 'navigate', direction: 'next' },
      { type: 'select', key: 'personal', keys: ['personal'], anchorKey: 'personal', extentKey: 'personal' },
      { type: 'selectAll' },
      { type: 'selectColumn' },
      { type: 'selectRow' },
      { type: 'extendSelection', direction: 'next' },
      { type: 'expandActiveRow', expanded: true },
      { type: 'check', key: 'personal', checked: true },
      { type: 'press', key: 'personal' },
      { type: 'value', key: 'personal', value: 2 },
      { type: 'activate', key: 'personal' },
      { type: 'dismiss' },
    ] as const) {
      window.dispatchEvent(new CustomEvent('apg-pattern-event', { detail: { event } }))
    }
    history.replaceState(null, '', '#replace')
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    fireEvent.keyDown(button, { key: 'Shift', code: 'ShiftLeft' })
    fireEvent.keyDown(button, { key: 'Meta', code: 'MetaLeft', metaKey: true, shiftKey: true })
    await nextFrame()

    const recording = recorder.stop()
    fireEvent.click(button)

    expect(recording.text).toContain('- button "Personal Information" [expanded=false')
    expect(recording.text).toContain('+ - button "Personal Information" [expanded')
    expect(recording.text).toContain('expand: personal.expanded=true (accordion / Accordion.tsx / code)')
    expect(recording.text).toContain('focus: activeKey=personal')
    expect(recording.text).toContain('navigate: direction=next')
    expect(recording.text).toContain('select: selectedKeys=personal')
    expect(recording.text).toContain('selectAll: selectAll')
    expect(recording.text).toContain('selectColumn: selectColumn')
    expect(recording.text).toContain('selectRow: selectRow')
    expect(recording.text).toContain('extendSelection: direction=next')
    expect(recording.text).toContain('expandActiveRow: activeRow.expanded=true')
    expect(recording.text).toContain('check: personal.checked=true')
    expect(recording.text).toContain('press: personal.pressed=true')
    expect(recording.text).toContain('value: personal.value=2')
    expect(recording.text).toContain('activate: activate=personal')
    expect(recording.text).toContain('dismiss: dismiss')
    expect(recording.text).toContain('route replaceState:')
    expect(recording.text).not.toContain('Shift+Shift')
    expect(recording.text).not.toContain('Mod+Shift+Meta')
  })

  it('records focus, route, console, active descendant, and controlled popup details', async () => {
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
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const recorder = createReproRecorder()

    recorder.start()
    input.focus()
    await nextFrame()

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
    expect(recording.text).toContain('Combobox (Combobox.tsx:42)')
    expect(recording.text).toContain('< active-descendant')
    expect(recording.text).toContain('- listbox "Cities"')
    expect(recording.text).toContain('warn: recorded warning')
    expect(recording.text).toContain('route pushState:')
  })
})

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

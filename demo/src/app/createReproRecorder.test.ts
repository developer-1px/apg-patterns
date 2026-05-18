import { afterEach, describe, expect, it } from 'vitest'
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
        rightMode: 'events',
      },
    }))
    await nextFrame()

    const recording = recorder.stop()

    expect(recording.text).toContain('- button "Personal Information" [expanded=false')
    expect(recording.text).toContain('+ - button "Personal Information" [expanded')
    expect(recording.text).toContain('expand: personal.expanded=true (accordion / Accordion.tsx / events)')
  })
})

function nextFrame(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

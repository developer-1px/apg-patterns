import { afterEach, describe, expect, it } from 'vitest'
import {
  previewSurfaceIsMounted,
  verifyVariantControls,
  verifyPreviewKeyboardShortcuts,
  verifyPreviewSurface,
  verifyPreviewSurfaceRegistry,
} from './verifyPreviewSurfaces.mjs'

afterEach(() => {
  document.body.innerHTML = ''
})

describe('verifyPreviewSurfaceRegistry', () => {
  it('reports missing and stale preview metadata', () => {
    const patternFailures = []

    verifyPreviewSurfaceRegistry({
      patternKeys: ['accordion', 'missingPattern'],
      expectedKeyboardShortcutsByPattern: new Map([
        ['accordion', ['Enter']],
        ['stalePattern', ['Space']],
      ]),
      patternFailures,
    })

    expect(patternFailures).toContain('missingPattern: missing preview smoke selector')
    expect(patternFailures).toContain('missingPattern: missing keyboard shortcut metadata smoke fixture')
    expect(patternFailures).toContain('stalePattern: stale keyboard shortcut metadata smoke fixture')
  })
})

describe('verifyPreviewSurface', () => {
  it('accepts exactly one populated preview with the expected surface', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button"><button type="button">Save</button></div>'

    verifyPreviewSurface({ key: 'button', label: 'Button', patternFailures })

    expect(patternFailures).toEqual([])
    expect(previewSurfaceIsMounted('button')).toBe(true)
  })

  it('reports stale preview containers and missing expected surface', () => {
    const patternFailures = []
    document.body.innerHTML = [
      '<div data-demo-preview="button"><span>Save</span></div>',
      '<div data-demo-preview="tabs"><div role="tablist"></div></div>',
    ].join('')

    verifyPreviewSurface({ key: 'button', label: 'Button', patternFailures })

    expect(patternFailures).toContain('Button: stale preview containers rendered: button, tabs')
    expect(patternFailures).toContain('Button: preview did not render expected surface: button')
    expect(previewSurfaceIsMounted('button')).toBe(false)
  })

  it('reports missing selector, missing container, duplicate containers, and empty previews', () => {
    const patternFailures = []

    verifyPreviewSurface({ key: 'unknownPattern', label: 'Unknown', patternFailures })
    document.body.innerHTML = ''
    verifyPreviewSurface({ key: 'button', label: 'Button missing', patternFailures })
    document.body.innerHTML = [
      '<div data-demo-preview="button"></div>',
      '<div data-demo-preview="button"><button type="button">Save</button></div>',
    ].join('')
    verifyPreviewSurface({ key: 'button', label: 'Button duplicate', patternFailures })

    expect(patternFailures).toContain('Unknown: missing preview smoke selector')
    expect(patternFailures).toContain('Button missing: missing preview container')
    expect(patternFailures).toContain('Button duplicate: rendered duplicate preview containers')
    expect(patternFailures).toContain('Button duplicate: preview container rendered empty')
  })
})

describe('verifyPreviewKeyboardShortcuts', () => {
  it('checks rendered aria-keyshortcuts against entry metadata', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button" aria-keyshortcuts="Enter Space" tabindex="0"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button',
      expectedKeyboardShortcutsByPattern: new Map([['button', ['Enter', 'Space']]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([])
  })

  it('reports shortcut drift between rendered preview and metadata', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button" aria-keyshortcuts="Enter" tabindex="0"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button',
      expectedKeyboardShortcutsByPattern: new Map([['button', ['Enter', 'Space']]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([
      'Button: preview aria-keyshortcuts mismatch: expected=Enter Space, actual=Enter',
    ])
  })

  it('reports shortcuts that are not reachable through normal keyboard focus', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button" aria-keyshortcuts="Enter Space" tabindex="-1"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button',
      expectedKeyboardShortcutsByPattern: new Map([['button', ['Enter', 'Space']]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([
      'Button: preview aria-keyshortcuts are not keyboard-discoverable',
    ])
  })

  it('reports missing shortcut metadata and accepts empty shortcut metadata', () => {
    const patternFailures = []
    document.body.innerHTML = '<div data-demo-preview="button"><button type="button">Save</button></div>'

    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button missing',
      expectedKeyboardShortcutsByPattern: new Map(),
      patternFailures,
    })
    verifyPreviewKeyboardShortcuts({
      key: 'button',
      label: 'Button empty',
      expectedKeyboardShortcutsByPattern: new Map([['button', []]]),
      patternFailures,
    })

    expect(patternFailures).toEqual([
      'Button missing: missing demo entry keyboard shortcut metadata',
    ])
  })
})

describe('verifyVariantControls', () => {
  it('checks variant listbox keyboard and mouse selection paths', async () => {
    const patternFailures = []
    window.location.hash = '#pattern=button'
    document.body.innerHTML = `
      <div data-demo-preview="button">
        <button type="button">Save</button>
      </div>
      <div role="listbox" aria-label="Button variants">
        <div id="primary" role="option" tabindex="0" aria-selected="true">Primary</div>
        <div id="secondary" role="option" tabindex="-1" aria-selected="false">Secondary</div>
      </div>
    `
    const options = Array.from(document.querySelectorAll('[role="option"]'))
    document.querySelector('[role="listbox"]').addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowDown') return
      options[0].setAttribute('aria-selected', 'false')
      options[1].setAttribute('aria-selected', 'true')
      options[1].focus()
    })
    for (const option of options) {
      option.addEventListener('click', () => {
        options.forEach((next) => next.setAttribute('aria-selected', String(next === option)))
      })
    }

    await verifyVariantControls({
      key: 'button',
      label: 'Button',
      dom: { window },
      waitFor,
      currentHashParam,
      patternFailures,
    })

    expect(patternFailures).toEqual([])
  })

  it('reports empty and unresponsive variant controls', async () => {
    const patternFailures = []
    window.location.hash = '#pattern=button'
    document.body.innerHTML = `
      <div data-demo-preview="button">
        <button type="button">Save</button>
      </div>
      <div role="listbox" aria-label="Empty variants"></div>
      <div role="listbox" aria-label="Frozen variants">
        <div id="frozen-a" role="option" aria-selected="true">Frozen A</div>
        <div id="frozen-b" role="option" aria-selected="false">Frozen B</div>
      </div>
    `

    await verifyVariantControls({
      key: 'button',
      label: 'Button',
      dom: { window },
      waitFor: async (check) => {
        if (!check()) throw new Error('condition not met')
      },
      currentHashParam,
      patternFailures,
    })

    expect(patternFailures).toContain('Button: Empty variants has no options')
    expect(patternFailures).toContain('Button: Frozen variants keyboard navigation did not select and focus the next option')
    expect(patternFailures).toContain('Button: Frozen variants option did not select: Frozen B')
  })

  it('checks unselected single-option variant controls and fallback labels', async () => {
    const patternFailures = []
    window.location.hash = '#pattern=button'
    document.body.innerHTML = `
      <div data-demo-preview="button">
        <button type="button">Save</button>
      </div>
      <div role="listbox" aria-label="Sparse variants">
        <div role="option" aria-selected="false"></div>
      </div>
    `
    const option = document.querySelector('[role="option"]')
    option.addEventListener('click', () => option.setAttribute('aria-selected', 'true'))

    await verifyVariantControls({
      key: 'button',
      label: 'Button',
      dom: { window },
      waitFor,
      currentHashParam,
      patternFailures,
    })

    expect(patternFailures).toEqual([])
  })
})

async function waitFor(check) {
  for (let i = 0; i < 3; i += 1) {
    if (check()) return
    await Promise.resolve()
  }
  throw new Error('condition not met')
}

function currentHashParam(name) {
  return new URLSearchParams(window.location.hash.replace(/^#/, '')).get(name)
}
